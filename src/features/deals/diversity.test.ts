import { describe, expect, it } from "vitest";

import { diversifyDeals } from "./diversity";
import type { Deal, DealSource } from "./types";

let counter = 0;
function deal(storeId: string, source: DealSource): Deal {
  counter += 1;
  return {
    id: `deal-${counter}`,
    source,
    product: {
      id: `p-${counter}`,
      title: `Produto ${counter}`,
      description: null,
      imageUrl: "/products/eletronicos.svg",
      categorySlug: "eletronicos",
      isMock: true,
    },
    store: { id: storeId, name: storeId, iconUrl: `/stores/${storeId}.svg`, isMock: true },
    price: 100,
    oldPrice: null,
    discountPct: null,
    affiliateUrl: "https://exemplo.ghtpromo.dev/x",
    featured: false,
    isMock: true,
  };
}

describe("diversifyDeals", () => {
  it("mescla: curadas primeiro e no máximo 2 do feed", () => {
    const feed = [deal("kabum", "awin"), deal("kabum", "awin"), deal("kabum", "awin")];
    const curated = [deal("shopee", "manual"), deal("mercadolivre", "manual")];
    const result = diversifyDeals([...feed, ...curated], 8);

    expect(result.map((d) => d.store.id)).toEqual(["shopee", "mercadolivre", "kabum", "kabum"]);
  });

  it("mostra só feed quando não há nenhuma oferta curada (fallback)", () => {
    const feed = Array.from({ length: 6 }, () => deal("kabum", "awin"));
    const result = diversifyDeals(feed, 4);
    expect(result).toHaveLength(4);
    expect(result.every((d) => d.store.id === "kabum")).toBe(true);
  });

  it("não passa do número de vagas mesmo com muitas curadas", () => {
    const curated = Array.from({ length: 10 }, () => deal("amazon", "manual"));
    const feed = [deal("kabum", "awin")];
    const result = diversifyDeals([...curated, ...feed], 5);
    expect(result).toHaveLength(5);
    expect(result.every((d) => d.store.id === "amazon")).toBe(true);
  });

  it("preserva a ordem relativa dentro de cada grupo", () => {
    const a = deal("shopee", "manual");
    const b = deal("amazon", "demo");
    const feed1 = deal("kabum", "awin");
    const feed2 = deal("kabum", "awin");
    const result = diversifyDeals([feed1, a, feed2, b], 8);
    expect(result.map((d) => d.id)).toEqual([a.id, b.id, feed1.id, feed2.id]);
  });

  it("oferta manual da própria kabum conta como curada (não entra no limite)", () => {
    const manualKabum = deal("kabum", "manual");
    const feed = [deal("kabum", "awin"), deal("kabum", "awin"), deal("kabum", "awin")];
    const result = diversifyDeals([manualKabum, ...feed], 8);
    expect(result).toHaveLength(3);
    expect(result[0].id).toBe(manualKabum.id);
  });
});
