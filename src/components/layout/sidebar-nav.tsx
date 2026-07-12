"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { NAV_ITEMS } from "@/features/categories/nav";
import { cn } from "@/lib/cn";

export interface SidebarNavProps {
  /** Modo compacto (sidebar colapsada): só ícones, labels acessíveis. */
  collapsed?: boolean;
  /** Chamado ao navegar (ex.: fechar o drawer no mobile). */
  onNavigate?: () => void;
}

/** Lista de navegação por categorias, compartilhada entre sidebar e drawer. */
export function SidebarNav({ collapsed = false, onNavigate }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav aria-label="Categorias">
      <ul className="flex flex-col gap-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <li key={href}>
              <Link
                href={href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                title={collapsed ? label : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                  "focus-visible:outline-ring focus-visible:outline-2 focus-visible:outline-offset-2",
                  active
                    ? "bg-brand-soft text-brand font-medium"
                    : "text-muted-foreground hover:bg-surface-raised hover:text-foreground",
                  collapsed && "justify-center px-2",
                )}
              >
                <Icon className="size-4 shrink-0" aria-hidden />
                <span className={cn(collapsed && "sr-only")}>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
