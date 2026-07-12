import { House, Laptop, Refrigerator, Smartphone, Tv, Zap, type LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

/**
 * Itens de navegação da sidebar.
 * TODO(Fase 5): derivar as categorias do DealsRepository em vez desta lista
 * estática — os slugs devem casar com os dos mocks/banco.
 */
export const NAV_ITEMS: readonly NavItem[] = [
  { href: "/", label: "Início", icon: House },
  { href: "/categorias/eletronicos", label: "Eletrônicos", icon: Zap },
  { href: "/categorias/geladeiras", label: "Geladeiras", icon: Refrigerator },
  { href: "/categorias/tvs", label: "TVs", icon: Tv },
  { href: "/categorias/computadores", label: "Computadores", icon: Laptop },
  { href: "/categorias/iphones", label: "iPhones", icon: Smartphone },
];
