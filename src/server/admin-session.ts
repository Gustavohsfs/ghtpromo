import { jwtVerify, SignJWT } from "jose";

/**
 * Sessão do painel /admin: JWT HS256 (jose) guardado em cookie httpOnly.
 * Segredo em AUTH_SECRET. Compatível com o runtime do proxy.ts e do server.
 */

export const SESSION_COOKIE = "ght_admin_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 dias

export interface AdminSession {
  adminId: string;
}

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET não configurado");
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(adminId: string): Promise<string> {
  return new SignJWT({ adminId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getSecret());
}

/** Token inválido/expirado/ausente → null (nunca lança). */
export async function verifySessionToken(token: string | undefined): Promise<AdminSession | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return typeof payload.adminId === "string" ? { adminId: payload.adminId } : null;
  } catch {
    return null;
  }
}
