// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createSessionToken, verifySessionToken } from "./admin-session";

beforeEach(() => {
  vi.stubEnv("AUTH_SECRET", "segredo-de-teste-com-tamanho-suficiente-1234567890");
});

describe("sessão admin (JWT)", () => {
  it("cria e verifica um token válido com o id do admin", async () => {
    const token = await createSessionToken("admin-123");
    const session = await verifySessionToken(token);
    expect(session).toEqual({ adminId: "admin-123" });
  });

  it("rejeita token adulterado", async () => {
    const token = await createSessionToken("admin-123");
    const forjado = `${token.slice(0, -4)}XXXX`;
    await expect(verifySessionToken(forjado)).resolves.toBeNull();
  });

  it("rejeita token assinado com outro segredo", async () => {
    const token = await createSessionToken("admin-123");
    vi.stubEnv("AUTH_SECRET", "outro-segredo-completamente-diferente-0987654321");
    await expect(verifySessionToken(token)).resolves.toBeNull();
  });

  it("rejeita token vazio/undefined", async () => {
    await expect(verifySessionToken(undefined)).resolves.toBeNull();
    await expect(verifySessionToken("")).resolves.toBeNull();
  });
});
