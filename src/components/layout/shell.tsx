"use client";

import { useState, type ReactNode } from "react";

import { Header } from "@/components/layout/header";
import { MobileDrawer } from "@/components/layout/mobile-drawer";
import { Sidebar } from "@/components/layout/sidebar";
import type { CategoryNavItem } from "@/features/categories/nav";
import type { ListingFiltersProps } from "@/features/deals/listing-filters";

export interface ShellProps {
  navItems: CategoryNavItem[];
  /** Lojas para os filtros de listagem da sidebar. */
  stores: ListingFiltersProps["stores"];
  children: ReactNode;
}

/**
 * Casca do app: header fixo no topo, sidebar à esquerda (drawer no mobile) e
 * área de conteúdo. Os children continuam sendo Server Components.
 */
export function Shell({ navItems, stores, children }: ShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-dvh flex-col">
      <Header onOpenMobileMenu={() => setMobileMenuOpen(true)} />
      <div className="flex flex-1">
        <Sidebar
          navItems={navItems}
          stores={stores}
          collapsed={collapsed}
          onToggleCollapsed={() => setCollapsed((c) => !c)}
        />
        <main className="min-w-0 flex-1 px-4 py-6 md:px-8">{children}</main>
      </div>
      <MobileDrawer
        navItems={navItems}
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
    </div>
  );
}
