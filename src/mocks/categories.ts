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
  {
    slug: "moda",
    name: "Moda",
    description: "Roupas, calçados, bermudas e saias das marcas que você gosta em promoção.",
    isMock: true,
  },
  {
    slug: "casa",
    name: "Casa",
    description: "Ferramentas, cama, móveis e utilidades para a casa com desconto real.",
    isMock: true,
  },
  {
    slug: "infantil",
    name: "Infantil",
    description: "Fraldas, brinquedos e tudo para bebês e crianças pelo menor preço.",
    isMock: true,
  },
  {
    slug: "beleza",
    name: "Beleza",
    description: "Perfumes, maquiagem, shampoos e cuidados pessoais em oferta.",
    isMock: true,
  },
  {
    slug: "automotivo",
    name: "Automotivo",
    description: "Pneus, som automotivo e acessórios para o seu carro em promoção.",
    isMock: true,
  },
  {
    slug: "fitness",
    name: "Fitness",
    description: "Esporte, lazer e suplementos para treinar pagando menos.",
    isMock: true,
  },
];
