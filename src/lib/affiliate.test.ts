import { describe, expect, it } from "vitest";

import type { Deal } from "@/features/deals/types";

import { AFFILIATE_LINK_REL, buildAffiliateUrl } from "./affiliate";

const deal: Deal = {
  id: "echo-dot-5",
  product: {
    id: "produto-echo-dot-5",
    title: "Echo Dot 5ª geração",
    imageUrl: "/products/eletronicos.svg",
    categorySlug: "eletronicos",
    isMock: true,
  },
  store: { id: "amazon", name: "Amazon", iconUrl: "/stores/amazon.svg", isMock: true },
  price: 249,
  oldPrice: 379,
  discountPct: 34,
  affiliateUrl: "https://exemplo.ghtpromo.dev/redir/echo-dot-5",
  featured: true,
  isMock: true,
};

describe("buildAffiliateUrl", () => {
  it("devolve a URL da oferta (mock por enquanto)", () => {
    expect(buildAffiliateUrl(deal)).toBe("https://exemplo.ghtpromo.dev/redir/echo-dot-5");
  });

  it("rel de link de afiliado inclui sponsored e noopener", () => {
    expect(AFFILIATE_LINK_REL.split(" ")).toEqual(
      expect.arrayContaining(["sponsored", "noopener"]),
    );
  });
});
