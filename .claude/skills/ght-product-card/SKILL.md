---
name: ght-product-card
description: Anatomia do card de produto e regras de link de afiliado do GHT Promoções. Usar ao criar/alterar cards, grades de produto ou listagens de categoria.
---

# Card de produto — anatomia

Formato e-commerce/garimpeiros (tipo Kabum), usado na home e em `/categorias/[slug]`.

## Elementos (nesta ordem visual)

1. **Imagem do produto** (`next/image`, `alt` descritivo, placeholder local) com
   **selo da loja** sobreposto no **canto superior esquerdo**: pill retangular
   (SVG em `public/stores/`, ~120×36) com o wordmark fiel da marca (Amazon,
   Magalu, KaBuM!…), nome da loja acessível via `sr-only`.
2. **Título** (truncado com elegância, title completo acessível; nível de
   heading contextual via prop `titleAs` — h3 na home, h2 em categoria/busca).
3. **Preço atual em destaque** + **preço antigo riscado** + **selo de % de desconto**.
4. Botão **"Ver oferta"** em largura total.

## Regras do link de afiliado (obrigatórias)

- URL **sempre** via `buildAffiliateUrl(product)` (`src/lib/`) — nunca montar
  link direto do mock/campo.
- `target="_blank"` + `rel="sponsored noopener"` (correto para afiliado + SEO).
- Botão verde (CTA positivo, ver skill ght-design-system).

## SEO

- Cada card/listagem emite JSON-LD `Product` + `Offer` (preço, moeda BRL,
  disponibilidade). Ver skill ght-seo.
