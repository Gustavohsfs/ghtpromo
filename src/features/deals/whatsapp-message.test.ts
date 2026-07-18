import { describe, expect, it } from "vitest";

import { buildWhatsAppMessage, GROUP_INVITE_URL, type WhatsAppDealInfo } from "./whatsapp-message";

const INVITE_LINE = `👥 Convide a família e os amigos para o grupo: ${GROUP_INVITE_URL}`;

const NBSP = " ";

function makeDeal(overrides: Partial<WhatsAppDealInfo> = {}): WhatsAppDealInfo {
  return {
    title: "Furadeira de Impacto Bosch 750W",
    url: "https://ghtpromo.com.br/produto/furadeira-bosch--abc123",
    price: 299.9,
    oldPrice: 399.9,
    discountPct: 25,
    paymentInfo: "À vista no Pix",
    couponCode: "GHT10",
    description: "Furadeira com maleta e kit de brocas para uso doméstico.",
    ...overrides,
  };
}

describe("buildWhatsAppMessage", () => {
  it("monta a mensagem completa no template com emojis", () => {
    const message = buildWhatsAppMessage(makeDeal(), "Corre que acaba rápido!");
    expect(message).toBe(
      [
        "🔥 *Furadeira de Impacto Bosch 750W*",
        "",
        `~De R$${NBSP}399,90~`,
        `💰 *Por R$${NBSP}299,90* (25% OFF)`,
        "💳 À vista no Pix",
        "🎟️ Cupom: *GHT10*",
        "",
        "Furadeira com maleta e kit de brocas para uso doméstico.",
        "",
        "👉 https://ghtpromo.com.br/produto/furadeira-bosch--abc123",
        "",
        "Corre que acaba rápido!",
        "",
        INVITE_LINE,
      ].join("\n"),
    );
  });

  it("omite linhas sem dado (sem oldPrice, desconto, pagamento, cupom, descrição, opcional)", () => {
    const message = buildWhatsAppMessage(
      makeDeal({
        oldPrice: null,
        discountPct: null,
        paymentInfo: null,
        couponCode: null,
        description: null,
      }),
    );
    expect(message).toBe(
      [
        "🔥 *Furadeira de Impacto Bosch 750W*",
        "",
        `💰 *Por R$${NBSP}299,90*`,
        "",
        "👉 https://ghtpromo.com.br/produto/furadeira-bosch--abc123",
        "",
        INVITE_LINE,
      ].join("\n"),
    );
  });

  it("trunca descrição longa em 200 caracteres com reticências", () => {
    const longDescription = "a".repeat(250);
    const message = buildWhatsAppMessage(makeDeal({ description: longDescription }));
    expect(message).toContain(`${"a".repeat(200)}…`);
    expect(message).not.toContain("a".repeat(201));
  });

  it("ignora mensagem opcional só de espaços", () => {
    const message = buildWhatsAppMessage(makeDeal(), "   ");
    expect(message).toContain(
      "👉 https://ghtpromo.com.br/produto/furadeira-bosch--abc123\n\n👥 Convide",
    );
  });

  it("convite do grupo é sempre a última linha da mensagem", () => {
    expect(buildWhatsAppMessage(makeDeal(), "Corre!").endsWith(INVITE_LINE)).toBe(true);
    expect(buildWhatsAppMessage(makeDeal()).endsWith(INVITE_LINE)).toBe(true);
  });
});
