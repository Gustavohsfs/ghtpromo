---
name: ght-splash
description: Spec da animação de abertura do GHT Promoções (geometria das linhas de energia, círculo com logo, pulso, timing). Usar ao criar ou ajustar a splash screen.
---

# Splash de abertura — spec

Componente client isolado em `src/components/splash/`. SVG + CSS puro, sem libs.

## Geometria (SVG, fundo preto)

- **Duas linhas de energia simétricas** (espelhadas no eixo vertical central),
  próximas às bordas esquerda/direita.
- Cada linha **começa vertical, subindo de baixo**; perto da parte inferior faz
  **curva de canto arredondado** dobrando ~**40° para dentro** (rumo ao centro).
- As linhas **convergem para um círculo central** com o logotipo **"ghtpromo"**.
- **Acima do círculo**, voltam a subir verticalmente.
- Forma resultante: "cálice"/funil de energia simétrico.

## Pulso

- Um **pulso de luz verde sobe de baixo, simultâneo nas duas linhas**, percorre
  a curva, atinge o círculo (**que dá um glow**) e continua subindo.
- Lento e orgânico: **~2.5–4s por ciclo**, easing suave, **1–2 ciclos** e
  fade-out do splash inteiro.
- Técnica: trilho = traço fino verde tênue; pulso = segmento luminoso via
  `stroke-dasharray`/`stroke-dashoffset` (ou máscara/gradiente animado).
  Glow via `filter: drop-shadow` / `feGaussianBlur`.

## Comportamento

- Mostrar **1x por sessão** (`sessionStorage`, chave/flag configurável).
- `prefers-reduced-motion`: logo estático sem pulso, ou pular direto.
- Fade-out suave revelando o app; sem bloquear interação além do necessário.
