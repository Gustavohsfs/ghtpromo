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
