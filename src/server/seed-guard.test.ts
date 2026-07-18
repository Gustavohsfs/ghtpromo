import { describe, expect, it } from "vitest";

import { seedBlockReason } from "./seed-guard";

describe("seedBlockReason", () => {
  it("libera o seed em banco vazio ou só com demo", () => {
    expect(seedBlockReason({ awin: 0, manual: 0 }, false)).toBeNull();
  });

  it("bloqueia quando o banco tem ofertas reais do feed", () => {
    expect(seedBlockReason({ awin: 3952, manual: 0 }, false)).toContain("3952");
  });

  it("bloqueia quando o banco tem ofertas manuais", () => {
    expect(seedBlockReason({ awin: 0, manual: 14 }, false)).toContain("14");
  });

  it("--force libera mesmo com dados reais", () => {
    expect(seedBlockReason({ awin: 3952, manual: 14 }, true)).toBeNull();
  });
});
