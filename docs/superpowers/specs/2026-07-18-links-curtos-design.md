# Links curtos de compartilhamento (`/p/{code}`) — design

Data: 2026-07-18 · Status: aprovado

## Objetivo

Links compartilhados no WhatsApp (botão **Promover** do admin e botão
**Compartilhar** da página de produto) ficam curtos e profissionais:
`ghtpromo.com.br/p/Ab3xK9q` (~30 caracteres) no lugar de
`ghtpromo.com.br/produto/<slug>--<id>` (~80). De quebra, cada clique é
contado — métrica de conversão por oferta visível no admin.

## Decisão de abordagem

- **Escolhido: encurtador próprio no domínio** — rota `/p/{code}` que
  redireciona para a página completa. Grátis, sem dependência externa, mantém
  a marca no link (encurtadores públicos podem cair no filtro de spam do
  WhatsApp) e as métricas ficam no nosso banco.
- Descartado: serviço externo (Bitly/TinyURL) — link de terceiro, free tier
  limitado, métricas fora do admin.
- Upgrade futuro possível: domínio curto dedicado (ex.: `ghtp.ro`) apontando
  para a mesma rota — só muda o host, zero mudança de código.

## Escopo

### Código curto por oferta

- Coluna nova `short_code` no model `Deal`: **7 caracteres** (nanoid, alfabeto
  URL-safe), única, indexada, estável pela vida da oferta.
- Gerada na criação da oferta em todos os pontos de escrita: action do admin,
  sync do feed Awin (**só no create** — update nunca toca) e seed.
- Migration com **backfill** das ofertas existentes.
- Tipo `Deal` do domínio ganha `shortCode: string`; mocks ganham códigos.

### Rota de redirect `/p/[code]`

Route handler (`src/app/p/[code]/route.ts`):

1. Resolve a oferta pelo código **via repositório** (regra do projeto: UI/rotas
   nunca importam mock/Prisma direto).
2. Se User-Agent **não** for bot conhecido (WhatsApp preview, Googlebot,
   facebookexternalhit, bingbot, TelegramBot…), registra o clique.
3. Responde **redirect 302** para `/produto/<slug>--<id>` (302, não 301 — o
   navegador não pode cachear o redirect, senão cliques repetidos escapam da
   contagem).
4. Código inexistente ou oferta expirada → redirect 302 para a home.

O preview OG do WhatsApp continua funcionando: o crawler segue o redirect e lê
os metadados da página de destino.

### Métricas

- Coluna `click_count Int @default(0)` no `Deal` — contador simples, sem
  tabela de eventos (YAGNI; série temporal fica para quando houver demanda).
- Aba **Ofertas** do admin ganha a coluna **"Cliques"**.

### Pontos de uso do link curto

- **Promover (admin)**: `url` da mensagem WhatsApp passa a ser
  `absoluteUrl("/p/" + shortCode)`.
- **Compartilhar (página de produto)**: "Enviar no WhatsApp" **e** "Copiar
  link" usam o link curto.
- A URL longa `/produto/...` segue sendo a **canônica** para SEO; `/p/` entra
  no `Disallow` do robots.txt (skill ght-seo).

## Arquitetura

- `DealsRepository` ganha dois métodos:
  - `getDealByShortCode(code: string): Promise<Deal | null>`
  - `registerShortLinkClick(code: string): Promise<void>`
    Implementados no mock (em memória) e no Prisma (`update { increment: 1 }`).
- Detecção de bot: função pura `isBotUserAgent(ua)` com lista de padrões,
  testável isoladamente.
- Geração do código: helper `generateShortCode()` (nanoid 7) usado pelos
  pontos de escrita.

## Fora de escopo (por ora)

- Tabela de eventos de clique (série temporal, origem, dispositivo).
- Domínio curto dedicado.
- Links curtos para outras páginas além de ofertas.

## Critérios de aceite

1. Toda oferta (manual, feed e seed) nasce com `shortCode` único de 7 chars;
   ofertas pré-existentes recebem código via backfill.
2. `GET /p/{code}` responde 302 para a página do produto e incrementa
   `clickCount`; segundo acesso conta de novo (sem cache de redirect).
3. Acesso com User-Agent de bot **não** incrementa o contador.
4. Código inválido ou oferta expirada → 302 para a home, sem erro.
5. Mensagem do Promover e ações do Compartilhar usam o link curto.
6. Aba Ofertas exibe a coluna Cliques com o valor do banco.
7. `/p/` está em `Disallow` no robots.txt; canônica segue na URL longa.
8. Gate completo passa: typecheck, lint, test, build.
