// @vitest-environment node
import { describe, expect, it } from "vitest";

import { parseDealForm } from "./deal-form";

function makeForm(overrides: Record<string, string> = {}): FormData {
  const form = new FormData();
  const base: Record<string, string> = {
    title: "Echo Dot 5ª geração",
    description: "Smart speaker com Alexa.",
    storeId: "amazon",
    categorySlug: "eletronicos",
    price: "249,90",
    oldPrice: "399,90",
    affiliateUrl: "https://amzn.to/abc123",
    imageUrl: "https://m.media-amazon.com/images/I/echo.jpg",
    expiresAt: "2030-12-31",
    ...overrides,
  };
  for (const [key, value] of Object.entries(base)) {
    if (value !== "") form.set(key, value);
  }
  return form;
}

describe("parseDealForm", () => {
  it("aceita formulário completo e deriva o desconto", () => {
    const result = parseDealForm(makeForm());
    if (!result.ok) throw new Error(result.error);
    expect(result.data).toMatchObject({
      title: "Echo Dot 5ª geração",
      storeId: "amazon",
      categorySlug: "eletronicos",
      price: 249.9,
      oldPrice: 399.9,
      discountPct: 38,
      affiliateUrl: "https://amzn.to/abc123",
    });
    expect(result.data.expiresAt?.toISOString().startsWith("2031-01-01T02:59:59")).toBe(true);
  });

  it("aceita preço em formato brasileiro e americano", () => {
    const br = parseDealForm(makeForm({ price: "1.234,56", oldPrice: "2.000,00" }));
    const us = parseDealForm(makeForm({ price: "1234.56", oldPrice: "2000" }));
    if (!br.ok || !us.ok) throw new Error("deveria aceitar");
    expect(br.data.price).toBe(1234.56);
    expect(us.data.price).toBe(1234.56);
  });

  it("preço antigo e validade são opcionais", () => {
    const result = parseDealForm(makeForm({ oldPrice: "", expiresAt: "" }));
    if (!result.ok) throw new Error(result.error);
    expect(result.data.oldPrice).toBeNull();
    expect(result.data.discountPct).toBeNull();
    expect(result.data.expiresAt).toBeNull();
  });

  it("forma de pagamento e cupom são opcionais e vêm aparados", () => {
    const vazio = parseDealForm(makeForm());
    if (!vazio.ok) throw new Error(vazio.error);
    expect(vazio.data.paymentInfo).toBeNull();
    expect(vazio.data.couponCode).toBeNull();

    const cheio = parseDealForm(
      makeForm({ paymentInfo: "  à vista no Pix ", couponCode: " GHT10 " }),
    );
    if (!cheio.ok) throw new Error(cheio.error);
    expect(cheio.data.paymentInfo).toBe("à vista no Pix");
    expect(cheio.data.couponCode).toBe("GHT10");
  });

  it("rejeita preço antigo menor ou igual ao atual", () => {
    const result = parseDealForm(makeForm({ oldPrice: "100,00", price: "200,00" }));
    expect(result.ok).toBe(false);
  });

  it.each([
    ["título vazio", { title: "" }],
    ["preço inválido", { price: "abc" }],
    ["link que não é http(s)", { affiliateUrl: "ftp://x" }],
    ["imagem que não é http(s)", { imageUrl: "data:image/png;base64,x" }],
    ["loja vazia", { storeId: "" }],
    ["categoria vazia", { categorySlug: "" }],
  ])("rejeita %s com mensagem de erro", (_label, overrides) => {
    const result = parseDealForm(makeForm(overrides));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.length).toBeGreaterThan(3);
  });
});
