import { describe, expect, it } from "vitest";

import { formatBRL } from "./format";

/** Intl usa espaço não separável (U+00A0) entre "R$" e o valor. */
function normalized(value: string): string {
  return value.replace(/ /g, " ");
}

describe("formatBRL", () => {
  it("formata inteiros em reais sem centavos", () => {
    expect(normalized(formatBRL(2399))).toBe("R$ 2.399");
  });

  it("arredonda para o real mais próximo", () => {
    expect(normalized(formatBRL(249.9))).toBe("R$ 250");
  });
});
