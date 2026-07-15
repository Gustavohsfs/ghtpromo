import { DEALS_PAGE_SIZE } from "@/features/deals/listing";
import type { Category, Deal, Store } from "@/features/deals/types";
import { MOCK_CATEGORIES, MOCK_DEALS, MOCK_STORES } from "@/mocks";

import type { DealListing, DealListQuery, DealsRepository } from "./deals.repository";

/** Normaliza para busca: minúsculas e sem acentos. */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

/** Curadas antes do feed (espelha o `source desc` do Prisma). */
const SOURCE_PRIORITY: Record<string, number> = { manual: 2, demo: 1, awin: 0 };

function byCuratedFirst(a: Deal, b: Deal): number {
  return (SOURCE_PRIORITY[b.source] ?? 0) - (SOURCE_PRIORITY[a.source] ?? 0);
}

/** Implementação sobre os dados fictícios de src/mocks/ (DATA_SOURCE=mock). */
export class MockDealsRepository implements DealsRepository {
  async getCategories(): Promise<Category[]> {
    return [...MOCK_CATEGORIES];
  }

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    return MOCK_CATEGORIES.find((category) => category.slug === slug) ?? null;
  }

  async getStores(): Promise<Store[]> {
    return Object.values(MOCK_STORES);
  }

  async getDealsByCategory(slug: string): Promise<Deal[]> {
    return MOCK_DEALS.filter((deal) => deal.product.categorySlug === slug).sort(byCuratedFirst);
  }

  async getFeaturedDeals(): Promise<Deal[]> {
    return MOCK_DEALS.filter((deal) => deal.featured);
  }

  async listDeals(query: DealListQuery): Promise<DealListing> {
    const needle = normalize(query.searchQuery?.trim() ?? "");

    let deals = MOCK_DEALS.filter((deal) => {
      if (query.categorySlug && deal.product.categorySlug !== query.categorySlug) return false;
      if (needle && !normalize(deal.product.title).includes(needle)) return false;
      if (query.stores?.length && !query.stores.includes(deal.store.id)) return false;
      if (query.minPrice !== undefined && deal.price < query.minPrice) return false;
      if (query.maxPrice != null && deal.price >= query.maxPrice) return false;
      return true;
    });

    if (query.sort === "menor-preco") deals = [...deals].sort((a, b) => a.price - b.price);
    else if (query.sort === "maior-preco") deals = [...deals].sort((a, b) => b.price - a.price);
    else deals = [...deals].sort(byCuratedFirst);

    const page = Math.max(1, query.page ?? 1);
    const start = (page - 1) * DEALS_PAGE_SIZE;
    return {
      deals: deals.slice(start, start + DEALS_PAGE_SIZE),
      total: deals.length,
      page,
      pageCount: Math.max(1, Math.ceil(deals.length / DEALS_PAGE_SIZE)),
    };
  }
}
