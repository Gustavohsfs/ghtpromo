<div align="center">

# ght<span>promo</span> ⚡

**Vitrine pública de promoções de lojas oficiais — tema escuro + verde, rápida e encontrável.**

[![CI](https://github.com/Gustavohsfs/ghtpromo/actions/workflows/ci.yml/badge.svg)](https://github.com/Gustavohsfs/ghtpromo/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-2EE88A.svg)](./LICENSE)
[![Next.js 16](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![TypeScript strict](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)](./tsconfig.json)

🌐 **[ghtpromo.com.br](https://ghtpromo.com.br)** _(em breve)_

</div>

---

## Sobre

O **GHT Promoções** é uma vitrine de ofertas de afiliados no estilo
[garimpeiros](https://garimpeiros.com.br): produtos de lojas oficiais
(Amazon, Magazine Luiza, KaBuM!, Casas Bahia, Fast Shop) organizados por
categoria, com preço atual, preço anterior riscado, selo de desconto e link
direto para a loja.

Este repositório também é **vitrine de engenharia**: arquitetura por domínio,
Server Components por padrão, camada de dados plugável, SEO completo e testes
— construído com **Spec-Driven Development** (spec e plano em [`docs/`](./docs)).

> 🎭 **Dados de demonstração**: enquanto não há banco nem links de afiliado
> reais, tudo roda sobre mocks commitados (`src/mocks/`, todos com
> `isMock: true`) atrás de uma interface de repositório. Trocar para o banco
> não altera nenhum componente de UI.

## Destaques

- 🎬 **Splash de abertura** em SVG/CSS puro: linhas de energia convergem para o
  logo com um pulso sincronizado — 1x por sessão, respeita
  `prefers-reduced-motion`
- 🌑 **Design system escuro + verde** com tokens CSS (zero cor hardcoded) e
  semântica fixa: verde confirma, vermelho cancela
- 🧱 **Padrão repositório**: `DealsRepository` → mock hoje, Prisma depois, via
  env `DATA_SOURCE` — a UI nunca sabe a diferença
- 🔗 **Links de afiliado centralizados** em `buildAffiliateUrl()` com
  `rel="sponsored noopener"` e confirmação de saída acessível (`<dialog>`)
- 🔍 **SEO de primeira**: canonical por rota, JSON-LD
  (Organization/WebSite/ItemList/Product/Offer/BreadcrumbList), sitemap,
  robots com **crawlers de IA permitidos**, OG images geradas em runtime e
  [`llms.txt`](./public/llms.txt)
- ♿ **A11y desde o início**: navegação por teclado, foco visível, modais e
  drawer sobre `<dialog>` nativo

## Stack

|           |                                                                     |
| --------- | ------------------------------------------------------------------- |
| Framework | [Next.js 16](https://nextjs.org) (App Router, Turbopack) + React 19 |
| Linguagem | TypeScript `strict` (zero `any`)                                    |
| Estilo    | Tailwind CSS v4 (tokens via `@theme`)                               |
| Dados     | Mocks tipados + Prisma (schema pronto, sem conexão)                 |
| Testes    | Vitest + Testing Library                                            |
| Qualidade | ESLint 9 + Prettier + Husky + lint-staged + commitlint              |
| CI/Deploy | GitHub Actions · Vercel                                             |

## Como rodar

Pré-requisito: **Node 22** (`.nvmrc`).

```bash
npm install
npm run dev        # http://localhost:3000
```

Scripts úteis:

```bash
npm run typecheck  # next typegen + tsc --noEmit
npm run lint       # eslint
npm test           # vitest
npm run build      # build de produção
```

Variáveis de ambiente em [`.env.example`](./.env.example) — o default
(`DATA_SOURCE=mock`) funciona sem configurar nada.

## Arquitetura

```
src/
  app/              # rotas (App Router), sitemap, robots, OG images
  components/       # ui/ (primitivos) · layout/ (shell) · splash/
  features/         # deals/ e categories/ — código por domínio
  data/repository/  # DealsRepository (interface) + implementações
  mocks/            # dados de demonstração (commitados, isMock)
  lib/              # affiliate, seo/jsonld, site, cn, format
data/private/       # segredos futuros (gitignorado; só *.example.ts entra)
docs/               # SPEC.md · PLAN.md · ARCHITECTURE.md
.claude/            # skills de domínio + settings (parte do showcase)
```

Decisões, tokens e trade-offs documentados em
[`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md); o quê/porquê de cada feature
em [`docs/SPEC.md`](./docs/SPEC.md).

## Roadmap

- [x] Fundação (Next 16 + TS strict + hooks de qualidade)
- [x] Design system + shell (sidebar, header, primitivos)
- [x] Splash de abertura
- [x] Camada de dados mock + repositório
- [x] Páginas (home, categoria, busca, 404)
- [x] SEO completo
- [x] CI + docs de vitrine
- [ ] Prisma pré-montado (schema + stub, sem conexão)
- [ ] Deploy na Vercel · links de afiliado reais · banco de dados

## Licença

[MIT](./LICENSE) © Gustavo Henrique T.
