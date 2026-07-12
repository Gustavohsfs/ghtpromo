"use client";

import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { SidebarNav } from "@/components/layout/sidebar-nav";
import { cn } from "@/lib/cn";

export interface SidebarProps {
  collapsed: boolean;
  onToggleCollapsed: () => void;
}

/**
 * Sidebar de desktop: colapsável para modo só-ícones. A borda direita carrega
 * o motivo "linha de energia" (pulso sutil, ver globals.css).
 */
export function Sidebar({ collapsed, onToggleCollapsed }: SidebarProps) {
  return (
    <aside
      className={cn(
        "bg-surface relative hidden shrink-0 flex-col transition-[width] duration-200 md:flex",
        collapsed ? "w-16" : "w-60",
      )}
    >
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-3">
        <SidebarNav collapsed={collapsed} />
      </div>

      <div className="p-3">
        <button
          type="button"
          onClick={onToggleCollapsed}
          aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
          aria-expanded={!collapsed}
          className={cn(
            "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm",
            "text-muted-foreground hover:bg-surface-raised hover:text-foreground transition-colors",
            "focus-visible:outline-ring focus-visible:outline-2 focus-visible:outline-offset-2",
            collapsed && "justify-center px-2",
          )}
        >
          {collapsed ? (
            <PanelLeftOpen className="size-4" aria-hidden />
          ) : (
            <>
              <PanelLeftClose className="size-4" aria-hidden />
              <span>Recolher</span>
            </>
          )}
        </button>
      </div>

      {/* Linha de energia na borda direita da sidebar */}
      <div className="energy-line-vertical absolute inset-y-0 right-0" aria-hidden />
    </aside>
  );
}
