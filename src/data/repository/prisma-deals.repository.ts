import type { Category, Deal } from "@/features/deals/types";
import type { Prisma, Category as PrismaCategory } from "@/generated/prisma/client";
import { getPrismaClient } from "@/server/prisma";

import type { DealsRepository } from "./deals.repository";

type DealWithRelations = Prisma.DealGetPayload<{ include: { product: true; store: true } }>;

const DEAL_INCLUDE = { product: true, store: true } as const;

function mapCategory(row: PrismaCategory): Category {
  return {
    slug: row.slug,
    name: row.name,
    description: row.description,
    isMock: false,
  };
}

function mapDeal(row: DealWithRelations): Deal {
  return {
    id: row.id,
    product: {
      id: row.product.id,
      title: row.product.title,
      description: row.product.description,
      imageUrl: row.product.imageUrl,
      categorySlug: row.product.categorySlug,
      isMock: false,
    },
    store: {
      id: row.store.id,
      name: row.store.name,
      iconUrl: row.store.iconUrl,
      isMock: false,
    },
    price: Number(row.price),
    oldPrice: row.oldPrice === null ? null : Number(row.oldPrice),
    discountPct: row.discountPct,
    affiliateUrl: row.affiliateUrl,
    featured: row.featured,
    isMock: false,
  };
}

/**
 * Implementação sobre PostgreSQL via Prisma (DATA_SOURCE=prisma).
 * PRÉ-MONTADA na Fase 8: compila e está pronta, mas nunca foi exercitada
 * contra um banco real — valide as consultas ao plugar o banco
 * (docs/ARCHITECTURE.md, "Como plugar o banco").
 */
export class PrismaDealsRepository implements DealsRepository {
  private get client() {
    return getPrismaClient();
  }

  async getCategories(): Promise<Category[]> {
    const rows = await this.client.category.findMany({ orderBy: { name: "asc" } });
    return rows.map(mapCategory);
  }

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    const row = await this.client.category.findUnique({ where: { slug } });
    return row ? mapCategory(row) : null;
  }

  async getDealsByCategory(slug: string): Promise<Deal[]> {
    const rows = await this.client.deal.findMany({
      where: { product: { categorySlug: slug } },
      include: DEAL_INCLUDE,
      orderBy: { createdAt: "desc" },
    });
    return rows.map(mapDeal);
  }

  async getFeaturedDeals(): Promise<Deal[]> {
    const rows = await this.client.deal.findMany({
      where: { featured: true },
      include: DEAL_INCLUDE,
      orderBy: { createdAt: "desc" },
    });
    return rows.map(mapDeal);
  }

  async searchDeals(query: string): Promise<Deal[]> {
    const needle = query.trim();
    if (!needle) return [];
    const rows = await this.client.deal.findMany({
      where: { product: { title: { contains: needle, mode: "insensitive" } } },
      include: DEAL_INCLUDE,
    });
    return rows.map(mapDeal);
  }
}
