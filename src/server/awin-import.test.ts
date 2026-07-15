import { describe, expect, it } from "vitest";

import { normalizeFeedRow, type AwinFeedRow } from "./awin-import";

const row: AwinFeedRow = {
  aw_deep_link: "https://www.awin1.com/pclick.php?p=42&a=2985175&m=17729",
  product_name: "Teclado Mecânico Gamer",
  merchant_product_id: "12345",
  merchant_image_url: "http://images0.kabum.com.br/produtos/fotos/12345/teclado.jpg",
  merchant_category: "Periféricos > Teclados",
  search_price: "299.90",
  in_stock: "1",
  description: "Switches vermelhos e ilumina&ccedil;&atilde;o RGB.",
};

describe("normalizeFeedRow", () => {
  it("normaliza uma linha válida do feed (ids, https, entidades)", () => {
    const offer = normalizeFeedRow(row);

    expect(offer).toEqual({
      productId: "kabum-12345",
      dealId: "deal-kabum-12345",
      title: "Teclado Mecânico Gamer",
      description: "Switches vermelhos e iluminação RGB.",
      imageUrl: "https://images0.kabum.com.br/produtos/fotos/12345/teclado.jpg",
      categorySlug: "computadores",
      price: 299.9,
      oldPrice: null,
      discountPct: null,
      affiliateUrl: row.aw_deep_link,
    });
  });

  it("prefere product_short_description quando presente", () => {
    const offer = normalizeFeedRow({ ...row, product_short_description: "Resumo curto." });
    expect(offer?.description).toBe("Resumo curto.");
  });

  it("deriva oldPrice/discountPct quando o feed traz preço antigo maior", () => {
    const offer = normalizeFeedRow({ ...row, rrp_price: "399.90" });
    expect(offer?.oldPrice).toBe(399.9);
    expect(offer?.discountPct).toBe(25);
  });

  it("ignora preço antigo menor ou igual ao atual", () => {
    const offer = normalizeFeedRow({ ...row, rrp_price: "299.90" });
    expect(offer?.oldPrice).toBeNull();
    expect(offer?.discountPct).toBeNull();
  });

  it("mapeia áudio para eletronicos", () => {
    const offer = normalizeFeedRow({ ...row, merchant_category: "Áudio > Caixas de Som" });
    expect(offer?.categorySlug).toBe("eletronicos");
  });

  it.each([
    ["categoria sem mapeamento", { merchant_category: "Gift Card > Steam" }],
    ["sem estoque", { in_stock: "0" }],
    ["preço inválido", { search_price: "" }],
    ["sem id do produto", { merchant_product_id: "" }],
    ["sem deep link", { aw_deep_link: "" }],
  ])("retorna null para linha com %s", (_label, override) => {
    expect(normalizeFeedRow({ ...row, ...override })).toBeNull();
  });
});
