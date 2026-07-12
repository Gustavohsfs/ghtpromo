import type { Category, Deal } from "@/features/deals/types";
import { MOCK_CATEGORIES, MOCK_DEALS } from "@/mocks";

import type { DealsRepository } from "./deals.repository";

/** Normaliza para busca: minúsculas e sem acentos. */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

/** Implementação sobre os dados fictícios de src/mocks/ (DATA_SOURCE=mock). */
export class MockDealsRepository implements DealsRepository {
  async getCategories(): Promise<Category[]> {
    return [...MOCK_CATEGORIES];
  }

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    return MOCK_CATEGORIES.find((category) => category.slug === slug) ?? null;
  }

  async getDealsByCategory(slug: string): Promise<Deal[]> {
    return MOCK_DEALS.filter((deal) => deal.product.categorySlug === slug);
  }

  async getFeaturedDeals(): Promise<Deal[]> {
    return MOCK_DEALS.filter((deal) => deal.featured);
  }

  async searchDeals(query: string): Promise<Deal[]> {
    const needle = normalize(query.trim());
    if (!needle) return [];
    return MOCK_DEALS.filter((deal) => normalize(deal.product.title).includes(needle));
  }
}
