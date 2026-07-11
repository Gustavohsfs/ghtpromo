---
name: ght-design-system
description: Tokens e regras visuais do GHT Promoções (tema escuro + verde, semântica de cores, linhas de energia). Usar sempre que for estilizar qualquer UI — componentes, páginas, estados de hover/foco.
---

# Design system — GHT Promoções

## Tokens (fonte: `src/app/globals.css`, tema Tailwind v4 via `@theme`)

- **Nunca** use cor hardcoded em JSX/CSS de componente. Sempre tokens.
- Base escura: fundo quase-preto (`#05080A`–`#0A0F0D`), superfícies elevadas em
  camadas sutis, texto claro com contraste AA/AAA.
- **Verde de energia** (neon/esmeralda) é a cor de marca/acento, com variações
  para glow (`drop-shadow`/`box-shadow` esverdeados, opacidade baixa).
- Vermelho apenas para ações destrutivas/negação.

## Semântica de cores (obrigatória)

- **Verde = confirmar / positivo / CTA principal.**
- **Vermelho = negar / cancelar / destrutivo.**
- Vale para modais, botões, toasts e qualquer ação binária.

## Motivo "linhas de energia"

- Detalhes lineares verdes com **pulso lento e sutil** (bordas da sidebar,
  divisores, hover de cards). Discreto — nunca poluído.
- Toda animação respeita `prefers-reduced-motion` (desativar pulso, manter cor).

## Tipografia e ícones

- Fontes via `next/font` (definidas no layout raiz). Ícones: `lucide-react`.
- Hierarquia de headings semântica (um `h1` por página).
