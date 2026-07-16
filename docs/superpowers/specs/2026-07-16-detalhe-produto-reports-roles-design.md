# Detalhe de produto, reports, roles e ajustes visuais — design

> 2026-07-16, branch `feature/novas-funcoes-sistema-1` (PR manual do usuário).
> Referência visual citada: página de produto do garimpeiros — **inspiração,
> não cópia**; layout e texto próprios.

## 1. Enquadramento de imagem

Imagens de oferta (hotlink manual e feed) passam a `object-contain` sobre
fundo branco no card, no detalhe e no preview do formulário admin — foto de
produto de loja é branca por padrão; `contain` nunca corta detalhes.

## 2. Página de detalhe `/produto/[slug]`

- **URL**: `slug = slugify(título)--dealId` (`buildProductPath`/
  `extractDealId` puros e testados). Lookup só pelo `dealId`; página dinâmica
  (catálogo muda diariamente), `notFound()` para id inexistente/expirado.
- **Conteúdo**: imagem à esquerda (contain, fundo branco); à direita: selo da
  loja, título (h1), "Postado em {data}", bloco de preço (riscado + % quando
  houver), **forma de pagamento** e **cupom** (novos campos opcionais
  `Deal.paymentInfo`/`Deal.couponCode` — preenchíveis no form do admin; feed
  fica nulo e o bloco some), CTA "Ver oferta" (mesmo fluxo de confirmação),
  **Compartilhar** (dropdown: copiar link do NOSSO site · WhatsApp via
  `wa.me` — fluxo padrão em celular e desktop), **Reportar** (modal com
  motivos: preço incorreto · oferta inexistente · problema com o produto ·
  outro + detalhes opcionais → grava `Report` no banco, sem login) e o
  disclaimer: divulgamos a oferta, preço/estoque podem divergir na loja.
- **SEO**: metadata + canonical + OG com a imagem do produto; JSON-LD
  `Product` ganha `url` para a página de detalhe. Cards (imagem+título)
  passam a linkar para o detalhe; "Ver oferta" continua indo à loja.
- Domínio `Deal` ganha `createdAt`, `paymentInfo`, `couponCode`.

## 3. Favicon

Identidade do `ghtpromo-logo-full-dark`: a parte quadrada (fundo escuro +
tag verde) vira `src/app/icon.svg` (nítido em qualquer tamanho) e substitui
o `favicon.ico` (PNG 256 embrulhado em ICO) — wordmark inteiro fica ilegível
em 16px.

## 4. Reports e roles

- **`Report`**: `dealId` (cascade), `reason`, `details?`, `status`
  (`aberto`/`resolvido`), `createdAt`. Tela `/admin/reports`: lista com
  produto, motivo, data, status; ações marcar resolvido/reabrir e apagar.
- **`Admin.role`**: `owner` | `admin` (default). O e-mail do Gustavo vira
  `owner` por script. `/admin/admins` passa a ser **exclusiva do owner**
  (menu esconde para os demais; página e actions revalidam o role):
  cadastrar admin, **apagar admin** (menos a si próprio, com confirmação) e
  **redefinir senha** de qualquer admin.

## Fora de escopo

Sitemap de produtos (4k URLs — backlog), notificação de report por e-mail,
múltiplos owners.
