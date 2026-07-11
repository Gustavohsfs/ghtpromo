---
name: ght-seo
description: Checklist de SEO e descoberta (Google + IAs) do GHT Promoções. Usar ao criar qualquer rota/página nova ou alterar metadata, sitemap, robots ou JSON-LD.
---

# SEO — checklist por rota

Ao criar/alterar qualquer página, verifique TODOS os itens:

## Metadata (Next Metadata API)

- [ ] `metadata` ou `generateMetadata` com título e descrição únicos.
- [ ] `metadataBase` definido no layout raiz.
- [ ] `alternates.canonical` para a URL limpa da rota.
- [ ] Open Graph + Twitter Cards; OG image via `ImageResponse`
      (`opengraph-image.tsx`).

## Dados estruturados (JSON-LD, schema.org)

- Layout raiz: `Organization` + `WebSite` (com `SearchAction`).
- Página de categoria: `ItemList` + `BreadcrumbList`.
- Produto/card: `Product` + `Offer` (preço, `priceCurrency: "BRL"`,
  disponibilidade).
- Validar estrutura (sem campos inventados; tipos corretos).

## Site-wide

- `app/sitemap.ts` cobre home + todas as categorias.
- `app/robots.ts`: crawlers de IA (GPTBot, ClaudeBot, PerplexityBot,
  Google-Extended) **permitidos**, de forma configurável.
- `public/llms.txt` descreve o site e as categorias — atualizar ao criar
  categoria nova.

## Fundamentos

- URLs limpas e semânticas; HTML semântico; um `h1` por página; hierarquia de
  headings; `alt` em toda imagem.
- Performance: Server Components/SSG onde couber, `next/image`, `next/font`.
  Meta Lighthouse: SEO 100, demais ≥95.
