# Importação automática do feed Awin via Vercel Cron — design

> Backlog item 1 (PLAN.md). Aprovado em 2026-07-15: catálogo completo com
> limite de renderização por página; cron diário às 06:00 BRT.

## Objetivo

Fechar o ciclo feed → banco → site sem passo manual: um job diário baixa o
datafeed da KaBuM na Awin, importa para o Neon (com a expiração de 2026-07-14)
e regenera as páginas SSG — sem CSV manual e sem novo deploy.

## Decisões

- **Catálogo completo**: o feed automático tem ~5.476 produtos (~4.000 após o
  mapeamento de categorias) vs. 190 do export manual filtrado. Importamos
  tudo — a busca cobre o catálogo inteiro — e limitamos a **renderização** da
  página de categoria aos 60 mais recentes (paginação fica no backlog).
- **Revalidação in-app** (não deploy hook): a rota do cron roda dentro do
  próprio Next, então chama `revalidatePath("/", "layout")` após importar —
  páginas SSG são regeneradas na próxima visita. Zero build extra.
- **Feed por URL autenticada** (`AWIN_FEED_URL`): URL de download da Awin com
  colunas customizadas (as mesmas do import manual: deep link, nome, id,
  imagem, descrições, categoria, preços, estoque), `format/csv`,
  `compression/gzip`. Gunzip nativo via `node:zlib`.
- **Proteção da rota**: só aceita `Authorization: Bearer ${CRON_SECRET}`
  (header que a Vercel envia automaticamente em invocações de cron).
- **Região das functions**: `gru1` (São Paulo), colada no Neon `sa-east-1` —
  importa mais rápido e melhora a busca dinâmica.

## Componentes

1. **`src/server/awin-import.ts`** (novo) — núcleo extraído de
   `scripts/import-awin.ts`: `importAwinFeed(csv, { cleanDemo })` com parse,
   normalização (`htmlToPlainText`, preço antigo, categoria), upserts com
   concorrência limitada (pool ~10; 4k produtos ≈ minutos, não horas),
   expiração e estatísticas. Normalização de linha exportada pura (testável).
2. **`scripts/import-awin.ts`** — vira casca fina: lê o CSV local
   (`data/private/awin-kabum.csv`) e chama o núcleo. Mantém `--clean-demo`.
3. **`src/app/api/cron/import-awin/route.ts`** (novo) — `GET`: valida o
   Bearer, baixa `AWIN_FEED_URL`, gunzip, chama o núcleo,
   `revalidatePath("/", "layout")`, responde JSON com as estatísticas.
   `maxDuration = 300`.
4. **`vercel.json`** (novo) — `crons: [{ path, schedule: "0 9 * * *" }]`
   (09:00 UTC = 06:00 BRT; Hobby roda 1x/dia com precisão ~1h) e
   `regions: ["gru1"]`.
5. **Limite de renderização** — `PrismaDealsRepository.getDealsByCategory`
   e `searchDeals` com `take: 60` (constante documentada).

## Variáveis de ambiente (novas)

| Nome            | Onde        | Conteúdo                             |
| --------------- | ----------- | ------------------------------------ |
| `AWIN_FEED_URL` | Vercel prod | URL de download do feed (tem apikey) |
| `CRON_SECRET`   | Vercel prod | Aleatório (32 bytes hex)             |

## Erros e observabilidade

- Sem `AWIN_FEED_URL`/`CRON_SECRET` → 500/401 com mensagem clara.
- Download ou parse falhou → 502 com o erro; banco intocado (o import só
  roda com o CSV inteiro em mãos; a expiração só apaga após upserts OK).
- Estatísticas (`importadas`, `expiradas`, `comDescricao`…) no JSON de
  resposta e no log da function (visível em `vercel logs`).

## Testes

- Unit: normalização de linha do feed (categoria, preços, descrição) no
  módulo novo — o resto do núcleo é integração com banco, validado por
  execução real (import completo + contagens no Neon).
- E2E: chamar a rota deployada com o Bearer e conferir estatísticas +
  regeneração das páginas.

## Fora de escopo

Paginação de categoria, multi-loja (backlog 2), `price_history` (backlog 3),
alertas de falha do cron (se virar necessidade, e-mail/webhook depois).
