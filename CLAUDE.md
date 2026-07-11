@AGENTS.md

# GHT Promoções — instruções do projeto

Vitrine pública de promoções de afiliados. Tema escuro + verde. Sem auth. Dados
mockados atrás de uma camada de repositório (mock agora, Prisma depois).
Este repo é vitrine de portfólio: siga as melhores práticas à risca.
Comunicação com o usuário sempre em português-BR.

## Stack

Next.js 16 (App Router) · React 19 · TS strict · Tailwind v4 · Prisma (schema
pronto, sem conexão — montado por último) · Node 22 · deploy Vercel · npm.

## Regras

- Server Components por padrão; `'use client'` só com interatividade.
- Next 16: `params`, `searchParams`, `cookies()`, `headers()` são **assíncronos**;
  middleware vai em `proxy.ts`. Em dúvida, leia `node_modules/next/dist/docs/`.
- TypeScript strict, zero `any`.
- Nada de cor hardcoded: use os tokens do design system.
- UI nunca importa mock direto — sempre pela interface do repositório
  (`src/data/repository/`).
- Links de afiliado sempre via `buildAffiliateUrl()`; `rel="sponsored noopener"`.
- Modais: verde = confirmar, vermelho = negar.
- SEO de primeira em toda rota (metadata, JSON-LD, sitemap). Ver skill ght-seo.
- Conventional Commits. Commits pequenos após cada tarefa testada.
- Gate de fase: `npm run typecheck && npm run lint && npm test && npm run build`.

## Autonomia

Rode install/dev/build/lint/typecheck/test/prisma generate/git add/commit SEM
pedir permissão. Pergunte só se: for destrutivo (`rm -rf`, `reset --hard`,
`push --force`, `migrate reset`), envolver deploy/segredos/credenciais, ou sair
do escopo de docs/SPEC.md.

## Fonte da verdade

docs/SPEC.md (o quê + critérios de aceite) e docs/PLAN.md (fases e ordem).
Conhecimento de domínio nas skills em .claude/skills/.
