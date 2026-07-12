/* ============================================================================
 * ⚠️ DADOS FICTÍCIOS DE DEMONSTRAÇÃO (mock) — commitados de propósito.
 * Categorias da vitrine. Nunca importar da UI: use o DealsRepository.
 * Ver skill ght-mock-data.
 * ==========================================================================*/

import type { Category } from "@/features/deals/types";

export const MOCK_CATEGORIES: readonly Category[] = [
  {
    slug: "eletronicos",
    name: "Eletrônicos",
    description: "Caixas de som, e-readers, assistentes de voz e mais, com desconto real.",
    isMock: true,
  },
  {
    slug: "geladeiras",
    name: "Geladeiras",
    description: "Geladeiras frost free e inverse das principais marcas em oferta.",
    isMock: true,
  },
  {
    slug: "tvs",
    name: "TVs",
    description: "Smart TVs 4K, QLED e OLED com os melhores preços das lojas oficiais.",
    isMock: true,
  },
  {
    slug: "computadores",
    name: "Computadores",
    description: "Notebooks, desktops e minis para trabalho, estudo e jogos.",
    isMock: true,
  },
  {
    slug: "iphones",
    name: "iPhones",
    description: "iPhones novos com nota fiscal e garantia, pelo menor preço do dia.",
    isMock: true,
  },
];
