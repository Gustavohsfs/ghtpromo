import {
  House,
  Laptop,
  Refrigerator,
  Smartphone,
  Tag,
  Tv,
  Zap,
  type LucideIcon,
} from "lucide-react";

import type { Category } from "@/features/deals/types";

/** Item de navegação serializável (Server Component → Shell client). */
export interface CategoryNavItem {
  href: string;
  label: string;
  /** Slug usado para resolver o ícone no client (NAV_ICONS). */
  slug: string;
}

/** Monta os itens da sidebar a partir das categorias do DealsRepository. */
export function buildCategoryNavItems(categories: Category[]): CategoryNavItem[] {
  return [
    { href: "/", label: "Início", slug: "inicio" },
    ...categories.map((category) => ({
      href: `/categorias/${category.slug}`,
      label: category.name,
      slug: category.slug,
    })),
  ];
}

/** Ícones por slug — categorias novas caem no DEFAULT_NAV_ICON. */
export const NAV_ICONS: Record<string, LucideIcon> = {
  inicio: House,
  eletronicos: Zap,
  geladeiras: Refrigerator,
  tvs: Tv,
  computadores: Laptop,
  iphones: Smartphone,
};

export const DEFAULT_NAV_ICON: LucideIcon = Tag;
