import { describe, expect, it } from "vitest";

import {
  deriveShortCode,
  generateShortCode,
  SHORT_CODE_ALPHABET,
  SHORT_CODE_LENGTH,
} from "./short-code";

const VALID_CODE = new RegExp(`^[${SHORT_CODE_ALPHABET}]{${SHORT_CODE_LENGTH}}$`);

describe("generateShortCode", () => {
  it("gera código de 7 caracteres do alfabeto alfanumérico", () => {
    expect(generateShortCode()).toMatch(VALID_CODE);
  });

  it("gera códigos diferentes a cada chamada", () => {
    const codes = new Set(Array.from({ length: 100 }, () => generateShortCode()));
    expect(codes.size).toBe(100);
  });
});

describe("deriveShortCode", () => {
  it("é determinístico para a mesma seed", () => {
    expect(deriveShortCode("echo-dot-5")).toBe(deriveShortCode("echo-dot-5"));
  });

  it("gera código válido e distinto para seeds distintas", () => {
    const a = deriveShortCode("echo-dot-5");
    const b = deriveShortCode("jbl-charge-5");
    expect(a).toMatch(VALID_CODE);
    expect(b).toMatch(VALID_CODE);
    expect(a).not.toBe(b);
  });
});
