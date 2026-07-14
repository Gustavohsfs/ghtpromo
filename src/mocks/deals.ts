/* ============================================================================
 * ⚠️ DADOS FICTÍCIOS DE DEMONSTRAÇÃO (mock) — commitados de propósito.
 * Ofertas da vitrine: produtos plausíveis com preços/links FICTÍCIOS.
 * Regra: mínimo 3 ofertas por categoria. Nunca importar da UI: use o
 * DealsRepository. Ver skill ght-mock-data.
 * ==========================================================================*/

import type { Category, Deal, Store } from "@/features/deals/types";

import { MOCK_STORES } from "./stores";

interface DealInput {
  id: string;
  title: string;
  categorySlug: Category["slug"];
  store: Store;
  price: number;
  oldPrice: number;
  featured?: boolean;
}

/** Monta um Deal mock derivando discountPct e o link fictício do id. */
function mockDeal({ id, title, categorySlug, store, price, oldPrice, featured }: DealInput): Deal {
  return {
    id,
    product: {
      id: `produto-${id}`,
      title,
      description: null,
      imageUrl: `/products/${categorySlug}.svg`,
      categorySlug,
      isMock: true,
    },
    store,
    price,
    oldPrice,
    discountPct: Math.round((1 - price / oldPrice) * 100),
    affiliateUrl: `https://exemplo.ghtpromo.dev/redir/${id}`,
    featured: featured ?? false,
    isMock: true,
  };
}

export const MOCK_DEALS: readonly Deal[] = [
  // Eletrônicos
  mockDeal({
    id: "echo-dot-5",
    title: "Echo Dot 5ª geração com Alexa",
    categorySlug: "eletronicos",
    store: MOCK_STORES.amazon,
    price: 249,
    oldPrice: 379,
    featured: true,
  }),
  mockDeal({
    id: "jbl-charge-5",
    title: "Caixa de som JBL Charge 5 Bluetooth",
    categorySlug: "eletronicos",
    store: MOCK_STORES.magalu,
    price: 899,
    oldPrice: 1299,
  }),
  mockDeal({
    id: "kindle-11",
    title: "Kindle 11ª geração 16GB",
    categorySlug: "eletronicos",
    store: MOCK_STORES.amazon,
    price: 494,
    oldPrice: 649,
  }),
  mockDeal({
    id: "jbl-tune-520bt",
    title: "Fone de ouvido JBL Tune 520BT Bluetooth",
    categorySlug: "eletronicos",
    store: MOCK_STORES.shopee,
    price: 229,
    oldPrice: 349,
  }),
  mockDeal({
    id: "amazfit-bip-5",
    title: "Smartwatch Amazfit Bip 5 GPS",
    categorySlug: "eletronicos",
    store: MOCK_STORES.netshoes,
    price: 279,
    oldPrice: 399,
  }),

  // Geladeiras
  mockDeal({
    id: "brastemp-frost-free-375",
    title: "Geladeira Brastemp Frost Free 375L",
    categorySlug: "geladeiras",
    store: MOCK_STORES.casasbahia,
    price: 2849,
    oldPrice: 3799,
    featured: true,
  }),
  mockDeal({
    id: "electrolux-if43-410",
    title: "Geladeira Electrolux Inverse IF43 410L",
    categorySlug: "geladeiras",
    store: MOCK_STORES.fastshop,
    price: 3499,
    oldPrice: 4599,
  }),
  mockDeal({
    id: "consul-340",
    title: "Geladeira Consul Frost Free 340L",
    categorySlug: "geladeiras",
    store: MOCK_STORES.magalu,
    price: 2399,
    oldPrice: 2999,
  }),

  // TVs
  mockDeal({
    id: "samsung-crystal-55",
    title: 'Smart TV Samsung 55" Crystal UHD 4K',
    categorySlug: "tvs",
    store: MOCK_STORES.magalu,
    price: 2399,
    oldPrice: 3299,
    featured: true,
  }),
  mockDeal({
    id: "lg-oled-48",
    title: 'Smart TV LG OLED 48" 4K 120Hz',
    categorySlug: "tvs",
    store: MOCK_STORES.fastshop,
    price: 4499,
    oldPrice: 5999,
  }),
  mockDeal({
    id: "tcl-qled-50",
    title: 'Smart TV TCL 50" QLED 4K Google TV',
    categorySlug: "tvs",
    store: MOCK_STORES.kabum,
    price: 2099,
    oldPrice: 2799,
  }),

  // Computadores
  mockDeal({
    id: "ideapad-3-r5",
    title: "Notebook Lenovo IdeaPad 3 Ryzen 5 16GB 512GB",
    categorySlug: "computadores",
    store: MOCK_STORES.kabum,
    price: 2599,
    oldPrice: 3499,
    featured: true,
  }),
  mockDeal({
    id: "nitro-5-rtx",
    title: "Notebook gamer Acer Nitro 5 i5 RTX 3050",
    categorySlug: "computadores",
    store: MOCK_STORES.kabum,
    price: 4799,
    oldPrice: 5999,
  }),
  mockDeal({
    id: "mac-mini-m4",
    title: "Apple Mac mini M4 16GB 256GB",
    categorySlug: "computadores",
    store: MOCK_STORES.amazon,
    price: 6299,
    oldPrice: 7499,
  }),

  // iPhones
  mockDeal({
    id: "iphone-15-128",
    title: "iPhone 15 128GB",
    categorySlug: "iphones",
    store: MOCK_STORES.amazon,
    price: 3899,
    oldPrice: 4999,
    featured: true,
  }),
  mockDeal({
    id: "iphone-16-128",
    title: "iPhone 16 128GB",
    categorySlug: "iphones",
    store: MOCK_STORES.magalu,
    price: 5399,
    oldPrice: 6499,
  }),
  mockDeal({
    id: "iphone-14-128",
    title: "iPhone 14 128GB",
    categorySlug: "iphones",
    store: MOCK_STORES.casasbahia,
    price: 3199,
    oldPrice: 3999,
  }),
];
