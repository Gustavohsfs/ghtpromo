import { describe, expect, it } from "vitest";

import { MockDealsRepository } from "./mock-deals.repository";

const repository = new MockDealsRepository();

describe("MockDealsRepository", () => {
  it("retorna as 5 categorias da vitrine", async () => {
    const categories = await repository.getCategories();
    expect(categories.map((c) => c.slug)).toEqual([
      "eletronicos",
      "geladeiras",
      "tvs",
      "computadores",
      "iphones",
    ]);
  });

  it("encontra categoria por slug e devolve null para slug inexistente", async () => {
    const tvs = await repository.getCategoryBySlug("tvs");
    expect(tvs?.name).toBe("TVs");
    expect(await repository.getCategoryBySlug("nao-existe")).toBeNull();
  });

  it("lista só ofertas da categoria pedida", async () => {
    const deals = await repository.getDealsByCategory("iphones");
    expect(deals.length).toBeGreaterThanOrEqual(3);
    expect(deals.every((deal) => deal.product.categorySlug === "iphones")).toBe(true);
  });

  it("devolve lista vazia para categoria inexistente", async () => {
    expect(await repository.getDealsByCategory("nao-existe")).toEqual([]);
  });

  it("retorna destaques (featured) para a home", async () => {
    const featured = await repository.getFeaturedDeals();
    expect(featured.length).toBeGreaterThan(0);
    expect(featured.every((deal) => deal.featured)).toBe(true);
  });

  it("busca por título ignorando maiúsculas e acentos", async () => {
    const byCase = await repository.searchDeals("IPHONE 15");
    expect(byCase).toHaveLength(1);
    expect(byCase[0]?.product.title).toBe("iPhone 15 128GB");

    // "geracao" sem acento deve achar "5ª geração"
    const byAccent = await repository.searchDeals("5ª geracao");
    expect(byAccent.length).toBeGreaterThan(0);
  });

  it("devolve vazio para busca em branco", async () => {
    expect(await repository.searchDeals("   ")).toEqual([]);
  });
});
