import { describe, expect, it } from "vitest";

import { buildProductPath, extractDealId } from "./product-path";

describe("buildProductPath", () => {
  it("monta /produto/slug--dealId a partir do título", () => {
    expect(
      buildProductPath({ id: "deal-kabum-489965", title: "Caixa de Som JBL PartyBox 520" }),
    ).toBe("/produto/caixa-de-som-jbl-partybox-520--deal-kabum-489965");
  });

  it("remove acentos e caracteres especiais do slug", () => {
    expect(buildProductPath({ id: "abc123", title: 'Fone 7.1 "Gamer" à Prova D\'Água!' })).toBe(
      "/produto/fone-7-1-gamer-a-prova-d-agua--abc123",
    );
  });

  it("limita o tamanho do slug sem cortar o id", () => {
    const path = buildProductPath({ id: "xyz", title: "a".repeat(300) });
    expect(path.endsWith("--xyz")).toBe(true);
    expect(path.length).toBeLessThan(120);
  });
});

describe("extractDealId", () => {
  it("recupera o dealId do slug da URL", () => {
    expect(extractDealId("caixa-de-som-jbl--deal-kabum-489965")).toBe("deal-kabum-489965");
    expect(extractDealId("produto-manual--cmd2xyz123")).toBe("cmd2xyz123");
  });

  it("retorna null para slug sem separador", () => {
    expect(extractDealId("sem-separador-nenhum")).toBeNull();
    expect(extractDealId("")).toBeNull();
  });

  it("é o inverso de buildProductPath", () => {
    const path = buildProductPath({ id: "deal-kabum-42", title: "Teclado Mecânico" });
    const slug = path.replace("/produto/", "");
    expect(extractDealId(slug)).toBe("deal-kabum-42");
  });
});
