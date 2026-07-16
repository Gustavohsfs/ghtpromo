// @vitest-environment node
import { describe, expect, it } from "vitest";

import { parseCouponForm } from "./coupon-form";

function makeForm(overrides: Record<string, string> = {}): FormData {
  const form = new FormData();
  const base: Record<string, string> = {
    storeId: "shopee",
    code: " ght10 ",
    description: "10% OFF em eletrônicos",
    affiliateUrl: "https://shopee.com.br/oferta?af=123",
    expiresAt: "2030-12-31",
    ...overrides,
  };
  for (const [key, value] of Object.entries(base)) {
    if (value !== "") form.set(key, value);
  }
  return form;
}

describe("parseCouponForm", () => {
  it("aceita formulário completo, apara e põe o código em maiúsculas", () => {
    const result = parseCouponForm(makeForm());
    if (!result.ok) throw new Error(result.error);
    expect(result.data.code).toBe("GHT10");
    expect(result.data.storeId).toBe("shopee");
    expect(result.data.expiresAt?.toISOString().startsWith("2031-01-01T02:59:59")).toBe(true);
  });

  it("validade é opcional", () => {
    const result = parseCouponForm(makeForm({ expiresAt: "" }));
    if (!result.ok) throw new Error(result.error);
    expect(result.data.expiresAt).toBeNull();
  });

  it("descrição de uso é opcional e vem aparada", () => {
    const vazio = parseCouponForm(makeForm());
    if (!vazio.ok) throw new Error(vazio.error);
    expect(vazio.data.usageInfo).toBeNull();

    const cheio = parseCouponForm(makeForm({ usageInfo: "  Cole no checkout.  " }));
    if (!cheio.ok) throw new Error(cheio.error);
    expect(cheio.data.usageInfo).toBe("Cole no checkout.");
  });

  it.each([
    ["código vazio", { code: "  " }],
    ["descrição vazia", { description: "" }],
    ["loja vazia", { storeId: "" }],
    ["link inválido", { affiliateUrl: "ftp://x" }],
  ])("rejeita %s", (_label, overrides) => {
    expect(parseCouponForm(makeForm(overrides)).ok).toBe(false);
  });
});
