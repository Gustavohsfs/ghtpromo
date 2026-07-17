# Promover no WhatsApp — design

Data: 2026-07-17 · Status: aprovado

## Objetivo

Nova tela no painel admin para listar **todas** as ofertas (manuais + KaBuM) em
uma grid com busca e, por oferta, montar uma mensagem de promoção no template do
GHT e enviá-la ao grupo de clientes no WhatsApp com o mínimo de toques.

## Contexto e decisão de mecanismo de envio

O número do usuário está no **aplicativo WhatsApp Business**. Estado das opções
(jul/2026):

- **Cloud API oficial (Groups API)**: grupos limitados a 8 membros, exige
  Official Business Account e não funciona com números do app Business. Não
  atende.
- **APIs não oficiais** (Evolution, Z-API, whatsapp-web.js, Baileys): violam os
  termos do WhatsApp; risco de banimento do número. Descartado.
- **Escolhido: fluxo semi-automático via link** — o admin monta a mensagem,
  copia para o clipboard e abre o WhatsApp com o texto pré-preenchido; o usuário
  escolhe o grupo e envia (~2 toques). Zero risco, zero custo. A imagem do
  produto aparece pelo preview Open Graph do link da página de produto.

A tela fica independente do mecanismo: se a API oficial liberar grupos grandes
no futuro, troca-se apenas a etapa de envio.

## Escopo

### Rota e menu

- Nova página `/admin/promover` no grupo `(painel)`, protegida por
  `requireSessionAdmin()` como as demais.
- Item **"Promover"** no menu do painel. A aba **Ofertas atual não muda**.

### Grid de ofertas

- Lista todas as ofertas não expiradas do banco (manuais e `source: "awin"`).
- Colunas: miniatura, título, loja, preço, origem (badge "Manual" /
  "Automática"), data de cadastro, ações.
- **Busca** por título e descrição (`?q=`, case-insensitive, server-side).
- **Paginação numerada** (`?page=`) reutilizando o componente existente.
- **Ordenação fixa**: `orderBy: [{ source: "desc" }, { createdAt: "desc" }]` —
  manuais recentes primeiro, KaBuM por último (padrão já usado na vitrine).
- Ações por linha:
  - Oferta **manual**: Promover · Editar (link para
    `/admin/ofertas/[id]/editar` já existente) · Deletar (confirmação,
    reaproveita a action atual, que já é restrita a manuais).
  - Oferta **KaBuM/awin**: apenas Promover (o cron diário sobrescreveria
    edições e ressuscitaria exclusões).

### Fluxo "Promover no WhatsApp"

Modal (client component) com:

1. **Preview da mensagem** montada pelo template (abaixo), atualizado ao vivo.
2. Textarea **"Mensagem opcional"** — entra no final da mensagem.
3. Botão verde **"Copiar e abrir WhatsApp"**: copia via clipboard e abre
   `https://wa.me/?text=<mensagem urlencoded>`. Fallback: mensagem já está no
   clipboard para colar manualmente.
4. Botão secundário "Fechar".

### Template da mensagem (estilo com emojis)

```
🔥 *<título>*

~De R$ <preço antigo>~            ← só se houver oldPrice
💰 *Por R$ <preço>* (<XX>% OFF)   ← % só se houver desconto
💳 <forma de pagamento>            ← só se houver paymentInfo
🎟️ Cupom: *<código>*              ← só se houver couponCode
<descrição truncada ~200 chars>    ← só se houver descrição

👉 https://ghtpromo.com.br/produto/<slug>--<id>

<mensagem opcional>                ← só se preenchida
```

- Formatação WhatsApp: `*negrito*`, `~riscado~`.
- Link gerado com `buildProductPath()` + origem canônica do site.
- Preços no formato pt-BR (`R$ 1.234,56`).

## Arquitetura

- `buildWhatsAppMessage(deal, customMessage?)`: **função pura** em
  `src/features/deals/whatsapp-message.ts`, com testes unitários (linhas
  condicionais, truncamento da descrição, formatação de preço, encoding).
- Página server component consulta Prisma direto (padrão aceito no admin);
  busca com `OR: [{ title: contains }, { description: contains }]`,
  `mode: "insensitive"`.
- Modal e botões de ação são client components pequenos e focados.
- **Sem migração de banco** — usa apenas campos existentes.

## Fora de escopo (por ora)

- Envio automático via API (oficial ou não).
- Histórico/log de promoções enviadas.
- Seleção múltipla de ofertas para envio em lote.

## Critérios de aceite

1. `/admin/promover` lista manuais primeiro (recentes no topo) e KaBuM por
   último, com paginação.
2. Busca por termo encontra ofertas KaBuM por título/descrição.
3. Linha KaBuM não exibe Editar/Deletar; linha manual exibe os três botões.
4. Modal monta a mensagem correta para ofertas com e sem oldPrice, cupom,
   paymentInfo e descrição; mensagem opcional entra no final.
5. Botão copia a mensagem e abre o WhatsApp com o texto pré-preenchido.
6. Gate completo passa: typecheck, lint, test, build.
