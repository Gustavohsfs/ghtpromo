import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { SESSION_COOKIE, verifySessionToken } from "@/server/admin-session";
import { getPrismaClient } from "@/server/prisma";

/** Admin autenticado da requisição atual, ou null (cookie ausente/inválido). */
export async function getSessionAdmin() {
  const cookieStore = await cookies();
  const session = await verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
  if (!session) return null;
  return getPrismaClient().admin.findUnique({
    where: { id: session.adminId },
    select: { id: true, email: true },
  });
}

/**
 * 2ª camada de proteção (após o proxy.ts): páginas e Server Actions do
 * painel chamam isto e são redirecionadas ao login sem sessão válida.
 */
export async function requireSessionAdmin() {
  const admin = await getSessionAdmin();
  if (!admin) redirect("/admin");
  return admin;
}
