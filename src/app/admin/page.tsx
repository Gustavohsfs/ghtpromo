import { redirect } from "next/navigation";

import { getSessionAdmin } from "@/server/admin-auth";

import { LoginForm } from "./login-form";

/** Login do painel (rota oculta — acessada digitando /admin na URL). */
export default async function AdminLoginPage() {
  if (await getSessionAdmin()) redirect("/admin/ofertas");

  return (
    <main className="flex flex-1 items-center justify-center">
      <div className="border-border bg-surface w-full max-w-sm rounded-xl border p-6">
        <h1 className="mb-1 text-lg font-semibold">
          ght<span className="text-brand">promo</span> · admin
        </h1>
        <p className="text-muted-foreground mb-6 text-sm">Acesso restrito à equipe.</p>
        <LoginForm />
      </div>
    </main>
  );
}
