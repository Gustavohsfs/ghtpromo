/* ============================================================================
 * ⚠️ DADOS FICTÍCIOS DE DEMONSTRAÇÃO (mock) — commitados de propósito.
 * Lojas parceiras (ícones circulares locais em public/stores/).
 * Nunca importar da UI: use o DealsRepository. Ver skill ght-mock-data.
 * ==========================================================================*/

import type { Store } from "@/features/deals/types";

export const MOCK_STORES = {
  amazon: {
    id: "amazon",
    name: "Amazon",
    iconUrl: "/stores/amazon.svg",
    isMock: true,
  },
  magalu: {
    id: "magalu",
    name: "Magazine Luiza",
    iconUrl: "/stores/magalu.svg",
    isMock: true,
  },
  kabum: {
    id: "kabum",
    name: "KaBuM!",
    iconUrl: "/stores/kabum.svg",
    isMock: true,
  },
  casasbahia: {
    id: "casasbahia",
    name: "Casas Bahia",
    iconUrl: "/stores/casasbahia.svg",
    isMock: true,
  },
  fastshop: {
    id: "fastshop",
    name: "Fast Shop",
    iconUrl: "/stores/fastshop.svg",
    isMock: true,
  },
  shopee: {
    id: "shopee",
    name: "Shopee",
    iconUrl: "/stores/shopee.svg",
    isMock: true,
  },
  netshoes: {
    id: "netshoes",
    name: "Netshoes",
    iconUrl: "/stores/netshoes.svg",
    isMock: true,
  },
  mercadolivre: {
    id: "mercadolivre",
    name: "Mercado Livre",
    iconUrl: "/stores/mercadolivre.svg",
    isMock: true,
  },
} as const satisfies Record<string, Store>;
