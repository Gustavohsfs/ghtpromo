/**
 * Tipos do domínio de promoções. Espelham o schema Prisma que chega na fase
 * final (Category, Store, Product, Deal) — manter coerentes ao evoluir.
 */

export interface Category {
  slug: string;
  name: string;
  /** Descrição curta usada em SEO (metadata/JSON-LD) e na página da categoria. */
  description: string;
  /** true enquanto o item vier de dados fictícios de demonstração. */
  isMock: boolean;
}

export interface Store {
  id: string;
  name: string;
  /** Ícone circular exibido no card (indica a loja de destino da oferta). */
  iconUrl: string;
  isMock: boolean;
}

export interface Product {
  id: string;
  title: string;
  imageUrl: string;
  categorySlug: Category["slug"];
  isMock: boolean;
}

/** Uma oferta: produto + loja + preços + link de afiliado. */
export interface Deal {
  id: string;
  product: Product;
  store: Store;
  /** Preço atual em BRL. */
  price: number;
  /** Preço anterior ("de") em BRL, exibido riscado. */
  oldPrice: number;
  /** Desconto percentual inteiro (derivado de price/oldPrice). */
  discountPct: number;
  /**
   * Link da oferta. Nos mocks é uma URL fictícia; o link real virá de
   * data/private//env. A UI NUNCA usa este campo direto — sempre via
   * buildAffiliateUrl() (src/lib/affiliate.ts).
   */
  affiliateUrl: string;
  /** Destaque na home (seção de destaques). */
  featured: boolean;
  isMock: boolean;
}
