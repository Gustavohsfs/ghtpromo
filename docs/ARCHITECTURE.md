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

## Testes (Fase 2)

- Vitest + Testing Library (jsdom, `globals: true` para auto-cleanup).
- Polyfill de `HTMLDialogElement.showModal/close` em `vitest.setup.ts`
  (jsdom ainda não implementa `<dialog>`).
