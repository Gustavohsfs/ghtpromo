# GHT Promoções — PLAN

> Plano de execução por fases. O que construir e os critérios estão em [`SPEC.md`](./SPEC.md).
> **Gate de fase:** ao fim de cada fase, rodar `typecheck` + `lint` + `test` + `build` e commitar (Conventional Commits, commits pequenos por tarefa).

## Fase 1 — Fundação

1. **Ambiente**: instalar Node 22 LTS (winget) e validar `node --version`.
2. Scaffold `npx create-next-app@latest` (Next 16, TS, Tailwind v4, `src/`, App Router, Turbopack, npm).
3. `.nvmrc` (22) + `engines` no `package.json`.
4. ESLint 9 flat config (`eslint-config-next`) + Prettier; scripts `lint`, `format`, `typecheck`.
5. Husky + lint-staged + commitlint (Conventional Commits).
6. Vitest + Testing Library configurados (smoke test de exemplo).
7. `.gitignore` (incluir `data/private/`, `.claude/settings.local.json`).
8. `CLAUDE.md` (regras + política de autonomia, brief §13).
9. `.claude/settings.json` (allowlist, brief §14) + 5 skills (`ght-design-system`, `ght-splash`, `ght-product-card`, `ght-mock-data`, `ght-seo`).
10. Estrutura de pastas vazia com `README` curto por diretório onde ajudar.

**Entrega:** app roda (`npm run dev`), pipeline local passa, hooks ativos.

## Fase 2 — Design system + shell

1. Tokens CSS (`:root` + `@theme` Tailwind): fundos, superfícies, texto, verde-acento + variações de glow, vermelho destrutivo, bordas/anéis de foco.
2. Tipografia via `next/font`; lucide-react.
3. Primitivos `ui/`: `Button` (variantes confirm/destructive/ghost), `Card`, `Badge`, `Modal`/`ConfirmDialog` acessível (foco preso, `Esc`, retorno de foco).
4. `Shell` com **Sidebar** (categorias, colapsável, drawer mobile, teclado) + **Header** com busca (placeholder funcional).
5. Motivo "linhas de energia" (borda/divisor com pulso sutil, `prefers-reduced-motion`).
6. Documentar tokens em `docs/ARCHITECTURE.md` (inicial).

**Entrega:** layout raiz navegável com tema escuro+verde.

## Fase 3 — Splash

1. Componente client `components/splash/` (SVG puro): geometria das linhas espelhadas, curva ~40°, círculo "ghtpromo".
2. Animação do pulso (stroke-dasharray/dashoffset + glow), ~2.5–4s, 1–2 ciclos, fade-out.
3. Controle "1x por sessão" via `sessionStorage` (flag configurável) + `prefers-reduced-motion`.

**Entrega:** abertura conforme spec §5 do SPEC.

## Fase 4 — Dados mock (sem Prisma)

1. Tipos `Product`, `Store`, `Category`, `Deal` em `features/deals`.
2. `src/mocks/`: 5 categorias × ≥3 produtos, `isMock: true`, placeholders locais em `public/` (produtos + ícones circulares de loja).
3. Interface `DealsRepository` + `MockDealsRepository` + seletor por `DATA_SOURCE` (default `mock`).
4. `buildAffiliateUrl(product)` em `lib/` + `data/private/affiliates.example.ts` (gitignore do diretório real).
5. Selo "dados de demonstração" quando `DATA_SOURCE=mock`.
6. Testes: repositório mock + `buildAffiliateUrl`.

**Entrega:** camada de dados completa e testada, UI plugável.

## Fase 5 — Páginas

1. `ProductCard` (anatomia do SPEC §7) + teste de componente.
2. Home `(site)/page.tsx`: seções por categoria (grade/trilho + "ver todos").
3. `/categorias/[slug]`: grade de cards, `notFound()` para slug inválido, `generateStaticParams`.
4. Busca do header funcionando client-side sobre o repositório.
5. `ConfirmDialog` aplicado (ex.: confirmação de saída para loja externa — verde confirma, vermelho cancela).
6. Teste de render de página.

**Entrega:** navegação completa home → categoria → oferta (mock).

## Fase 6 — SEO

1. `metadataBase` + metadata/canonical no layout raiz; `generateMetadata` por categoria.
2. JSON-LD: `Organization` + `WebSite`/`SearchAction` (raiz), `ItemList` + `BreadcrumbList` (categoria), `Product`/`Offer` (cards).
3. `app/sitemap.ts` + `app/robots.ts` (crawlers de IA permitidos, configurável).
4. OG images (`opengraph-image.tsx` raiz e por categoria) + Twitter Cards.
5. `public/llms.txt`.
6. Passada de HTML semântico/headings/`alt`.

**Entrega:** critérios do SPEC §9 atendidos.

## Fase 7 — Qualidade e vitrine

1. Completar testes mínimos (SPEC §11) e revisar cobertura do que importa.
2. GitHub Actions: `typecheck` + `lint` + `test` + `build`.
3. `README.md` de portfólio (badges, screenshots/GIF do splash, arquitetura, como rodar) + `LICENSE` MIT.
4. `docs/ARCHITECTURE.md` final (tokens, decisões, camada de dados, SEO).
5. Auditoria Lighthouse + a11y (teclado, contraste) e polish.

**Entrega:** repo apresentável como vitrine, CI verde.

## Fase 8 — Prisma pré-montado (por último, sem conexão)

1. `prisma/schema.prisma` (`Category`, `Store`, `Product`, `Deal`, provider `postgresql`) coerente com os tipos dos mocks.
2. `npx prisma format` / `validate` / `generate`; client singleton em `src/server/`.
3. `PrismaDealsRepository` (stub) registrado no seletor `DATA_SOURCE=prisma`.
4. `.env.example` com `DATABASE_URL` + `DATA_SOURCE` documentados.
5. Guia "como plugar o banco" no `ARCHITECTURE.md`.

**Entrega:** critérios do SPEC §10; build segue funcionando sem banco.

---

## Backlog (pós-fases)

1. ~~**Importação automática via Vercel Cron**~~ — ✅ feito em 2026-07-15:
   rota `/api/cron/import-awin` (diária, 06:00 BRT) baixa o feed da Awin,
   importa com expiração e regenera as páginas via `revalidatePath` (spec em
   `docs/superpowers/specs/2026-07-15-cron-import-awin-design.md`).
2. **Ingestão multi-loja** — quando a 2ª fonte existir; plano registrado em
   `ARCHITECTURE.md` ("Ingestão multi-loja").
3. **Paginação da página de categoria** — o catálogo completo (~4k produtos)
   é renderizado com limite de 60 por listagem; paginar quando fizer sentido.
4. **Histórico de preços** (`price_history`) — comparação honesta ("menor dos
   últimos 30 dias") enquanto o feed da KaBuM não envia preço antigo.
5. **Categorias vazias fora do sitemap/navegação** — geladeiras/tvs/iphones
   estão sem produtos reais até novas lojas chegarem (thin content).

---

## Riscos e mitigação

| Risco                                                    | Mitigação                                                      |
| -------------------------------------------------------- | -------------------------------------------------------------- |
| Node 22 indisponível na máquina                          | Instalar via winget na Fase 1 antes de qualquer scaffold       |
| APIs assíncronas do Next 16 (`params`, `cookies()` etc.) | Regra registrada no `CLAUDE.md`; typecheck pega esquecimentos  |
| Splash pesada/poluída                                    | SVG/CSS puro, sem libs; revisar com `prefers-reduced-motion`   |
| SEO como afterthought                                    | Fase 6 dedicada + skill `ght-seo` usada ao criar cada rota     |
| Escopo crescer (auth, banco real…)                       | SPEC §1 "fora de escopo"; mudanças exigem atualizar SPEC antes |
