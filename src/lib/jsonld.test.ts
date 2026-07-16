import { describe, expect, it } from "vitest";

import type { Category, Deal } from "@/features/deals/types";

import { breadcrumbJsonLd, itemListJsonLd, productJsonLd, webSiteJsonLd } from "./jsonld";

const category: Category = {
  slug: "tvs",
  name: "TVs",
  description: "Smart TVs em oferta.",
  isMock: true,
};

const deal: Deal = {
  id: "samsung-crystal-55",
  source: "demo",
  product: {
    id: "produto-samsung-crystal-55",
    title: 'Smart TV Samsung 55" Crystal UHD 4K',
    description: "Tela Crystal UHD 4K de 55 polegadas com Gaming Hub.",
    imageUrl: "/products/tvs.svg",
    categorySlug: "tvs",
    isMock: true,
  },
  store: { id: "magalu", name: "Magazine Luiza", iconUrl: "/stores/magalu.svg", isMock: true },
  price: 2399,
  oldPrice: 3299,
  discountPct: 27,
  affiliateUrl: "https://exemplo.ghtpromo.dev/redir/samsung-crystal-55",
  featured: true,
  createdAt: new Date("2026-07-01T12:00:00-03:00"),
  paymentInfo: null,
  couponCode: null,
  isMock: true,
};

describe("jsonld", () => {
  it("WebSite tem SearchAction apontando para /busca", () => {
    const data = webSiteJsonLd();
    expect(data["@type"]).toBe("WebSite");
    const action = data.potentialAction as { target: { urlTemplate: string } };
    expect(action.target.urlTemplate).toContain("/busca?q={search_term_string}");
  });

  it("Product embute Offer com preço em BRL e link de afiliado", () => {
    const data = productJsonLd(deal);
    expect(data["@type"]).toBe("Product");
    expect(data.description).toBe(deal.product.description);
    const offer = data.offers as Record<string, unknown>;
    expect(offer["@type"]).toBe("Offer");
    expect(offer.price).toBe(2399);
    expect(offer.priceCurrency).toBe("BRL");
    expect(offer.url).toBe(deal.affiliateUrl);
  });

  it("ItemList tem uma posição por oferta", () => {
    const data = itemListJsonLd(category, [deal]);
    expect(data.numberOfItems).toBe(1);
    const items = data.itemListElement as Array<{ position: number }>;
    expect(items[0]?.position).toBe(1);
  });

  it("BreadcrumbList vai de Início à categoria com URLs absolutas", () => {
    const data = breadcrumbJsonLd(category);
    const items = data.itemListElement as Array<{ name: string; item: string }>;
    expect(items).toHaveLength(2);
    expect(items[0]?.name).toBe("Início");
    expect(items[1]?.item).toMatch(/^https:\/\/.*\/categorias\/tvs$/);
  });
});
