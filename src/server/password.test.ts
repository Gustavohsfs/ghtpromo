// @vitest-environment node
import { describe, expect, it } from "vitest";

import { hashPassword, verifyPassword } from "./password";

describe("hashPassword/verifyPassword", () => {
  it("verifica a senha correta contra o hash", async () => {
    const hash = await hashPassword("senha-super-secreta");
    await expect(verifyPassword("senha-super-secreta", hash)).resolves.toBe(true);
  });

  it("rejeita senha incorreta", async () => {
    const hash = await hashPassword("senha-super-secreta");
    await expect(verifyPassword("senha-errada", hash)).resolves.toBe(false);
  });

  it("gera hashes diferentes para a mesma senha (salt aleatório)", async () => {
    const a = await hashPassword("admin");
    const b = await hashPassword("admin");
    expect(a).not.toBe(b);
  });

  it("nunca guarda a senha em claro no hash", async () => {
    const hash = await hashPassword("admin");
    expect(hash).not.toContain("admin");
    expect(hash.startsWith("scrypt$")).toBe(true);
  });

  it("rejeita hash malformado sem lançar exceção", async () => {
    await expect(verifyPassword("admin", "formato-invalido")).resolves.toBe(false);
  });
});
