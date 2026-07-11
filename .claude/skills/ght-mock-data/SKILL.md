---
name: ght-mock-data
description: Como criar/editar dados mock e onde ficam dados sensíveis no GHT Promoções. Usar ao criar ou alterar produtos, categorias, lojas ou a camada de repositório.
---

# Dados mock e camada de dados

## Mocks de vitrine (`src/mocks/` — COMMITADOS)

- Tipados (`Product`, `Store`, `Category`, `Deal` — tipos em `src/features/deals/`).
- **Todo item com `isMock: true`** + banner de comentário no topo do arquivo
  avisando que são dados fictícios.
- **Mínimo 3 produtos por categoria.** Categorias: eletrônicos, geladeiras,
  TVs, computadores, iPhones.
- Produto: `id`, `title`, `imageUrl` (placeholder local em `public/`), `price`,
  `oldPrice`, `discountPct`, `store` (nome + `iconUrl` circular),
  `categorySlug`, `affiliateUrl`.
- Selo visual discreto "dados de demonstração" quando `DATA_SOURCE=mock`.

## Regra de acesso (inviolável)

- **UI nunca importa `src/mocks/` direto.** Sempre pela interface
  `DealsRepository` (`src/data/repository/`).
- Seletor lê `process.env.DATA_SOURCE` (`mock` | `prisma`), default `mock`.
- Trocar de mock para Prisma = trocar implementação; zero mudança na UI.

## Dados sensíveis (`data/private/` — GITIGNORADO)

- Links de afiliado reais/chaves vão em `data/private/` (ignorado) e/ou env.
- Só arquivos `*.example.ts` são commitados como referência.
- O build **nunca** pode depender de arquivo real em `data/private/`.
