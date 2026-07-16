/* ============================================================================
 * ⚠️ DADOS FICTÍCIOS DE DEMONSTRAÇÃO (mock) — commitados de propósito.
 * Cupons da aba /cupons. Nunca importar da UI: use o DealsRepository.
 * Ver skill ght-mock-data.
 * ==========================================================================*/

import type { Coupon } from "@/features/coupons/types";

import { MOCK_STORES } from "./stores";

export const MOCK_COUPONS: readonly Coupon[] = [
  {
    id: "cupom-ml-frete",
    store: MOCK_STORES.mercadolivre,
    code: "FRETEGRATIS",
    description: "Frete grátis acima de R$ 79 em itens selecionados",
    affiliateUrl: "https://exemplo.ghtpromo.dev/cupom/ml-frete",
    expiresAt: null,
    isMock: true,
  },
  {
    id: "cupom-shopee-10",
    store: MOCK_STORES.shopee,
    code: "GHT10",
    description: "10% OFF em eletrônicos (máx. R$ 30)",
    affiliateUrl: "https://exemplo.ghtpromo.dev/cupom/shopee-10",
    expiresAt: new Date("2030-12-31T23:59:59-03:00"),
    isMock: true,
  },
  {
    id: "cupom-amazon-livros",
    store: MOCK_STORES.amazon,
    code: "LEIA15",
    description: "15% OFF em livros importados",
    affiliateUrl: "https://exemplo.ghtpromo.dev/cupom/amazon-livros",
    expiresAt: new Date("2030-06-30T23:59:59-03:00"),
    isMock: true,
  },
];
