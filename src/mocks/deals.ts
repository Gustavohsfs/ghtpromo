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
    source: "demo",
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
  // Moda
  mockDeal({
    id: "tenis-corrida-classico",
    title: "Tênis de corrida amortecimento Gel",
    categorySlug: "moda",
    store: MOCK_STORES.netshoes,
    price: 279,
    oldPrice: 449,
  }),
  mockDeal({
    id: "camisa-social-slim",
    title: "Camisa social slim algodão",
    categorySlug: "moda",
    store: MOCK_STORES.mercadolivre,
    price: 119,
    oldPrice: 189,
  }),
  mockDeal({
    id: "bermuda-sarja",
    title: "Bermuda de sarja com elastano",
    categorySlug: "moda",
    store: MOCK_STORES.shopee,
    price: 79,
    oldPrice: 129,
  }),
  // Casa
  mockDeal({
    id: "furadeira-impacto-650w",
    title: "Furadeira de impacto 650W com maleta",
    categorySlug: "casa",
    store: MOCK_STORES.mercadolivre,
    price: 249,
    oldPrice: 379,
  }),
  mockDeal({
    id: "jogo-cama-queen-400-fios",
    title: "Jogo de cama queen 400 fios 4 peças",
    categorySlug: "casa",
    store: MOCK_STORES.magalu,
    price: 189,
    oldPrice: 299,
  }),
  mockDeal({
    id: "poltrona-reclinavel",
    title: "Poltrona reclinável em linho",
    categorySlug: "casa",
    store: MOCK_STORES.casasbahia,
    price: 899,
    oldPrice: 1399,
  }),
  // Infantil
  mockDeal({
    id: "fralda-premium-m-80",
    title: "Fralda premium tamanho M com 80 unidades",
    categorySlug: "infantil",
    store: MOCK_STORES.amazon,
    price: 89,
    oldPrice: 139,
  }),
  mockDeal({
    id: "blocos-montar-500",
    title: "Blocos de montar 500 peças compatíveis",
    categorySlug: "infantil",
    store: MOCK_STORES.mercadolivre,
    price: 149,
    oldPrice: 229,
  }),
  mockDeal({
    id: "cadeirinha-carro-9-36",
    title: "Cadeirinha para carro 9 a 36kg reclinável",
    categorySlug: "infantil",
    store: MOCK_STORES.magalu,
    price: 549,
    oldPrice: 799,
  }),
  // Beleza
  mockDeal({
    id: "perfume-amadeirado-100ml",
    title: "Perfume amadeirado masculino 100ml",
    categorySlug: "beleza",
    store: MOCK_STORES.amazon,
    price: 349,
    oldPrice: 499,
  }),
  mockDeal({
    id: "kit-shampoo-condicionador",
    title: "Kit shampoo e condicionador profissional 1L",
    categorySlug: "beleza",
    store: MOCK_STORES.shopee,
    price: 119,
    oldPrice: 179,
  }),
  mockDeal({
    id: "paleta-maquiagem-18-cores",
    title: "Paleta de maquiagem 18 cores com espelho",
    categorySlug: "beleza",
    store: MOCK_STORES.mercadolivre,
    price: 89,
    oldPrice: 149,
  }),
  // Automotivo
  mockDeal({
    id: "pneu-aro-15-185",
    title: "Pneu aro 15 185/65 R15",
    categorySlug: "automotivo",
    store: MOCK_STORES.mercadolivre,
    price: 389,
    oldPrice: 549,
  }),
  mockDeal({
    id: "central-multimidia-7",
    title: 'Central multimídia 7" com CarPlay e câmera de ré',
    categorySlug: "automotivo",
    store: MOCK_STORES.magalu,
    price: 499,
    oldPrice: 799,
  }),
  mockDeal({
    id: "calibrador-digital-pneus",
    title: "Calibrador digital de pneus portátil",
    categorySlug: "automotivo",
    store: MOCK_STORES.amazon,
    price: 129,
    oldPrice: 199,
  }),
  // Fitness
  mockDeal({
    id: "whey-protein-900g",
    title: "Whey protein concentrado 900g",
    categorySlug: "fitness",
    store: MOCK_STORES.netshoes,
    price: 119,
    oldPrice: 189,
  }),
  mockDeal({
    id: "halteres-ajustaveis-20kg",
    title: "Par de halteres ajustáveis até 20kg",
    categorySlug: "fitness",
    store: MOCK_STORES.mercadolivre,
    price: 329,
    oldPrice: 499,
  }),
  mockDeal({
    id: "bicicleta-ergometrica",
    title: "Bicicleta ergométrica com monitor",
    categorySlug: "fitness",
    store: MOCK_STORES.magalu,
    price: 999,
    oldPrice: 1499,
  }),
];
