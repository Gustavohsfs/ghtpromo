import type { Category, Deal } from "@/features/deals/types";

/**
 * Contrato de acesso a dados de promoções. A UI depende APENAS desta
 * interface — a implementação (mock hoje, Prisma depois) é escolhida pelo
 * seletor em `./index.ts` via env DATA_SOURCE.
 */
export interface DealsRepository {
  getCategories(): Promise<Category[]>;
  getCategoryBySlug(slug: string): Promise<Category | null>;
  getDealsByCategory(slug: string): Promise<Deal[]>;
  getFeaturedDeals(): Promise<Deal[]>;
  /** Busca simples por título de produto (case/acento-insensível). */
  searchDeals(query: string): Promise<Deal[]>;
}
