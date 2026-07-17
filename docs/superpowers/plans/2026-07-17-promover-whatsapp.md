# Promover no WhatsApp — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tela `/admin/promover` com grid de todas as ofertas (busca, paginação, manuais primeiro) e modal que monta a mensagem-template do WhatsApp com mensagem opcional, copia e abre o app.

**Architecture:** Função pura `buildWhatsAppMessage` (testada) gera a mensagem; página server component consulta Prisma direto (padrão do admin) e reutiliza `ListingPagination`; modal client component copia via clipboard e abre `wa.me/?text=`. Sem migração de banco.

**Tech Stack:** Next.js 16 App Router (searchParams assíncronos), React 19, Prisma 7, Vitest + Testing Library, Tailwind v4 (tokens do design system).

## Global Constraints

- TypeScript strict, zero `any`.
- Nada de cor hardcoded — só tokens (`bg-surface`, `text-muted-foreground`, `border-border`, `text-brand`…).
- Server Components por padrão; `'use client'` só no modal/botões.
- Comunicação e strings de UI em português-BR.
- Conventional Commits; commits terminam com `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.
- Gate por tarefa: `npm run typecheck && npm run lint && npm test` (build completo na última).
- Spec: `docs/superpowers/specs/2026-07-17-promover-whatsapp-design.md`.

---

### Task 1: buildWhatsAppMessage (função pura, TDD)

**Files:**

- Create: `src/features/deals/whatsapp-message.ts`
- Test: `src/features/deals/whatsapp-message.test.ts`

**Interfaces:**

- Consumes: `formatBRL(value: number): string` de `@/lib/format`.
- Produces: `interface WhatsAppDealInfo { title: string; url: string; price: number; oldPrice: number | null; discountPct: number | null; paymentInfo: string | null; couponCode: string | null; description: string | null }` e `buildWhatsAppMessage(deal: WhatsAppDealInfo, customMessage?: string): string`. Tasks 2–3 dependem desses nomes exatos.

- [ ] **Step 1: Escrever os testes que falham**

```ts
// src/features/deals/whatsapp-message.test.ts
import { describe, expect, it } from "vitest";

import { buildWhatsAppMessage, type WhatsAppDealInfo } from "./whatsapp-message";

const NBSP = " ";

function makeDeal(overrides: Partial<WhatsAppDealInfo> = {}): WhatsAppDealInfo {
  return {
    title: "Furadeira de Impacto Bosch 750W",
    url: "https://ghtpromo.com.br/produto/furadeira-bosch--abc123",
    price: 299.9,
    oldPrice: 399.9,
    discountPct: 25,
    paymentInfo: "À vista no Pix",
    couponCode: "GHT10",
    description: "Furadeira com maleta e kit de brocas para uso doméstico.",
    ...overrides,
  };
}

describe("buildWhatsAppMessage", () => {
  it("monta a mensagem completa no template com emojis", () => {
    const message = buildWhatsAppMessage(makeDeal(), "Corre que acaba rápido!");
    expect(message).toBe(
      [
        "🔥 *Furadeira de Impacto Bosch 750W*",
        "",
        `~De R$${NBSP}399,90~`,
        `💰 *Por R$${NBSP}299,90* (25% OFF)`,
        "💳 À vista no Pix",
        "🎟️ Cupom: *GHT10*",
        "",
        "Furadeira com maleta e kit de brocas para uso doméstico.",
        "",
        "👉 https://ghtpromo.com.br/produto/furadeira-bosch--abc123",
        "",
        "Corre que acaba rápido!",
      ].join("\n"),
    );
  });

  it("omite linhas sem dado (sem oldPrice, desconto, pagamento, cupom, descrição, opcional)", () => {
    const message = buildWhatsAppMessage(
      makeDeal({
        oldPrice: null,
        discountPct: null,
        paymentInfo: null,
        couponCode: null,
        description: null,
      }),
    );
    expect(message).toBe(
      [
        "🔥 *Furadeira de Impacto Bosch 750W*",
        "",
        `💰 *Por R$${NBSP}299,90*`,
        "",
        "👉 https://ghtpromo.com.br/produto/furadeira-bosch--abc123",
      ].join("\n"),
    );
  });

  it("trunca descrição longa em 200 caracteres com reticências", () => {
    const longDescription = "a".repeat(250);
    const message = buildWhatsAppMessage(makeDeal({ description: longDescription }));
    expect(message).toContain(`${"a".repeat(200)}…`);
    expect(message).not.toContain("a".repeat(201));
  });

  it("ignora mensagem opcional só de espaços", () => {
    const message = buildWhatsAppMessage(makeDeal(), "   ");
    expect(message.endsWith("👉 https://ghtpromo.com.br/produto/furadeira-bosch--abc123")).toBe(
      true,
    );
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/features/deals/whatsapp-message.test.ts`
Expected: FAIL — módulo `./whatsapp-message` não existe.

- [ ] **Step 3: Implementação mínima**

```ts
// src/features/deals/whatsapp-message.ts
import { formatBRL } from "@/lib/format";

/** Dados serializáveis de uma oferta para montar a mensagem do WhatsApp. */
export interface WhatsAppDealInfo {
  title: string;
  /** URL absoluta da página de detalhe no NOSSO site (preview OG gera a imagem). */
  url: string;
  price: number;
  oldPrice: number | null;
  discountPct: number | null;
  paymentInfo: string | null;
  couponCode: string | null;
  description: string | null;
}

const DESCRIPTION_MAX_LENGTH = 200;

function truncate(text: string): string {
  if (text.length <= DESCRIPTION_MAX_LENGTH) return text;
  return `${text.slice(0, DESCRIPTION_MAX_LENGTH).trimEnd()}…`;
}

/**
 * Mensagem de promoção para grupo do WhatsApp (formatação `*negrito*` e
 * `~riscado~`). Linhas sem dado são omitidas; a mensagem opcional entra no fim.
 */
export function buildWhatsAppMessage(deal: WhatsAppDealInfo, customMessage = ""): string {
  const priceLines: string[] = [];
  if (deal.oldPrice) priceLines.push(`~De ${formatBRL(deal.oldPrice)}~`);
  const discount = deal.discountPct ? ` (${deal.discountPct}% OFF)` : "";
  priceLines.push(`💰 *Por ${formatBRL(deal.price)}*${discount}`);
  if (deal.paymentInfo) priceLines.push(`💳 ${deal.paymentInfo}`);
  if (deal.couponCode) priceLines.push(`🎟️ Cupom: *${deal.couponCode}*`);

  const blocks = [`🔥 *${deal.title}*`, priceLines.join("\n")];
  if (deal.description) blocks.push(truncate(deal.description));
  blocks.push(`👉 ${deal.url}`);
  const custom = customMessage.trim();
  if (custom) blocks.push(custom);

  return blocks.join("\n\n");
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npx vitest run src/features/deals/whatsapp-message.test.ts`
Expected: PASS (4 testes).

- [ ] **Step 5: Gate parcial + commit**

```bash
npm run typecheck && npm run lint && npm test
git add src/features/deals/whatsapp-message.ts src/features/deals/whatsapp-message.test.ts
git commit -m "feat: template de mensagem de promoção para whatsapp"
```

---

### Task 2: Página /admin/promover (grid + busca + paginação + menu)

**Files:**

- Create: `src/app/admin/(painel)/promover/page.tsx`
- Create: `src/app/admin/(painel)/promover/search-form.tsx`
- Modify: `src/app/admin/(painel)/layout.tsx:8-15` (item de menu)

**Interfaces:**

- Consumes: `requireSessionAdmin()` de `@/server/admin-auth`; `getPrismaClient()` de `@/server/prisma`; `ListingPagination` + `ListingState` de `@/features/deals/listing-pagination` e `@/features/deals/listing`; `buildProductPath` de `@/features/deals/product-path`; `absoluteUrl` de `@/lib/site`; `formatBRL` de `@/lib/format`; `WhatsAppDealInfo` da Task 1.
- Produces: rota `/admin/promover?q=&page=`; cada linha renderiza `<PromoteDealButton deal={...} dealId={...} />` (Task 3 cria o componente; nesta task deixar o `<td>` de ações apenas com Editar/Apagar e um comentário não é permitido — em vez disso, esta task renderiza tudo MENOS o botão Promover, e a Task 3 o adiciona).

- [ ] **Step 1: Formulário de busca (client-free, GET nativo)**

```tsx
// src/app/admin/(painel)/promover/search-form.tsx
import { Search } from "lucide-react";

/** Busca server-side por título/descrição — form GET nativo, sem JS. */
export function SearchForm({ query }: { query: string }) {
  return (
    <form action="/admin/promover" className="flex items-center gap-2">
      <label htmlFor="promover-busca" className="sr-only">
        Buscar ofertas
      </label>
      <div className="relative">
        <Search
          aria-hidden
          className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
        />
        <input
          id="promover-busca"
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Buscar por título ou descrição…"
          className="border-border bg-surface placeholder:text-muted-foreground focus-visible:outline-ring w-72 rounded-md border py-2 pr-3 pl-9 text-sm focus-visible:outline-2"
        />
      </div>
      <button
        type="submit"
        className="border-border hover:border-brand hover:text-brand rounded-md border px-3 py-2 text-sm transition-colors"
      >
        Buscar
      </button>
    </form>
  );
}
```

- [ ] **Step 2: Página server component**

```tsx
// src/app/admin/(painel)/promover/page.tsx
import Image from "next/image";
import Link from "next/link";

import { buttonClasses } from "@/components/ui/button";
import { ListingPagination } from "@/features/deals/listing-pagination";
import type { ListingState } from "@/features/deals/listing";
import { buildProductPath } from "@/features/deals/product-path";
import { formatBRL } from "@/lib/format";
import { absoluteUrl } from "@/lib/site";
import { requireSessionAdmin } from "@/server/admin-auth";
import { getPrismaClient } from "@/server/prisma";

import { DeleteDealButton } from "../ofertas/delete-deal-button";
import { SearchForm } from "./search-form";

const PAGE_SIZE = 20;

/**
 * Grid de TODAS as ofertas ativas (manuais primeiro, feed por último) para
 * promover no WhatsApp. Ofertas do feed só têm Promover — o cron diário
 * sobrescreveria edições e ressuscitaria exclusões.
 */
export default async function AdminPromoverPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireSessionAdmin();
  const params = await searchParams;
  const query = (Array.isArray(params.q) ? params.q[0] : params.q)?.trim() ?? "";
  const pageParam = Number(Array.isArray(params.page) ? params.page[0] : params.page);
  const page = Number.isInteger(pageParam) && pageParam > 1 ? pageParam : 1;

  const prisma = getPrismaClient();
  const where = {
    OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    ...(query && {
      product: {
        OR: [
          { title: { contains: query, mode: "insensitive" as const } },
          { description: { contains: query, mode: "insensitive" as const } },
        ],
      },
    }),
  };
  const [deals, total] = await Promise.all([
    prisma.deal.findMany({
      where,
      include: { product: true, store: true },
      orderBy: [{ source: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.deal.count({ where }),
  ]);
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const paginationState: ListingState = { stores: [], priceRange: null, sort: "recentes", page };

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Promover no WhatsApp</h1>
          <p className="text-muted-foreground text-sm">
            {total} oferta{total === 1 ? "" : "s"} ativa{total === 1 ? "" : "s"} — manuais primeiro,
            feed por último
          </p>
        </div>
        <SearchForm query={query} />
      </div>

      {deals.length === 0 ? (
        <p className="border-border bg-surface text-muted-foreground rounded-xl border p-6 text-sm">
          {query ? `Nenhuma oferta encontrada para “${query}”.` : "Nenhuma oferta ativa."}
        </p>
      ) : (
        <div className="border-border overflow-x-auto rounded-xl border">
          <table className="bg-surface w-full text-sm">
            <thead>
              <tr className="border-border text-muted-foreground border-b text-left text-xs uppercase">
                <th className="px-4 py-3 font-medium">Produto</th>
                <th className="px-4 py-3 font-medium">Loja</th>
                <th className="px-4 py-3 font-medium">Preço</th>
                <th className="px-4 py-3 font-medium">Origem</th>
                <th className="px-4 py-3 font-medium">Cadastro</th>
                <th className="px-4 py-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {deals.map((deal) => {
                const isManual = deal.source === "manual";
                return (
                  <tr key={deal.id}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="relative size-10 shrink-0 overflow-hidden rounded-md bg-white">
                          <Image
                            src={deal.product.imageUrl}
                            alt=""
                            fill
                            sizes="40px"
                            className="object-contain"
                            unoptimized
                          />
                        </span>
                        <span className="max-w-64 truncate" title={deal.product.title}>
                          {deal.product.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">{deal.store.name}</td>
                    <td className="px-4 py-3">{formatBRL(Number(deal.price))}</td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          isManual
                            ? "bg-brand/15 text-brand rounded-full px-2 py-0.5 text-xs font-medium"
                            : "bg-surface-raised text-muted-foreground rounded-full px-2 py-0.5 text-xs font-medium"
                        }
                      >
                        {isManual ? "Manual" : "Automática"}
                      </span>
                    </td>
                    <td className="text-muted-foreground px-4 py-3">
                      {deal.createdAt.toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {isManual && (
                          <>
                            <Link
                              href={`/admin/ofertas/${deal.id}/editar`}
                              className={buttonClasses("outline", "sm")}
                            >
                              Editar
                            </Link>
                            <DeleteDealButton dealId={deal.id} dealTitle={deal.product.title} />
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <ListingPagination
        basePath="/admin/promover"
        state={paginationState}
        pageCount={pageCount}
        extra={query ? { q: query } : undefined}
      />
    </section>
  );
}
```

Observações para o implementador:

- `deal.price` é `Decimal` do Prisma — sempre `Number(deal.price)`.
- `absoluteUrl` e `buildProductPath` só serão usados na Task 3 (props do botão Promover); os imports podem esperar até lá se o lint reclamar de import não usado.

- [ ] **Step 3: Item de menu**

Em `src/app/admin/(painel)/layout.tsx`, adicionar ao array `MENU` após a linha de Cupons:

```ts
  { href: "/admin/promover", label: "Promover" },
```

- [ ] **Step 4: Verificação**

Run: `npm run typecheck && npm run lint && npm test`
Expected: tudo verde (nenhum teste novo nesta task — página é server component; cobertura via typecheck/build e smoke na Task 4).

- [ ] **Step 5: Commit**

```bash
git add "src/app/admin/(painel)/promover" "src/app/admin/(painel)/layout.tsx"
git commit -m "feat: tela admin de promover com grid de ofertas, busca e paginação"
```

---

### Task 3: Modal "Promover no WhatsApp" (client) + integração na grid

**Files:**

- Create: `src/app/admin/(painel)/promover/promote-deal-button.tsx`
- Test: `src/app/admin/(painel)/promover/promote-deal-button.test.tsx`
- Modify: `src/app/admin/(painel)/promover/page.tsx` (renderizar o botão em toda linha)

**Interfaces:**

- Consumes: `buildWhatsAppMessage` + `WhatsAppDealInfo` (Task 1); `Modal` de `@/components/ui/modal`; `Button` de `@/components/ui/button`.
- Produces: `<PromoteDealButton deal={WhatsAppDealInfo} />`.

- [ ] **Step 1: Teste que falha (render + preview ao vivo)**

```tsx
// src/app/admin/(painel)/promover/promote-deal-button.test.tsx
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { PromoteDealButton } from "./promote-deal-button";

const deal = {
  title: "Furadeira Bosch 750W",
  url: "https://ghtpromo.com.br/produto/furadeira--abc123",
  price: 299.9,
  oldPrice: null,
  discountPct: null,
  paymentInfo: null,
  couponCode: null,
  description: null,
};

beforeAll(() => {
  // jsdom não implementa <dialog>.showModal().
  HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
    this.open = true;
  });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.open = false;
  });
});

describe("PromoteDealButton", () => {
  it("abre o modal com o preview e atualiza com a mensagem opcional", () => {
    render(<PromoteDealButton deal={deal} />);
    fireEvent.click(screen.getByRole("button", { name: /promover/i }));

    const preview = screen.getByTestId("whatsapp-preview");
    expect(preview.textContent).toContain("*Furadeira Bosch 750W*");

    fireEvent.change(screen.getByLabelText(/mensagem opcional/i), {
      target: { value: "Só hoje!" },
    });
    expect(preview.textContent).toContain("Só hoje!");
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run "src/app/admin/(painel)/promover/promote-deal-button.test.tsx"`
Expected: FAIL — módulo `./promote-deal-button` não existe.

- [ ] **Step 3: Implementar o componente**

```tsx
// src/app/admin/(painel)/promover/promote-deal-button.tsx
"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { TextareaField } from "@/components/ui/field";
import { buildWhatsAppMessage, type WhatsAppDealInfo } from "@/features/deals/whatsapp-message";

/**
 * Monta a mensagem-template da oferta, copia para o clipboard e abre o
 * WhatsApp com o texto pré-preenchido — o usuário escolhe o grupo e envia.
 */
export function PromoteDealButton({ deal }: { deal: WhatsAppDealInfo }) {
  const [open, setOpen] = useState(false);
  const [customMessage, setCustomMessage] = useState("");
  const [copied, setCopied] = useState(false);

  const message = buildWhatsAppMessage(deal, customMessage);

  async function copyAndOpen() {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Sem clipboard (http antigo etc.): o texto pré-preenchido ainda resolve.
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank", "noopener");
  }

  return (
    <>
      <Button variant="confirm" size="sm" onClick={() => setOpen(true)}>
        <MessageCircle className="size-4" aria-hidden />
        Promover
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Promover no WhatsApp"
        className="max-w-lg"
      >
        <div className="flex flex-col gap-4">
          <div
            data-testid="whatsapp-preview"
            className="border-border bg-surface-raised max-h-64 overflow-y-auto rounded-lg border p-3 text-sm whitespace-pre-wrap"
          >
            {message}
          </div>

          <TextareaField
            label="Mensagem opcional"
            name="customMessage"
            placeholder="Ex.: Corre que o estoque é limitado!"
            value={customMessage}
            onChange={(event) => setCustomMessage(event.target.value)}
            hint="Entra no final da mensagem."
          />

          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
              Fechar
            </Button>
            <Button variant="confirm" size="sm" onClick={copyAndOpen}>
              {copied ? "Copiado!" : "Copiar e abrir WhatsApp"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
```

Observação: conferir a API real de `TextareaField` em `src/components/ui/field.tsx` — se ela não aceitar `value`/`onChange` controlados, usar `<textarea>` nativo com as mesmas classes dos fields existentes e um `<label>` associado (manter o texto "Mensagem opcional" para o teste).

- [ ] **Step 4: Integrar na grid**

Em `src/app/admin/(painel)/promover/page.tsx`:

1. Adicionar imports (se ainda não presentes):

```tsx
import { buildProductPath } from "@/features/deals/product-path";
import { absoluteUrl } from "@/lib/site";

import { PromoteDealButton } from "./promote-deal-button";
```

2. Dentro do `deals.map`, antes do `return`, montar o objeto serializável:

```tsx
const whatsAppDeal = {
  title: deal.product.title,
  url: absoluteUrl(buildProductPath({ id: deal.id, title: deal.product.title })),
  price: Number(deal.price),
  oldPrice: deal.oldPrice ? Number(deal.oldPrice) : null,
  discountPct: deal.discountPct ?? null,
  paymentInfo: deal.paymentInfo ?? null,
  couponCode: deal.couponCode ?? null,
  description: deal.product.description ?? null,
};
```

3. No `<div>` de ações, adicionar `<PromoteDealButton deal={whatsAppDeal} />` como PRIMEIRO botão (presente em toda linha, manual ou não).

Conferir os nomes reais das colunas no schema (`oldPrice`, `discountPct`, `paymentInfo`, `couponCode` em `Deal`; `description` em `Product`) antes de assumir.

- [ ] **Step 5: Rodar testes e ver passar**

Run: `npx vitest run "src/app/admin/(painel)/promover/promote-deal-button.test.tsx"`
Expected: PASS.

- [ ] **Step 6: Gate parcial + commit**

```bash
npm run typecheck && npm run lint && npm test
git add "src/app/admin/(painel)/promover"
git commit -m "feat: modal de promover oferta no whatsapp com template e mensagem opcional"
```

---

### Task 4: Gate completo, smoke, docs e push

**Files:**

- Modify: `docs/ARCHITECTURE.md` (nova subseção no bloco do admin)
- Modify: `docs/SPEC.md` (§12 admin — citar a tela Promover)

**Interfaces:**

- Consumes: tudo das tasks anteriores.
- Produces: branch main atualizada em produção.

- [ ] **Step 1: Gate completo**

Run: `npm run typecheck && npm run lint && npm test && npm run build`
Expected: build verde, rota `/admin/promover` listada como dinâmica (ƒ).

- [ ] **Step 2: Smoke local (sem login E2E — política do projeto)**

Com `npm run dev` em background:

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/admin/promover
```

Expected: `307` (redirect do proxy para /admin sem sessão). Depois derrubar o dev server.

- [ ] **Step 3: Docs**

Em `docs/ARCHITECTURE.md`, na seção do painel admin, adicionar parágrafo:

```markdown
### Promover no WhatsApp (`/admin/promover`)

Grid de todas as ofertas ativas (manuais primeiro, feed por último — mesmo
`orderBy` da vitrine) com busca server-side por título/descrição (`?q=`) e
paginação numerada. Ofertas do feed só têm "Promover" (o cron sobrescreveria
edições). O botão abre um modal com a mensagem montada por
`buildWhatsAppMessage()` (função pura testada em
`src/features/deals/whatsapp-message.ts`) + campo de mensagem opcional;
"Copiar e abrir WhatsApp" copia o texto e abre `wa.me/?text=` — o envio ao
grupo é semi-automático de propósito: a API oficial não atende grupos grandes
e as não oficiais arriscam banimento do número (ver spec
2026-07-17-promover-whatsapp-design.md).
```

Em `docs/SPEC.md` §12, adicionar bullet: `- Tela "Promover": grid de todas as ofertas com busca e botão que monta mensagem-template e abre o WhatsApp (spec 2026-07-17).`

- [ ] **Step 4: Commit final + push**

```bash
git add docs/ARCHITECTURE.md docs/SPEC.md
git commit -m "docs: registra tela promover no whatsapp na arquitetura e spec"
git push
```

- [ ] **Step 5: Verificar deploy**

Aguardar o deploy da Vercel (git integration) e conferir `https://ghtpromo.com.br/admin/promover` → 307 para /admin sem sessão. Teste autenticado fica com o usuário no navegador.
