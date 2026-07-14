# GHT Promoções — SPEC

> **Fonte da verdade** do que será construído. Derivado do brief mestre (`BRIEF-ght-promocoes.md`) com as decisões aprovadas em 2026-07-11. O plano de execução está em [`PLAN.md`](./PLAN.md).

## 1. Visão geral

**GHT Promoções** (`ghtpromo`) é uma **vitrine pública de promoções de afiliados**: tema **escuro + verde**, organizada por categorias (eletrônicos, geladeiras, TVs, computadores, iPhones), com produtos de lojas oficiais.

Objetivos com peso igual:

1. **Produto** — site rápido, bonito e encontrável (Google + IAs), pronto para receber links de afiliado reais depois.
2. **Portfólio** — o repositório é vitrine no GitHub: arquitetura, legibilidade, componentização e testes contam tanto quanto as features.

**Fora de escopo (por enquanto):** autenticação, banco conectado, links de afiliado reais, painel admin, pagamentos. Os _encaixes_ ficam prontos (repositório, `buildAffiliateUrl`, `data/private/`), mas nada disso é implementado.

## 2. Decisões fechadas

| Tema               | Decisão                                                                                         | Racional                                                    |
| ------------------ | ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Stack              | Next.js 16 (App Router, Turbopack) · React 19.2 · TypeScript strict · Tailwind v4 · Node 22 LTS | Brief §2                                                    |
| Gerenciador        | npm, lockfile único                                                                             | Brief §2                                                    |
| Lint/format        | ESLint 9 (flat config) + Prettier, com `eslint-config-next`                                     | Padrão consagrado do ecossistema; regras Next/a11y inclusas |
| Testes             | Vitest + Testing Library. **Sem Playwright** por ora                                            | Decisão do usuário (2026-07-11)                             |
| Dados              | 100% mock atrás de camada de repositório; `DATA_SOURCE=mock` default                            | Brief §4                                                    |
| **Prisma**         | **Pré-montado por último** (fase final): schema + client + stub de repositório, sem conexão     | Decisão do usuário (2026-07-11)                             |
| `.claude/`         | **Commitado** (`settings.json` + `skills/`); só `settings.local.json` gitignorado               | Decisão do usuário (2026-07-11)                             |
| Deploy             | Vercel, zero config extra                                                                       | Brief §2                                                    |
| Idioma do conteúdo | pt-BR                                                                                           | Público brasileiro                                          |

## 3. Arquitetura

### 3.1 Estrutura de pastas

```
src/
  app/                      # rotas (App Router), layouts, metadata, sitemap, robots
    (site)/                 # grupo de rotas públicas
    categorias/[slug]/      # página de categoria (listagem)
  components/
    ui/                     # primitivos (Button, Card, Modal/ConfirmDialog, Badge…)
    layout/                 # Sidebar, Header, Shell
    splash/                 # animação de abertura
  features/
    deals/                  # tipos, componentes e seções de promoções
    categories/
  lib/                      # utils, seo, jsonld, cn(), formatadores, affiliate
  data/
    repository/             # interface + MockDealsRepository (+ PrismaDealsRepository na fase final)
  mocks/                    # dados mock de vitrine (COMMITADOS, isMock: true)
  server/                   # data-access (+ prisma client na fase final)
  styles/                   # tokens/tema
prisma/                     # schema.prisma (fase final)
data/private/               # dados sensíveis futuros (GITIGNORADO) + *.example.ts commitado
docs/                       # SPEC.md, PLAN.md, ARCHITECTURE.md
.claude/                    # settings.json + skills/ (commitados)
```

### 3.2 Regras de código

- Server Components por padrão; `'use client'` só com interatividade/estado/efeito.
- TypeScript strict, **zero `any`**; tipos exportados e reutilizados.
- Nenhuma cor hardcoded no JSX — sempre tokens do design system.
- UI nunca importa mock direto — sempre via interface do repositório.
- Componentes pequenos e coesos; a11y desde o início.
- Conventional Commits; commits pequenos após cada tarefa testada.

### 3.3 Camada de dados (padrão repositório)

- `src/data/repository/deals.repository.ts` — interface `DealsRepository`:
  - `getCategories(): Promise<Category[]>`
  - `getCategoryBySlug(slug): Promise<Category | null>`
  - `getDealsByCategory(slug): Promise<Deal[]>`
  - `getFeaturedDeals(): Promise<Deal[]>`
  - `searchDeals(query): Promise<Deal[]>`
- `MockDealsRepository` lê de `src/mocks/`.
- Seletor lê `process.env.DATA_SOURCE` (`mock` | `prisma`), default `mock`. Na fase final, `prisma` resolve para o stub `PrismaDealsRepository`.

**Critérios de aceite**

- [ ] Nenhum arquivo de UI importa de `src/mocks/` diretamente (verificável por grep/lint).
- [ ] Trocar `DATA_SOURCE` não exige alteração em nenhum componente.
- [ ] Testes unitários cobrem o `MockDealsRepository` (retornos, categoria inexistente, busca).

### 3.4 Mocks (`src/mocks/` — commitados)

- Tipos: `Product`, `Store`, `Category`, `Deal`. Todo item com `isMock: true` e banner de comentário no topo do arquivo.
- **Mínimo 3 produtos por categoria**; categorias iniciais: eletrônicos, geladeiras, TVs, computadores, iPhones.
- Campos do produto: `id`, `title`, `imageUrl` (placeholders locais em `public/`), `price`, `oldPrice`, `discountPct`, `store` (nome + `iconUrl` do selo retangular da loja), `categorySlug`, `affiliateUrl`.
- Selo visual discreto "dados de demonstração" quando `DATA_SOURCE=mock`.

**Critérios de aceite**

- [ ] ≥3 produtos por categoria, todos tipados e com `isMock: true`.
- [ ] Selo de demonstração visível com mock e removível trocando a env.

### 3.5 Link de afiliado

- `buildAffiliateUrl(product)` em `src/lib/` centraliza a montagem. Hoje retorna o `affiliateUrl` mock; amanhã lê o link real (de `data/private/` / env).
- Todo botão "Ver oferta" passa por ele; `target="_blank"` + `rel="sponsored noopener"`.
- `data/private/` no `.gitignore`; `data/private/affiliates.example.ts` commitado como referência.

**Critérios de aceite**

- [ ] Nenhum link de oferta montado fora de `buildAffiliateUrl()`.
- [ ] Teste unitário do utilitário.
- [ ] Build funciona sem nenhum arquivo real em `data/private/`.

## 4. Design system — escuro + verde

- Tokens como CSS variables no `:root` + tema Tailwind v4 (`@theme`). Nada de cores soltas.
- Base escura quase-preta (~`#05080A`/`#0A0F0D`), superfícies elevadas, contraste AA/AAA.
- Verde neon/esmeralda como acento, com variações para glow.
- Semântica: **verde = confirmar/positivo**, **vermelho = negar/cancelar/destrutivo**.
- Motivo "linhas de energia": detalhes verdes com pulso lento e sutil (bordas da sidebar, divisores, hover de cards), respeitando `prefers-reduced-motion`.
- Tipografia via `next/font`; ícones com lucide-react.

**Critérios de aceite**

- [ ] Todos os tokens documentados em `docs/ARCHITECTURE.md`.
- [ ] Zero cor hardcoded em componentes (auditável).
- [ ] Contraste texto/fundo ≥ AA.

## 5. Splash de abertura

Conforme brief §6 (spec integral na skill `ght-splash`):

- SVG, fundo preto: duas linhas de energia simétricas próximas às bordas, sobem verticais, curvam ~40° para dentro com canto arredondado, convergem para um círculo central com o logotipo "ghtpromo", e seguem verticais acima do círculo (forma de "cálice").
- Pulso de luz verde sobe simultaneamente pelas duas linhas (~2.5–4s, easing suave), o círculo dá glow ao ser atingido; 1–2 ciclos e fade-out.
- Exibida **1x por sessão** (`sessionStorage`, flag configurável). Com `prefers-reduced-motion`: logo estático sem pulso ou pula direto.
- Implementação em SVG/CSS puro (`stroke-dasharray`/`dashoffset`, `drop-shadow`), componente client isolado em `components/splash/`. Sem libs de animação.

**Critérios de aceite**

- [ ] Splash aparece no primeiro load e não reaparece na mesma sessão.
- [ ] `prefers-reduced-motion` respeitado.
- [ ] Nenhuma dependência de animação adicionada.

## 6. Layout e navegação

- **Sidebar esquerda**: navegação por categorias, identidade escura+verde com detalhes de energia, hover/ativo claros, colapsável, vira drawer no mobile, acessível via teclado.
- **Home em seções** por categoria (trilho/grade + "ver todos" → página da categoria).
- **Header enxuto com busca** client-side sobre os mocks (pronta para virar server/DB depois).

**Critérios de aceite**

- [ ] Sidebar navegável por teclado (foco visível, ordem lógica).
- [ ] Drawer mobile abre/fecha com toque e `Esc`.
- [ ] Cada seção da home leva à categoria correspondente.

## 7. Card de produto e página de categoria

`/categorias/[slug]` lista produtos em grade estilo e-commerce.

Anatomia do card: imagem · título · **preço atual em destaque** · preço antigo riscado · selo de % de desconto · **selo retangular com o wordmark da loja no canto superior esquerdo da imagem** · botão **"Ver oferta"** via `buildAffiliateUrl()` (`rel="sponsored noopener"`, nova aba) · JSON-LD Product/Offer.

**Critérios de aceite**

- [ ] Card renderiza todos os elementos com dados mock.
- [ ] Categoria inexistente → 404 (`notFound()`).
- [ ] Teste de componente do card.

## 8. Modais

- `Modal`/`ConfirmDialog` acessível: foco preso, `Esc` fecha, `aria-*`, retorno de foco ao fechar.
- Confirmação = verde, negação/cancelar = vermelho, consistente em todo o app.

**Critérios de aceite**

- [ ] Navegação por teclado completa (trap, Esc, retorno de foco).
- [ ] Semântica de cores respeitada.

## 9. SEO e descoberta (prioridade alta)

- **Metadata API**: `metadata`/`generateMetadata` por rota; `metadataBase`; título/descrição por categoria; `alternates.canonical`.
- **Open Graph + Twitter Cards**; OG images com `ImageResponse` (`opengraph-image.tsx`).
- **`app/sitemap.ts`** (todas as categorias) e **`app/robots.ts`** com crawlers de IA (GPTBot, ClaudeBot, PerplexityBot, Google-Extended) **permitidos e configuráveis**.
- **JSON-LD**: `Organization` + `WebSite` (com `SearchAction`) no layout raiz; `ItemList` nas categorias; `Product` + `Offer` nos produtos; `BreadcrumbList` na navegação.
- **`public/llms.txt`** descrevendo o site e as categorias.
- URLs limpas, HTML semântico, hierarquia de headings, `alt` em todas as imagens.
- Performance: SSG/SSR onde couber, `next/image`, `next/font`. Meta: Lighthouse ~100 em SEO/Perf/Best Practices/A11y.

**Critérios de aceite**

- [ ] Toda rota tem metadata única + canonical.
- [ ] JSON-LD válido (testável com validador de schema).
- [ ] `sitemap.xml`, `robots.txt` e `llms.txt` servidos corretamente.
- [ ] Lighthouse (produção local): SEO = 100; Perf/A11y/BP ≥ 95.

## 10. Prisma pré-montado (fase final — sem conexão)

- `prisma/schema.prisma` com `Category`, `Store`, `Product`, `Deal`, provider `postgresql`, coerente com os tipos dos mocks.
- `prisma generate` funcionando; client em `src/server/`.
- `PrismaDealsRepository` implementando a interface (stub honesto: lança `NotImplementedError` claro ou consulta o client — sem conectar).
- Documentação em `ARCHITECTURE.md` de como plugar o banco (env `DATABASE_URL` + `DATA_SOURCE=prisma`).

**Critérios de aceite**

- [ ] `npx prisma validate` e `npx prisma generate` passam sem banco.
- [ ] Build do Next não exige `DATABASE_URL`.
- [ ] Trocar para Prisma no futuro = implementar os métodos do stub, nada na UI.

## 11. Qualidade e vitrine

- **Testes mínimos**: card de produto, `buildAffiliateUrl`, `MockDealsRepository`, render de uma página.
- **Hooks**: Husky + lint-staged (lint/format no staged) + commitlint (Conventional Commits).
- **CI (GitHub Actions)**: `typecheck` + `lint` + `test` + `build` em push/PR.
- **README de portfólio**: descrição, stack, screenshots/GIF do splash, decisões de arquitetura, como rodar, link do deploy, badges de CI.
- **LICENSE MIT** e `docs/ARCHITECTURE.md`.

**Critérios de aceite**

- [ ] CI verde no GitHub.
- [ ] Commit fora do padrão é bloqueado pelo commitlint.
- [ ] `npm run typecheck && npm run lint && npm test && npm run build` passam localmente.

## 12. Skills do projeto (`.claude/skills/` — commitadas)

| Skill               | Conteúdo                                                                                    | Quando usar                 |
| ------------------- | ------------------------------------------------------------------------------------------- | --------------------------- |
| `ght-design-system` | Tokens escuro+verde, verde=confirmar/vermelho=negar, linhas de energia, tipografia/ícones   | Ao estilizar qualquer UI    |
| `ght-splash`        | Spec da abertura (geometria, curva ~40°, círculo, pulso, timing, reduced-motion, 1x/sessão) | Ao criar/ajustar a abertura |
| `ght-product-card`  | Anatomia do card, `buildAffiliateUrl`, `rel="sponsored"`                                    | Ao mexer em cards/listagens |
| `ght-mock-data`     | Onde/como criar mocks, `isMock`, 3+/categoria, `data/private/`, troca p/ Prisma             | Ao criar/editar dados       |
| `ght-seo`           | Checklist SEO (metadata, canonical, sitemap/robots, JSON-LD, llms.txt, crawlers IA)         | Ao criar rotas/páginas      |

Convenções sempre-ativas ficam no `CLAUDE.md` (raiz), incluindo a política de autonomia (brief §1).
