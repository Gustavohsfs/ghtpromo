import Link from "next/link";

import { Button } from "@/components/ui/button";
import { requireSessionAdmin } from "@/server/admin-auth";

import { logoutAction } from "../actions";

const MENU = [
  { href: "/admin/ofertas", label: "Ofertas" },
  { href: "/admin/ofertas/nova", label: "Nova oferta" },
  { href: "/admin/cupons", label: "Cupons" },
  { href: "/admin/promover", label: "Promover" },
  { href: "/admin/reports", label: "Reports" },
  { href: "/admin/admins", label: "Admins", ownerOnly: true },
  { href: "/admin/senha", label: "Trocar senha" },
] as const;

/**
 * Layout do painel autenticado (2ª camada de proteção após o proxy.ts):
 * revalida a sessão no servidor e renderiza o menu admin.
 */
export default async function AdminPanelLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const admin = await requireSessionAdmin();

  return (
    <div className="flex flex-1 flex-col gap-6">
      <header className="border-border flex flex-wrap items-center justify-between gap-3 border-b pb-4">
        <p className="font-semibold">
          ght<span className="text-brand">promo</span> · admin
        </p>
        <nav aria-label="Menu do admin" className="flex flex-wrap items-center gap-1">
          {MENU.filter((item) => !("ownerOnly" in item) || admin.role === "owner").map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="hover:bg-surface-raised hover:text-brand rounded-md px-3 py-1.5 text-sm transition-colors"
            >
              {item.label}
            </Link>
          ))}
          <form action={logoutAction}>
            <Button type="submit" variant="outline" size="sm">
              Sair
            </Button>
          </form>
        </nav>
      </header>
      <p className="text-muted-foreground -mt-4 text-xs">Logado como {admin.email}</p>
      <main className="flex-1">{children}</main>
    </div>
  );
}
