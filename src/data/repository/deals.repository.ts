import type { DealSort } from "@/features/deals/listing";
import type { Category, Deal, Store } from "@/features/deals/types";

/**
 * Contrato de acesso a dados de promoções. A UI depende APENAS desta
 * interface — a implementação (mock ou Prisma) é escolhida pelo seletor em
 * `./index.ts` via env DATA_SOURCE.
 */

/** Consulta de listagem com filtros e paginação (categoria e busca). */
export interface DealListQuery {
  categorySlug?: string;
  /** Busca por título (case-insensitive). */
  searchQuery?: string;
  /** Ids de loja; vazio/ausente = todas. */
  stores?: string[];
  minPrice?: number;
  /** null/ausente = sem teto. */
  maxPrice?: number | null;
  sort?: DealSort;
  /** 1-based. */
  page?: number;
}

export interface DealListing {
  deals: Deal[];
  total: number;
  page: number;
  pageCount: number;
}

export interface DealsRepository {
  getCategories(): Promise<Category[]>;
  getCategoryBySlug(slug: string): Promise<Category | null>;
  /** Lojas parceiras (para filtros e formulários). */
  getStores(): Promise<Store[]>;
  /** Ofertas recentes de uma categoria (home) — sem filtros/paginação. */
  getDealsByCategory(slug: string): Promise<Deal[]>;
  getFeaturedDeals(): Promise<Deal[]>;
  /** Listagem paginada com filtros — páginas de categoria e busca. */
  listDeals(query: DealListQuery): Promise<DealListing>;
}
