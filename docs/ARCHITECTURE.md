# GHT Promoções — Arquitetura

> Documento vivo: cresce a cada fase. Decisões e critérios em [`SPEC.md`](./SPEC.md).

## Design system (Fase 2)

### Tokens de cor

Definidos em `src/app/globals.css` (`:root` + `@theme inline` do Tailwind v4).
**Regra:** nenhuma cor hardcoded fora desse arquivo — componentes usam apenas as
classes utilitárias derivadas (`bg-surface`, `text-brand`, …).

| Token                    | Valor                  | Uso                                 |
| ------------------------ | ---------------------- | ----------------------------------- |
| `background`             | `#05080A`              | Fundo do app (quase-preto)          |
| `surface`                | `#0A0F0D`              | Cards, sidebar, superfícies         |
| `surface-raised`         | `#0E1613`              | Hover/popover (2º nível)            |
| `border`                 | `#1A2620`              | Bordas sutis esverdeadas            |
| `foreground`             | `#E8F5EE`              | Texto principal (AAA sobre fundo)   |
| `muted-foreground`       | `#93A89D`              | Texto secundário (AA)               |
| `brand`                  | `#2EE88A`              | Verde de energia (marca/acento/CTA) |
| `brand-strong`           | `#57F2A5`              | Hover/realce do verde               |
| `brand-foreground`       | `#04130B`              | Texto sobre fundo verde             |
| `brand-soft`             | `rgba(46,232,138,.12)` | Tints/fundos ativos                 |
| `brand-glow`             | `rgba(46,232,138,.45)` | Glow/sombras luminosas              |
| `destructive`            | `#FF5D5D`              | Ações destrutivas/negação           |
| `destructive-strong`     | `#FF8080`              | Hover do vermelho                   |
| `destructive-foreground` | `#1A0505`              | Texto sobre fundo vermelho          |
| `ring`                   | `var(--brand)`         | Anel de foco (teclado)              |

### Semântica de cores (inviolável)

- **Verde = confirmar / positivo / CTA principal.**
- **Vermelho = negar / cancelar / destrutivo.**

### Motivo "linhas de energia"

Classes `.energy-line` (horizontal) e `.energy-line-vertical` em `globals.css`:
gradiente verde com pulso lento (4s) via `@keyframes energy-pulse`. Aplicado na
borda direita da sidebar e na base do header. `prefers-reduced-motion: reduce`
desativa a animação (linha estática).

### Tipografia e ícones

- Geist Sans / Geist Mono via `next/font` (variáveis `--font-geist-*`).
- Ícones: `lucide-react`.

## Componentes (Fase 2)

- `src/components/ui/` — primitivos: `Button` (confirm/destructive/ghost/outline),
  `Card`, `Badge`, `Modal`, `ConfirmDialog`. Modal e drawer usam `<dialog>`
  nativo: foco preso, `Esc` fecha e o foco retorna à origem sem JS extra.
- `src/components/layout/` — `Shell` (client, estado da sidebar), `Sidebar`
  (desktop, colapsável), `MobileDrawer` (dialog), `Header` (busca placeholder),
  `Logo`, `SidebarNav` (lista compartilhada desktop/mobile).
- Server Components por padrão; `'use client'` apenas onde há estado
  (Shell, Header, Modal, navegação ativa via `usePathname`).

## Splash de abertura (Fase 3)

`src/components/splash/` — SVG + CSS puro (sem libs). Duas linhas de energia
espelhadas sobem das bordas, dobram ~40° para dentro e tangenciam o círculo
central com o logo; o pulso usa `pathLength={100}` + `stroke-dasharray`/
`dashoffset`, e o círculo ganha glow sincronizado (~59% do caminho). Config em
`splash-config.ts` (1x por sessão via `sessionStorage`, ciclos, durações).
`prefers-reduced-motion` → composição estática. Renderiza no SSR (fase
`pending`) para não piscar conteúdo. Spec completa: skill `ght-splash`.

## Camada de dados (Fase 4)

**Padrão repositório** para trocar mock ↔ banco sem tocar na UI:

- `src/data/repository/deals.repository.ts` — interface `DealsRepository`
  (categorias, ofertas por categoria, destaques, busca).
- `MockDealsRepository` lê de `src/mocks/` (5 categorias × 3+ ofertas, tudo
  `isMock: true`, `discountPct` derivado dos preços por factory).
- Seletor `getDealsRepository()` por env `DATA_SOURCE` (`mock` default;
  `prisma` chega na Fase 8). **Regra inviolável:** UI nunca importa
  `src/mocks/` — verificável por grep.
- Links de oferta SEMPRE via `buildAffiliateUrl()` (`src/lib/affiliate.ts`) —
  único ponto a mudar quando os links reais chegarem
  (`data/private/affiliates.example.ts` documenta o formato; o diretório real
  é gitignorado).

## Páginas (Fase 5)

- Grupo `(site)`: home (destaques + seção por categoria),
  `/categorias/[slug]` (SSG via `generateStaticParams`, `notFound()` para slug
  inválido) e `/busca` (server-side sobre o repositório, `noindex`).
- `ProductCard`: âncora real com `href` de afiliado (crawlers leem) +
  confirmação de saída em `<dialog>` — verde continua, vermelho cancela.
- Sidebar recebe as categorias do repositório via layout raiz (Server
  Component) como props serializáveis; ícones resolvidos por slug no client.
- Next 16: `params`/`searchParams` assíncronos; tipos de rota gerados
  (`next typegen`, embutido no script `typecheck`).

## SEO e descoberta (Fase 6)

- **Identidade**: `src/lib/site.ts` — `SITE_URL` (`NEXT_PUBLIC_SITE_URL`, fallback
  `https://ghtpromo.com.br`), nome, descrição, lista de crawlers de IA.
- **Metadata**: `metadataBase` + title template no layout raiz; canonical por
  rota (`alternates.canonical`); OG/Twitter defaults; `/busca` com `noindex`.
- **JSON-LD**: `src/lib/jsonld.tsx` — `Organization` + `WebSite`/`SearchAction`
  (layout), `ItemList` com `Product`/`Offer` + `BreadcrumbList` (categoria).
- **Descoberta**: `app/sitemap.ts` (home + categorias), `app/robots.ts`
  (crawlers de IA permitidos; `ALLOW_AI_CRAWLERS=false` bloqueia),
  `public/llms.txt`.
- **OG images**: `ImageResponse` na raiz e por categoria; paleta espelhada em
  `src/lib/og.ts` (Satori não lê CSS vars).

## Prisma pré-montado (Fase 8 — sem banco conectado)

- `prisma/schema.prisma`: `Category`, `Store`, `Product`, `Deal` (PostgreSQL),
  espelhando `src/features/deals/types.ts`. `isMock` não existe no banco — o
  mapeamento do repositório define `isMock: false`.
- Prisma 7: client gerado em `src/generated/prisma` (gitignorado; recriado no
  `postinstall`), conexão fora do schema — CLI via `prisma.config.ts`, runtime
  via driver adapter `@prisma/adapter-pg` no singleton lazy
  `src/server/prisma.ts` (só instancia na primeira consulta).
- `PrismaDealsRepository` implementa a interface com consultas completas e
  mapeamento para os tipos do domínio. **Compila mas nunca rodou contra banco
  real** — validar ao plugar.

### Como plugar o banco

1. Defina `DATABASE_URL` no `.env` (ver `.env.example`). O CLI carrega via
   `dotenv` importado no `prisma.config.ts` (Prisma 7 não lê `.env` sozinho).
2. `npx prisma migrate dev` (migração inicial já commitada em
   `prisma/migrations/`).
3. `npm run db:seed` — popula com os dados de demonstração de `src/mocks/`
   (idempotente; troque a fonte quando houver catálogo real).
4. Defina `DATA_SOURCE=prisma` — **nenhum componente de UI muda**.

> Validado em 2026-07-13 contra Neon (PostgreSQL serverless, região
> sa-east-1): build SSG, home, categoria e busca servidos pelo
> `PrismaDealsRepository`; selo de demonstração some sozinho.

### Links de afiliado reais (Awin/KaBuM — ativos desde 2026-07-14)

Os links reais vivem **no banco** (`deals.affiliate_url`), não no código. O
núcleo da importação está em `src/server/awin-import.ts` (normalização +
upsert idempotente + expiração + estatísticas) e é usado por dois caminhos:

- **Automático (desde 2026-07-15)**: Vercel Cron diário (06:00 BRT,
  `vercel.json`) chama `GET /api/cron/import-awin` — protegida por
  `CRON_SECRET` —, que baixa o feed completo da URL autenticada da Awin
  (`AWIN_FEED_URL`, ~5,5k produtos, gzip), importa (~4k após o mapeamento de
  categorias) e regenera as páginas SSG com `revalidatePath("/", "layout")`.
  Sem CSV manual e sem novo deploy. Functions na região `gru1`, colada no
  Neon `sa-east-1`. Categoria/busca renderizam no máximo 60 itens
  (`MAX_DEALS_PER_LISTING`); paginação no backlog.
- **Manual (fallback/dev)**: exporte o datafeed para
  `data/private/awin-kabum.csv` (gitignorado) e rode
  `npm run db:import-awin -- --clean-demo` — mesmo núcleo, mesma semântica;
  `--clean-demo` remove ofertas demo (links `exemplo.ghtpromo.dev`).

3. `buildAffiliateUrl()` segue sendo o ponto único — entrega o que o
   repositório fornecer. O importador também lê a descrição
   (`product_short_description`/`description`, sanitizada e truncada) e o
   preço antigo (`product_price_old`/`rrp_price` → `oldPrice` +
   `discountPct` derivado). A KaBuM hoje envia as colunas de preço antigo
   vazias — nesse caso ficam nulos e o card omite riscado/selo (o log do
   import mostra `comPrecoAntigo` e uma amostra dos valores brutos).
4. **Expiração**: o feed é a fonte da verdade do catálogo da loja — a cada
   importação, ofertas da loja que saíram do feed ou ficaram sem estoque são
   removidas do banco (e produtos órfãos junto), com contagem `expiradas` no
   log. Ofertas demo ficam de fora (geridas por `db:seed`/`--clean-demo`).
   Como o site é SSG, a mudança só aparece no próximo deploy — a automação
   (cron + deploy hook) está no backlog do `PLAN.md`.
5. `npm run db:seed` restaura as ofertas demo se precisar (dev/showcase).

### Ingestão multi-loja (plano — executar quando a 2ª fonte existir)

O lado da leitura já é plugável (UI → `DealsRepository` → banco); o plano é
espelhar o padrão no lado da escrita quando entrarem novas lojas/fontes:

1. **Contrato canônico** `ImportedOffer` — "uma oferta pronta para o banco",
   independente da origem: `{ storeId, externalId, title, description,
imageUrl, categorySlug, price, oldPrice, affiliateUrl, inStock }`.
2. **Um adaptador por fonte** — só traduz o formato da fonte (CSV Awin, API
   JSON, …) para `ImportedOffer[]`. O que sempre varia por loja é o
   **mapeamento de categorias** (categoria da loja → slug da vitrine) — vira
   configuração do adaptador, não código novo. O layout Awin é padronizado
   entre anunciantes: nova loja Awin ≈ `{ storeId, feed, mapaDeCategorias }`.
3. **Núcleo de importação único** — o que hoje está em `import-awin.ts` e não
   é específico da KaBuM: upsert idempotente, `htmlToPlainText`, derivação de
   desconto, destaques, estatísticas de log.

Decisão consciente: **não generalizar antes da 2ª fonte real** — a segunda
fonte informa onde a abstração precisa dobrar. Evoluções seguintes: Vercel
Cron baixando o datafeed (URL autenticada da Awin em env) e tabela
`price_history` para comparação honesta de preços ("menor dos últimos 30
dias") já que a KaBuM não envia preço antigo.

## Painel admin (2026-07-15 — SPEC §12)

- **Auth própria**: `Admin` no Prisma (e-mail + `passwordHash` scrypt,
  `src/server/password.ts`), sessão JWT HS256 (`jose`,
  `src/server/admin-session.ts`) em cookie httpOnly de 7 dias
  (`AUTH_SECRET`). Guarda dupla: `src/proxy.ts` (matcher `/admin/:path+`)
  redireciona sem sessão; layout do painel e toda Server Action revalidam
  (`requireSessionAdmin`). Rota oculta: `noindex` via metadata, fora do
  robots.txt, sem links no site. `scripts/create-admin.ts` cria/reseta admin.
- **Shell**: a sidebar/splash pública mora no grupo `(site)`; o layout raiz é
  mínimo e o `/admin` tem layout próprio.
- **Ofertas manuais**: `Deal.source` (`awin`|`manual`|`demo`) + `expiresAt`.
  O cron só expira `source="awin"` — manuais nunca são tocadas; demo é do
  seed/`--clean-demo`. Consultas públicas excluem vencidas (granularidade =
  próxima revalidação). CRUD em `/admin/ofertas` (validação pura em
  `src/server/deal-form.ts`, % de desconto derivado); mutações chamam
  `revalidatePath("/", "layout")` — o site reflete na hora. Imagem de oferta
  manual renderiza `unoptimized` (hotlink sem abrir o otimizador a domínios
  arbitrários).
- **Preview OG**: `POST /api/admin/og-preview` (autenticada) lê
  og:title/description/image do link (parser puro `src/lib/og-parse.ts`) com
  anti-SSRF básico (só http(s), hosts privados bloqueados por redirect,
  timeout 8s, leitura limitada a 512KB).

## Filtros e paginação (2026-07-15)

- Estado na URL (`?lojas=a,b&preco=100-500&ordem=menor-preco&page=2`) —
  parse/href em `src/features/deals/listing.ts` (puro, testado);
  `DEALS_PAGE_SIZE = 60`.
- `DealsRepository.listDeals()` (Prisma + mock) com filtros, ordenação,
  `total`/`pageCount`; `getStores()` alimenta os checkboxes. `searchDeals`
  foi absorvido por `listDeals`.
- Sidebar: `ListingFilters` (client, só em `/categorias/*` e `/busca`,
  dentro de `Suspense` — exigência do `useSearchParams` em página estática).
- Paginação numerada com `rel prev/next`; SEO: `?page=N` indexável,
  combinações filtradas `noindex,follow`. Custo assumido: a página de
  categoria virou dinâmica (searchParams) — servida por function em `gru1`
  ao lado do Neon; a home continua estática.

## Testes (Fase 2)

- Vitest + Testing Library (jsdom, `globals: true` para auto-cleanup).
- Polyfill de `HTMLDialogElement.showModal/close` em `vitest.setup.ts`
  (jsdom ainda não implementa `<dialog>`).
