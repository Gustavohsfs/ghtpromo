"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { requireSessionAdmin } from "@/server/admin-auth";
import {
  createSessionToken,
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
} from "@/server/admin-session";
import { hashPassword, verifyPassword } from "@/server/password";
import { getPrismaClient } from "@/server/prisma";

/** Resultado padrão dos formulários do admin (exibido via useActionState). */
export interface AdminFormState {
  error?: string;
  success?: string;
}

const MIN_PASSWORD_LENGTH = 8;

/**
 * Hash fixo usado quando o e-mail não existe: o tempo de resposta fica igual
 * ao de uma senha errada, sem revelar quais e-mails estão cadastrados.
 */
const DUMMY_HASH =
  "scrypt$16384$00000000000000000000000000000000$0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";

async function setSessionCookie(adminId: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, await createSessionToken(adminId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function loginAction(
  _previous: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Informe e-mail e senha." };

  const admin = await getPrismaClient().admin.findUnique({ where: { email } });
  const valid = await verifyPassword(password, admin?.passwordHash ?? DUMMY_HASH);
  if (!admin || !valid) return { error: "Credenciais inválidas." };

  await setSessionCookie(admin.id);
  redirect("/admin/ofertas");
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  redirect("/admin");
}

export async function changePasswordAction(
  _previous: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const admin = await requireSessionAdmin();
  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (next.length < MIN_PASSWORD_LENGTH) {
    return { error: `A nova senha precisa de ao menos ${MIN_PASSWORD_LENGTH} caracteres.` };
  }
  if (next !== confirm) return { error: "A confirmação não confere com a nova senha." };

  const prisma = getPrismaClient();
  const record = await prisma.admin.findUniqueOrThrow({ where: { id: admin.id } });
  if (!(await verifyPassword(current, record.passwordHash))) {
    return { error: "Senha atual incorreta." };
  }

  await prisma.admin.update({
    where: { id: admin.id },
    data: { passwordHash: await hashPassword(next) },
  });
  return { success: "Senha alterada com sucesso." };
}

export async function createAdminAction(
  _previous: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  await requireSessionAdmin();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "E-mail inválido." };
  if (password.length < MIN_PASSWORD_LENGTH) {
    return { error: `A senha precisa de ao menos ${MIN_PASSWORD_LENGTH} caracteres.` };
  }

  const prisma = getPrismaClient();
  if (await prisma.admin.findUnique({ where: { email } })) {
    return { error: "Já existe um admin com esse e-mail." };
  }

  await prisma.admin.create({ data: { email, passwordHash: await hashPassword(password) } });
  return { success: `Admin ${email} cadastrado.` };
}
