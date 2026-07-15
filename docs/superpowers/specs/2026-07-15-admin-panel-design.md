# Painel /admin, ofertas manuais, filtros e paginação — design

> Aprovado em 2026-07-15. Três etapas (A → B → C), cada uma com gate completo
> (`typecheck` + `lint` + `test` + `build`), commit e deploy verificado.
> Decisões do usuário: login por e-mail; imagem por hotlink; filtros = loja +
> faixa de preço + ordenação; paginação numerada (`?page=N`).

## Etapa A — Autenticação admin (própria, sobre o Prisma)

- **Schema**: `model Admin { id, email @unique, passwordHash, createdAt, updatedAt }`.
- **Senha**: `crypto.scrypt` do Node (sem dependência nova), formato
  `scrypt$N$salt$hash`, comparação com `timingSafeEqual`.
- **Sessão**: JWT HS256 via `jose` (única dependência nova) em cookie
  `httpOnly` + `Secure` + `SameSite=Lax`, 7 dias, segredo na env
  `AUTH_SECRET` (prod + dev).
- **Rotas**: `/admin` = login (público, oculto — sem link no site, `noindex`
  via metadata; **sem** entrada no robots.txt para não anunciar a rota).
  `/admin/*` demais páginas protegidas.
- **Guarda dupla**: `proxy.ts` (middleware Next 16) valida o JWT e redireciona
  para `/admin` sem sessão; o layout do grupo protegido revalida a sessão no
  servidor (defesa em profundidade). Mutações via Server Actions revalidam a
  sessão de novo.
- **Menu admin**: Ofertas · Nova oferta · Admins · Trocar senha · Sair.
- **Telas da etapa A**: login; trocar senha (senha atual + nova, mín. 8
  chars); admins (listar + cadastrar novo com e-mail/senha; não permitir
  apagar o próprio usuário logado — sem gestão de exclusão nesta etapa).
- **Seed**: script `scripts/create-admin.ts` (e-mail + senha por argumento)
  cria `gutohenrique28@gmail.com` com senha inicial `admin` — trocar no
  primeiro acesso.
- **SPEC.md**: mover "autenticação/painel admin" de fora-de-escopo para
  escopo (novo §12), mantendo "sem auth de usuários finais".

## Etapa B — CRUD de ofertas manuais

- **Schema**: `Deal.source String @default("awin")` (`awin` | `manual` |
  `demo`) e `Deal.expiresAt DateTime?`. Migração marca existentes como
  `awin`; o seed demo passa a gravar `source: "demo"` e o `--clean-demo` /
  expiração do import filtram por `source` (ofertas manuais **nunca** são
  tocadas pelo cron, mesmo sendo da KaBuM).
- **Vitrine**: todas as consultas públicas do repositório excluem ofertas com
  `expiresAt <= now()`. Como as páginas são SSG, a saída efetiva acontece na
  próxima revalidação (cron diário ou mutação no admin) — granularidade
  aceitável e documentada.
- **Formulário** (nova/editar): loja (dropdown do banco; criar selo SVG do
  Mercado Livre em `public/stores/`), categoria (dropdown), título,
  descrição, preço atual, preço antigo opcional (% de desconto **derivado**,
  exibido read-only), validade opcional, link afiliado (URL válida
  obrigatória), URL da imagem.
- **Preview OG ("estilo WhatsApp")**: `POST /api/admin/og-preview`
  (autenticada) faz fetch do link com timeout curto e extrai
  `og:image`/`og:title`/`og:description` (parse leve, sem lib), retornando
  sugestões que pré-preenchem o form. Falhou/bloqueou (Amazon/ML às vezes
  bloqueiam)? Usuário cola a URL da imagem manualmente.
- **Imagem por hotlink**: card renderiza imagem de oferta `manual` com
  `unoptimized` (não abre o otimizador do Next para domínios arbitrários —
  evita proxy aberto). `Product` não muda.
- **Listagem `/admin/ofertas`**: tabela (título, loja, preço, validade,
  origem) com editar/apagar; apagar pede confirmação (verde confirma,
  vermelho cancela). Mutações via Server Actions + `revalidatePath("/",
"layout")` — o site público reflete na hora.

## Etapa C — Filtros na sidebar + paginação

- **Estado na URL**: `?lojas=amazon,kabum&preco=100-500&ordem=menor-preco&page=2`.
- **Filtros (sidebar, enxutos)**: checkboxes de loja (as com oferta na
  categoria atual), 4 faixas fixas de preço (até 100 · 100–500 · 500–1500 ·
  1500+), ordenação (mais recente · menor preço · maior preço). Aplicar =
  navegar com novos params (Server Component re-renderiza).
- **Paginação numerada**: 60/página, links 1…N com `rel="prev"/"next"`.
- **Repositório**: novo método `listDeals({ categorySlug?, query?, stores?,
minPrice?, maxPrice?, sort, page })` → `{ deals, total }` no Prisma e no
  mock. Métodos atuais continuam para home/destaques.
- **SEO**: `?page=N` puro indexável (canonical self); qualquer combinação com
  filtros → `noindex,follow`. Página base da categoria continua SSG;
  variações com searchParams são dinâmicas.

## Envs novas

| Nome          | Onde              | Conteúdo                     |
| ------------- | ----------------- | ---------------------------- |
| `AUTH_SECRET` | Vercel prod + dev | Aleatório (32+ bytes base64) |

## Erros e segurança

- Login com erro genérico ("credenciais inválidas"), sem revelar se o e-mail
  existe; hash sempre executado mesmo com e-mail inexistente (anti-enum).
- Server Actions do admin sempre revalidam sessão antes de mutar.
- OG preview só aceita URLs `http(s)` e segue no máximo 3 redirects, com
  timeout de 8s e limite de tamanho de resposta (anti-SSRF básico: bloquear
  hosts privados/localhost).
- Cookie de sessão invalidado no logout (expiração imediata).

## Testes

- Unit: hash/verify de senha, sessão (sign/verify/expirada), parser OG,
  montagem de filtros → query, derivação de desconto do form.
- Component: formulário de oferta (validação), confirmação de exclusão.
- E2E manual em produção por etapa: login/logout/troca de senha; criar →
  ver no site → editar → apagar; filtros e paginação com o catálogo real.

## Fora de escopo (continua no backlog)

Gestão/exclusão de admins além do cadastro, CRUD de lojas no admin, upload
de imagem (Vercel Blob), histórico de preços, multi-loja Awin, recuperação
de senha por e-mail ("esqueci a senha" — sem e-mail transacional por ora).
