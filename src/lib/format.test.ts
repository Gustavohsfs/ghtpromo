import { describe, expect, it } from "vitest";

import { formatBRL } from "./format";

/** Intl usa espaço não separável (U+00A0) entre "R$" e o valor. */
function normalized(value: string): string {
  return value.replace(/ /g, " ");
}

describe("formatBRL", () => {
  it("formata em reais com centavos (padrão e-commerce)", () => {
    expect(normalized(formatBRL(2399))).toBe("R$ 2.399,00");
  });

  it("preserva os centavos de preços reais", () => {
    expect(normalized(formatBRL(1599.9))).toBe("R$ 1.599,90");
  });
});
