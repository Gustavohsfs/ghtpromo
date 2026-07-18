import { describe, expect, it } from "vitest";

import { MOCK_CATEGORIES, MOCK_DEALS } from "./index";

/** Garante a integridade dos dados de demonstração (ver skill ght-mock-data). */
describe("integridade dos mocks", () => {
  it("toda categoria tem no mínimo 3 ofertas", () => {
    for (const category of MOCK_CATEGORIES) {
      const deals = MOCK_DEALS.filter((deal) => deal.product.categorySlug === category.slug);
      expect(deals.length, `categoria ${category.slug}`).toBeGreaterThanOrEqual(3);
    }
  });

  it("toda oferta referencia uma categoria existente", () => {
    const slugs = new Set(MOCK_CATEGORIES.map((c) => c.slug));
    for (const deal of MOCK_DEALS) {
      expect(slugs.has(deal.product.categorySlug), `oferta ${deal.id}`).toBe(true);
    }
  });

  it("todo item está marcado como isMock", () => {
    expect(MOCK_CATEGORIES.every((c) => c.isMock)).toBe(true);
    expect(MOCK_DEALS.every((d) => d.isMock && d.product.isMock && d.store.isMock)).toBe(true);
  });

  it("preços e descontos são coerentes", () => {
    for (const deal of MOCK_DEALS) {
      expect(deal.price, `oferta ${deal.id}`).toBeGreaterThan(0);
      // Todo mock nasce da factory com desconto derivado — nunca nulo.
      expect(deal.oldPrice, `oferta ${deal.id}`).not.toBeNull();
      if (deal.oldPrice === null) continue;
      expect(deal.oldPrice, `oferta ${deal.id}`).toBeGreaterThan(deal.price);
      expect(deal.discountPct, `oferta ${deal.id}`).toBe(
        Math.round((1 - deal.price / deal.oldPrice) * 100),
      );
    }
  });

  it("ids de oferta são únicos", () => {
    const ids = MOCK_DEALS.map((deal) => deal.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("todo deal mock tem shortCode único de 7 caracteres", () => {
    const codes = MOCK_DEALS.map((deal) => deal.shortCode);
    expect(new Set(codes).size).toBe(MOCK_DEALS.length);
    for (const code of codes) expect(code).toMatch(/^[0-9A-Za-z]{7}$/);
  });
});
