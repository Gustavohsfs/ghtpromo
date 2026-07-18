import { describe, expect, it } from "vitest";

import { MOCK_DEALS } from "@/mocks";

import { MockDealsRepository } from "./mock-deals.repository";

const repository = new MockDealsRepository();

describe("MockDealsRepository", () => {
  it("retorna as 11 categorias da vitrine", async () => {
    const categories = await repository.getCategories();
    expect(categories.map((c) => c.slug)).toEqual([
      "eletronicos",
      "geladeiras",
      "tvs",
      "computadores",
      "iphones",
      "moda",
      "casa",
      "infantil",
      "beleza",
      "automotivo",
      "fitness",
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
    const byCase = await repository.listDeals({ searchQuery: "IPHONE 15" });
    expect(byCase.deals).toHaveLength(1);
    expect(byCase.deals[0]?.product.title).toBe("iPhone 15 128GB");

    // "geracao" sem acento deve achar "5ª geração"
    const byAccent = await repository.listDeals({ searchQuery: "5ª geracao" });
    expect(byAccent.deals.length).toBeGreaterThan(0);
  });

  it("filtra listagem por loja e faixa de preço", async () => {
    const byStore = await repository.listDeals({ stores: ["amazon"] });
    expect(byStore.deals.length).toBeGreaterThan(0);
    expect(byStore.deals.every((deal) => deal.store.id === "amazon")).toBe(true);

    const byPrice = await repository.listDeals({ minPrice: 100, maxPrice: 500 });
    expect(byPrice.deals.length).toBeGreaterThan(0);
    expect(byPrice.deals.every((deal) => deal.price >= 100 && deal.price < 500)).toBe(true);
  });

  it("ordena por menor preço e informa paginação", async () => {
    const listing = await repository.listDeals({ sort: "menor-preco" });
    const prices = listing.deals.map((deal) => deal.price);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
    expect(listing.page).toBe(1);
    expect(listing.pageCount).toBeGreaterThanOrEqual(1);
    expect(listing.total).toBe(listing.deals.length);
  });

  it("lista as lojas parceiras", async () => {
    const stores = await repository.getStores();
    expect(stores.length).toBeGreaterThanOrEqual(8);
    expect(stores.some((store) => store.id === "mercadolivre")).toBe(true);
  });
});

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
