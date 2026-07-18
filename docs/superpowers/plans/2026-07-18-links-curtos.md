# Links curtos `/p/{code}` — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Links de compartilhamento curtos (`ghtpromo.com.br/p/Ab3xK9q`) com contagem de cliques por oferta, usados pelo Promover (admin) e pelo Compartilhar (página de produto).

**Architecture:** Coluna `short_code` (nanoid 7, única) e `click_count` no model `Deal`; route handler `/p/[code]` resolve via `DealsRepository`, conta o clique (exceto bots) e responde 302 para a página longa do produto. Spec: `docs/superpowers/specs/2026-07-18-links-curtos-design.md`.

**Tech Stack:** Next.js 16 (App Router, route handler), Prisma 7 + PostgreSQL (Neon), nanoid, Vitest.

## Global Constraints

- Next 16: `params` de route handler é **assíncrono** (`Promise<{ code: string }>`); em dúvida, ler `node_modules/next/dist/docs/`.
- TypeScript strict, zero `any`.
- UI/rotas nunca importam mock ou Prisma direto — sempre via `src/data/repository/` (exceção já aceita: páginas do admin usam Prisma direto).
- Comentários e mensagens em português-BR; Conventional Commits.
- Redirect é **302** (nunca 301 — navegador cachearia e cliques repetidos escapariam da contagem).
- Gate de fase ao final: `npm run typecheck && npm run lint && npm test && npm run build`.
- Testes colocados junto do código (`*.test.ts`), padrão Vitest do repo.

---

### Task 1: Helpers de código curto (`generateShortCode` / `deriveShortCode`)

**Files:**

- Create: `src/features/deals/short-code.ts`
- Test: `src/features/deals/short-code.test.ts`
- Modify: `package.json` (dep `nanoid`)

**Interfaces:**

- Consumes: nada.
- Produces: `SHORT_CODE_ALPHABET: string` (62 alfanuméricos), `SHORT_CODE_LENGTH = 7`, `generateShortCode(): string` (aleatório, nanoid) e `deriveShortCode(seed: string): string` (determinístico, FNV-1a — usado pelos mocks). Tasks 3–4 dependem desses nomes exatos.

- [ ] **Step 1: Instalar nanoid**

Run: `npm install nanoid`
Expected: entrada `"nanoid"` em `dependencies` do package.json.

- [ ] **Step 2: Escrever os testes (falhando)**

`src/features/deals/short-code.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import {
  deriveShortCode,
  generateShortCode,
  SHORT_CODE_ALPHABET,
  SHORT_CODE_LENGTH,
} from "./short-code";

const VALID_CODE = new RegExp(`^[${SHORT_CODE_ALPHABET}]{${SHORT_CODE_LENGTH}}$`);

describe("generateShortCode", () => {
  it("gera código de 7 caracteres do alfabeto alfanumérico", () => {
    expect(generateShortCode()).toMatch(VALID_CODE);
  });

  it("gera códigos diferentes a cada chamada", () => {
    const codes = new Set(Array.from({ length: 100 }, () => generateShortCode()));
    expect(codes.size).toBe(100);
  });
});

describe("deriveShortCode", () => {
  it("é determinístico para a mesma seed", () => {
    expect(deriveShortCode("echo-dot-5")).toBe(deriveShortCode("echo-dot-5"));
  });

  it("gera código válido e distinto para seeds distintas", () => {
    const a = deriveShortCode("echo-dot-5");
    const b = deriveShortCode("jbl-charge-5");
    expect(a).toMatch(VALID_CODE);
    expect(b).toMatch(VALID_CODE);
    expect(a).not.toBe(b);
  });
});
```

- [ ] **Step 3: Rodar e ver falhar**

Run: `npx vitest run src/features/deals/short-code.test.ts`
Expected: FAIL — módulo `./short-code` não existe.

- [ ] **Step 4: Implementar**

`src/features/deals/short-code.ts`:

```ts
import { customAlphabet } from "nanoid";

/** Alfabeto URL-safe sem hífen/underscore — código legível em qualquer chat. */
export const SHORT_CODE_ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

export const SHORT_CODE_LENGTH = 7;

/**
 * Código aleatório do link curto /p/{code}. 62^7 ≈ 3,5 tri de combinações —
 * colisão desprezível; o índice único no banco é a última linha de defesa.
 */
export const generateShortCode = customAlphabet(SHORT_CODE_ALPHABET, SHORT_CODE_LENGTH);

/**
 * Código estável derivado de uma seed (hash FNV-1a) — dados mock/demo
 * precisam do mesmo código em todo processo para o seed ser idempotente.
 */
export function deriveShortCode(seed: string): string {
  let hash = 0x811c9dc5;
  const mix = (value: number) => {
    hash ^= value;
    hash = Math.imul(hash, 0x01000193) >>> 0;
  };
  for (let index = 0; index < seed.length; index++) mix(seed.charCodeAt(index));

  let code = "";
  for (let index = 0; index < SHORT_CODE_LENGTH; index++) {
    mix(index);
    code += SHORT_CODE_ALPHABET[hash % SHORT_CODE_ALPHABET.length];
  }
  return code;
}
```

- [ ] **Step 5: Rodar e ver passar**

Run: `npx vitest run src/features/deals/short-code.test.ts`
Expected: PASS (4 testes).

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json src/features/deals/short-code.ts src/features/deals/short-code.test.ts
git commit -m "feat: helpers de código curto (nanoid + derivação determinística)"
```

---

### Task 2: Schema Prisma + migration com backfill

**Files:**

- Modify: `prisma/schema.prisma` (model `Deal`, ~linha 102)
- Create: `prisma/migrations/<timestamp>_short_links/migration.sql`

**Interfaces:**

- Consumes: nada.
- Produces: colunas `Deal.shortCode: string` (única) e `Deal.clickCount: number` no client Prisma gerado. Tasks 3–4 e 7 dependem delas.

**Atenção:** a migration é **aditiva** (duas colunas novas + backfill) — não altera nem remove dados existentes. `prisma migrate dev` usa a `DATABASE_URL` do `.env` local.

- [ ] **Step 1: Adicionar campos no schema**

Em `prisma/schema.prisma`, dentro de `model Deal` (após `couponCode`):

```prisma
  /// Código do link curto /p/{code} (nanoid 7, alfanumérico); estável pela
  /// vida da oferta — gerado na criação, nunca alterado.
  shortCode  String @unique @map("short_code")
  /// Cliques no link curto (acessos de bots não contam).
  clickCount Int    @default(0) @map("click_count")
```

- [ ] **Step 2: Criar a migration sem aplicar**

Run: `npx prisma migrate dev --create-only --name short_links`
Expected: nova pasta `prisma/migrations/<timestamp>_short_links/` com `migration.sql`.

- [ ] **Step 3: Editar o SQL para incluir o backfill**

Substituir o conteúdo de `migration.sql` por:

```sql
-- Colunas do link curto: código estável + contador de cliques.
ALTER TABLE "deals" ADD COLUMN "click_count" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "deals" ADD COLUMN "short_code" TEXT;

-- Backfill das ofertas existentes: código determinístico derivado do id
-- (md5 truncado — alfanumérico hex, único entre poucos milhares de linhas).
UPDATE "deals" SET "short_code" = substr(md5("id"), 1, 7);

ALTER TABLE "deals" ALTER COLUMN "short_code" SET NOT NULL;
CREATE UNIQUE INDEX "deals_short_code_key" ON "deals"("short_code");
```

- [ ] **Step 4: Aplicar e regenerar o client**

Run: `npx prisma migrate dev`
Expected: migration aplicada sem erro; `prisma generate` roda em seguida (client em `src/generated/prisma`, gitignorado).

- [ ] **Step 5: Typecheck**

Run: `npm run typecheck`
Expected: PASS — os campos novos são opcionais de ler; nenhum código os usa ainda.

- [ ] **Step 6: Commit**

```bash
git add prisma/schema.prisma prisma/migrations
git commit -m "feat: colunas short_code e click_count em deals com backfill"
```

---

### Task 3: Tipo de domínio + pontos de criação (mocks, seed, Awin, admin)

**Files:**

- Modify: `src/features/deals/types.ts` (interface `Deal`)
- Modify: `src/mocks/deals.ts` (função `mockDeal`)
- Modify: `src/data/repository/prisma-deals.repository.ts` (função `mapDeal`, ~linha 40)
- Modify: `prisma/seed.ts` (~linha 60)
- Modify: `src/server/awin-import.ts` (upsert de deal, ~linha 168)
- Modify: `src/app/admin/(painel)/ofertas/actions.ts` (`createDealAction`, ~linha 39)
- Test: `src/mocks/mocks.test.ts` (adicionar caso)

**Interfaces:**

- Consumes: `deriveShortCode`, `generateShortCode` (Task 1); coluna `shortCode` (Task 2).
- Produces: `Deal.shortCode: string` no tipo de domínio, preenchido em todas as fontes. Tasks 4, 6 e 7 dependem disso.

- [ ] **Step 1: Teste de unicidade nos mocks (falhando)**

Em `src/mocks/mocks.test.ts`, adicionar:

```ts
it("todo deal mock tem shortCode único de 7 caracteres", () => {
  const codes = MOCK_DEALS.map((deal) => deal.shortCode);
  expect(new Set(codes).size).toBe(MOCK_DEALS.length);
  for (const code of codes) expect(code).toMatch(/^[0-9A-Za-z]{7}$/);
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/mocks/mocks.test.ts`
Expected: FAIL — `shortCode` não existe em `Deal` (erro de compilação do teste).

- [ ] **Step 3: Adicionar `shortCode` ao tipo `Deal`**

Em `src/features/deals/types.ts`, na interface `Deal` (após `couponCode`):

```ts
/** Código do link curto /p/{code} (7 chars alfanuméricos, único). */
shortCode: string;
```

- [ ] **Step 4: Preencher em todas as fontes**

`src/mocks/deals.ts` — em `mockDeal`, adicionar ao objeto retornado (e o import):

```ts
import { deriveShortCode } from "@/features/deals/short-code";
// ... no objeto retornado por mockDeal:
    shortCode: deriveShortCode(id),
```

`src/data/repository/prisma-deals.repository.ts` — em `mapDeal`:

```ts
    shortCode: row.shortCode,
```

`prisma/seed.ts` — o código vem do mock (determinístico) e só entra no
`create` (upsert nunca troca código de oferta existente):

```ts
await prisma.deal.upsert({
  where: { id: deal.id },
  create: { id: deal.id, shortCode: deal.shortCode, ...dealData },
  update: dealData,
});
```

`src/server/awin-import.ts` — no `prisma.deal.upsert`, **apenas no `create`**
(import de `generateShortCode` no topo):

```ts
import { generateShortCode } from "@/features/deals/short-code";
// ... no create do deal.upsert:
        shortCode: generateShortCode(),
```

`src/app/admin/(painel)/ofertas/actions.ts` — em `createDealAction`, no
`prisma.deal.create` (import no topo):

```ts
import { generateShortCode } from "@/features/deals/short-code";
// ... no data do deal.create:
      shortCode: generateShortCode(),
```

- [ ] **Step 5: Rodar testes e typecheck**

Run: `npx vitest run && npm run typecheck`
Expected: PASS — inclusive o teste novo de unicidade.

- [ ] **Step 6: Commit**

```bash
git add src/features/deals/types.ts src/mocks/deals.ts src/mocks/mocks.test.ts src/data/repository/prisma-deals.repository.ts prisma/seed.ts src/server/awin-import.ts "src/app/admin/(painel)/ofertas/actions.ts"
git commit -m "feat: shortCode no domínio e em todos os pontos de criação de oferta"
```

---

### Task 4: Métodos de repositório (`getDealByShortCode` / `registerShortLinkClick`)

**Files:**

- Modify: `src/data/repository/deals.repository.ts`
- Modify: `src/data/repository/mock-deals.repository.ts`
- Modify: `src/data/repository/prisma-deals.repository.ts`
- Test: `src/data/repository/mock-deals.repository.test.ts` (adicionar casos)

**Interfaces:**

- Consumes: `Deal.shortCode` (Task 3).
- Produces: na interface `DealsRepository`: `getDealByShortCode(code: string): Promise<Deal | null>` e `registerShortLinkClick(code: string): Promise<void>`; no mock, o extra `getClickCount(code: string): number` (inspeção em testes). Task 6 depende dos dois primeiros.

- [ ] **Step 1: Testes no repositório mock (falhando)**

Em `src/data/repository/mock-deals.repository.test.ts`, adicionar:

```ts
describe("links curtos", () => {
  it("resolve oferta pelo shortCode e null para código desconhecido", async () => {
    const repository = new MockDealsRepository();
    const [first] = MOCK_DEALS;
    expect(await repository.getDealByShortCode(first.shortCode)).toEqual(first);
    expect(await repository.getDealByShortCode("zzzzzzz")).toBeNull();
  });

  it("conta cliques por código", async () => {
    const repository = new MockDealsRepository();
    const [first] = MOCK_DEALS;
    expect(repository.getClickCount(first.shortCode)).toBe(0);
    await repository.registerShortLinkClick(first.shortCode);
    await repository.registerShortLinkClick(first.shortCode);
    expect(repository.getClickCount(first.shortCode)).toBe(2);
  });
});
```

(Se o arquivo ainda não importa `MOCK_DEALS`, adicionar `import { MOCK_DEALS } from "@/mocks";`.)

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/data/repository/mock-deals.repository.test.ts`
Expected: FAIL — métodos não existem.

- [ ] **Step 3: Ampliar a interface**

Em `src/data/repository/deals.repository.ts`, na interface `DealsRepository`:

```ts
  /** Oferta pelo código do link curto; null se não existir ou vencida. */
  getDealByShortCode(code: string): Promise<Deal | null>;
  /** Registra um clique no link curto (chamado pela rota /p/[code]). */
  registerShortLinkClick(code: string): Promise<void>;
```

- [ ] **Step 4: Implementar no mock**

Em `src/data/repository/mock-deals.repository.ts`, dentro da classe:

```ts
  /** Cliques da sessão — mock não persiste nada entre processos. */
  private readonly clickCounts = new Map<string, number>();

  async getDealByShortCode(code: string): Promise<Deal | null> {
    return MOCK_DEALS.find((deal) => deal.shortCode === code) ?? null;
  }

  async registerShortLinkClick(code: string): Promise<void> {
    this.clickCounts.set(code, this.getClickCount(code) + 1);
  }

  /** Cliques registrados nesta sessão (inspeção em testes). */
  getClickCount(code: string): number {
    return this.clickCounts.get(code) ?? 0;
  }
```

- [ ] **Step 5: Implementar no Prisma**

Em `src/data/repository/prisma-deals.repository.ts`, dentro da classe:

```ts
  async getDealByShortCode(code: string): Promise<Deal | null> {
    const row = await this.client.deal.findFirst({
      where: { shortCode: code, AND: notExpired() },
      include: DEAL_INCLUDE,
    });
    return row ? mapDeal(row) : null;
  }

  async registerShortLinkClick(code: string): Promise<void> {
    // updateMany: código inexistente vira no-op em vez de exceção.
    await this.client.deal.updateMany({
      where: { shortCode: code },
      data: { clickCount: { increment: 1 } },
    });
  }
```

- [ ] **Step 6: Rodar testes e typecheck**

Run: `npx vitest run && npm run typecheck`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/data/repository
git commit -m "feat: repositório resolve link curto e registra cliques"
```

---

### Task 5: Detecção de bots (`isBotUserAgent`)

**Files:**

- Create: `src/lib/user-agent.ts`
- Test: `src/lib/user-agent.test.ts`

**Interfaces:**

- Consumes: nada.
- Produces: `isBotUserAgent(userAgent: string | null): boolean`. Task 6 depende.

- [ ] **Step 1: Testes (falhando)**

`src/lib/user-agent.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { isBotUserAgent } from "./user-agent";

describe("isBotUserAgent", () => {
  it.each([
    ["WhatsApp preview", "WhatsApp/2.23.20.0"],
    ["Googlebot", "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"],
    ["Facebook", "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)"],
    ["Telegram", "TelegramBot (like TwitterBot)"],
    ["Bing", "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)"],
  ])("identifica %s como bot", (_name, userAgent) => {
    expect(isBotUserAgent(userAgent)).toBe(true);
  });

  it.each([
    [
      "Chrome desktop",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
    ],
    [
      "Safari iPhone",
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
    ],
  ])("não marca navegador real (%s)", (_name, userAgent) => {
    expect(isBotUserAgent(userAgent)).toBe(false);
  });

  it("trata ausência de user-agent como bot (navegador sempre envia)", () => {
    expect(isBotUserAgent(null)).toBe(true);
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/lib/user-agent.test.ts`
Expected: FAIL — módulo não existe.

- [ ] **Step 3: Implementar**

`src/lib/user-agent.ts`:

```ts
/**
 * Padrões de crawlers/prévias que não devem contar clique no link curto:
 * preview do WhatsApp/Telegram/Slack/Discord, crawlers de busca e afins.
 */
const BOT_PATTERN =
  /bot|crawl|spider|preview|scan|whatsapp|facebookexternalhit|telegram|slack|discord|twitter|linkedin|pinterest/i;

/** true quando o user-agent é de bot — ausência de UA também conta como bot. */
export function isBotUserAgent(userAgent: string | null): boolean {
  if (!userAgent) return true;
  return BOT_PATTERN.test(userAgent);
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npx vitest run src/lib/user-agent.test.ts`
Expected: PASS (8 casos).

- [ ] **Step 5: Commit**

```bash
git add src/lib/user-agent.ts src/lib/user-agent.test.ts
git commit -m "feat: detecção de user-agent de bot para contagem de cliques"
```

---

### Task 6: Rota `/p/[code]` + robots

**Files:**

- Create: `src/app/p/[code]/route.ts`
- Test: `src/app/p/[code]/route.test.ts`
- Modify: `src/app/robots.ts` (linha 26)

**Interfaces:**

- Consumes: `getDealsRepository()` + métodos da Task 4, `isBotUserAgent` (Task 5), `buildProductPath` e `absoluteUrl` (existentes).
- Produces: `GET /p/{code}` → 302. Task 7 gera links para cá.

**Antes de codar:** conferir a assinatura de route handler dinâmico em `node_modules/next/dist/docs/` (Next 16 — `params` é Promise).

- [ ] **Step 1: Testes (falhando)**

`src/app/p/[code]/route.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { getDealsRepository } from "@/data/repository";
import type { MockDealsRepository } from "@/data/repository/mock-deals.repository";
import { buildProductPath } from "@/features/deals/product-path";
import { MOCK_DEALS } from "@/mocks";

import { GET } from "./route";

const CHROME_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

function callRoute(code: string, userAgent?: string) {
  const request = new Request(`http://localhost/p/${code}`, {
    headers: userAgent ? { "user-agent": userAgent } : {},
  });
  return GET(request, { params: Promise.resolve({ code }) });
}

// DATA_SOURCE default é mock — o singleton é o MockDealsRepository.
const repository = getDealsRepository() as MockDealsRepository;

describe("GET /p/[code]", () => {
  it("responde 302 para a página do produto e conta o clique", async () => {
    const [deal] = MOCK_DEALS;
    const before = repository.getClickCount(deal.shortCode);
    const response = await callRoute(deal.shortCode, CHROME_UA);
    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toContain(
      buildProductPath({ id: deal.id, title: deal.product.title }),
    );
    expect(repository.getClickCount(deal.shortCode)).toBe(before + 1);
  });

  it("não conta clique de bot (preview do WhatsApp)", async () => {
    const [deal] = MOCK_DEALS;
    const before = repository.getClickCount(deal.shortCode);
    const response = await callRoute(deal.shortCode, "WhatsApp/2.23.20.0");
    expect(response.status).toBe(302);
    expect(repository.getClickCount(deal.shortCode)).toBe(before);
  });

  it("código desconhecido redireciona para a home sem contar", async () => {
    const response = await callRoute("zzzzzzz", CHROME_UA);
    expect(response.status).toBe(302);
    expect(new URL(response.headers.get("location") ?? "").pathname).toBe("/");
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run "src/app/p/[code]/route.test.ts"`
Expected: FAIL — `./route` não existe.

- [ ] **Step 3: Implementar a rota**

`src/app/p/[code]/route.ts`:

```ts
import { getDealsRepository } from "@/data/repository";
import { buildProductPath } from "@/features/deals/product-path";
import { absoluteUrl } from "@/lib/site";
import { isBotUserAgent } from "@/lib/user-agent";

/**
 * Link curto de compartilhamento: /p/{code} → 302 para a página do produto.
 * 302 de propósito (301 seria cacheado pelo navegador e cliques repetidos
 * escapariam da contagem). Bots (preview do WhatsApp, crawlers) não contam.
 * Código inexistente ou oferta vencida caem na home. Fora do sitemap e com
 * /p/ em Disallow no robots — a URL canônica é a longa (/produto/...).
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> },
): Promise<Response> {
  const { code } = await params;
  const repository = getDealsRepository();
  const deal = await repository.getDealByShortCode(code);
  if (!deal) return Response.redirect(absoluteUrl("/"), 302);

  if (!isBotUserAgent(request.headers.get("user-agent"))) {
    await repository.registerShortLinkClick(code);
  }
  return Response.redirect(
    absoluteUrl(buildProductPath({ id: deal.id, title: deal.product.title })),
    302,
  );
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npx vitest run "src/app/p/[code]/route.test.ts"`
Expected: PASS (3 testes).

- [ ] **Step 5: Excluir `/p/` do robots**

Em `src/app/robots.ts`, trocar a linha das rules gerais:

```ts
    rules: [{ userAgent: "*", allow: "/", disallow: ["/busca", "/p/"] }, ...aiRules],
```

- [ ] **Step 6: Typecheck + testes gerais**

Run: `npm run typecheck && npx vitest run`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add "src/app/p" src/app/robots.ts
git commit -m "feat: rota /p/[code] com redirect 302, contagem de cliques e robots"
```

---

### Task 7: Usar o link curto no Promover e no Compartilhar + coluna Cliques

**Files:**

- Modify: `src/app/admin/(painel)/promover/page.tsx` (linha ~95)
- Modify: `src/app/(site)/produto/[slug]/page.tsx` (linha ~54)
- Modify: `src/app/admin/(painel)/ofertas/page.tsx` (tabela)

**Interfaces:**

- Consumes: `Deal.shortCode` (Task 3), rota `/p/[code]` (Task 6), `absoluteUrl` (existente).
- Produces: nada novo para outras tasks — é a ponta final.

- [ ] **Step 1: Promover usa o link curto**

Em `src/app/admin/(painel)/promover/page.tsx`, trocar a montagem da URL:

```ts
// antes:
url: absoluteUrl(buildProductPath({ id: deal.id, title: deal.product.title })),
// depois:
url: absoluteUrl(`/p/${deal.shortCode}`),
```

Se `buildProductPath` ficar sem uso no arquivo, remover o import.

- [ ] **Step 2: Compartilhar usa o link curto**

Em `src/app/(site)/produto/[slug]/page.tsx`, trocar a construção de `shareUrl`:

```ts
// antes:
const shareUrl = absoluteUrl(buildProductPath({ id: deal.id, title: product.title }));
// depois — link curto no WhatsApp e no copiar; a canônica de SEO segue a longa:
const shareUrl = absoluteUrl(`/p/${deal.shortCode}`);
```

**Cuidado:** `buildProductPath` continua sendo usado neste arquivo pela
metadata/canonical — **não** remover o import nem alterar a canônica.

- [ ] **Step 3: Coluna Cliques na aba Ofertas**

Em `src/app/admin/(painel)/ofertas/page.tsx`:

No `<thead>`, após a coluna Preço:

```tsx
<th className="px-4 py-3 font-medium">Cliques</th>
```

No `<tbody>`, após a célula de preço (mesma posição):

```tsx
<td className="text-muted-foreground px-4 py-3">{deal.clickCount}</td>
```

- [ ] **Step 4: Typecheck + testes + lint**

Run: `npm run typecheck && npx vitest run && npm run lint`
Expected: PASS — nenhum import órfão.

- [ ] **Step 5: Commit**

```bash
git add "src/app/admin/(painel)/promover/page.tsx" "src/app/(site)/produto/[slug]/page.tsx" "src/app/admin/(painel)/ofertas/page.tsx"
git commit -m "feat: promover e compartilhar usam link curto; coluna cliques no admin"
```

---

### Task 8: Gate de fase, seed e registro no PLAN.md

**Files:**

- Modify: `docs/PLAN.md` (registrar a entrega)

**Interfaces:**

- Consumes: tudo acima.
- Produces: feature completa e registrada.

- [ ] **Step 1: Gate completo**

Run: `npm run typecheck && npm run lint && npm test && npm run build`
Expected: tudo verde. Se o build reclamar da rota `/p/[code]`, revisar a assinatura async de `params` (docs do Next em `node_modules/next/dist/docs/`).

- [ ] **Step 2: Seed idempotente (valida o fluxo demo)**

Run: `npm run db:seed`
Expected: "Seed concluído" sem erro — deals demo ganham/conservam shortCode determinístico (upsert só cria, nunca troca código).

- [ ] **Step 3: Registrar no PLAN.md**

Em `docs/PLAN.md`, adicionar à lista de entregas concluídas (seguir o formato
das entradas vizinhas):

```markdown
- Links curtos `/p/{code}` com contagem de cliques (2026-07-18) — spec
  `docs/superpowers/specs/2026-07-18-links-curtos-design.md`.
```

- [ ] **Step 4: Commit final**

```bash
git add docs/PLAN.md
git commit -m "docs: registra entrega dos links curtos no PLAN.md"
```
