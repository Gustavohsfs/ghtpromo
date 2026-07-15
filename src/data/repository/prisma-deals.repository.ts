import { DEALS_PAGE_SIZE } from "@/features/deals/listing";
import type { Category, Deal, DealSource, Store } from "@/features/deals/types";
import type { Prisma, Category as PrismaCategory } from "@/generated/prisma/client";
import { getPrismaClient } from "@/server/prisma";

import type { DealListing, DealListQuery, DealsRepository } from "./deals.repository";

type DealWithRelations = Prisma.DealGetPayload<{ include: { product: true; store: true } }>;

const DEAL_INCLUDE = { product: true, store: true } as const;

/**
 * Máximo de ofertas por listagem (categoria/busca). O catálogo completo tem
 * milhares de itens — a página mostra os mais recentes e a paginação está no
 * backlog (PLAN.md). A busca continua cobrindo o catálogo inteiro no banco.
 */
const MAX_DEALS_PER_LISTING = 60;

/** Ofertas manuais com validade vencida somem das consultas públicas. */
function notExpired() {
  return { OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] };
}

const KNOWN_SOURCES: readonly DealSource[] = ["awin", "manual", "demo"];

function mapSource(source: string): DealSource {
  return KNOWN_SOURCES.includes(source as DealSource) ? (source as DealSource) : "manual";
}

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
    source: mapSource(row.source),
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
      where: { product: { categorySlug: slug }, AND: notExpired() },
      include: DEAL_INCLUDE,
      // source desc = manual > demo > awin: curadas antes do feed automático.
      orderBy: [{ source: "desc" }, { createdAt: "desc" }],
      take: MAX_DEALS_PER_LISTING,
    });
    return rows.map(mapDeal);
  }

  async getFeaturedDeals(): Promise<Deal[]> {
    const rows = await this.client.deal.findMany({
      where: { featured: true, AND: notExpired() },
      include: DEAL_INCLUDE,
      orderBy: { createdAt: "desc" },
    });
    return rows.map(mapDeal);
  }

  async getStores(): Promise<Store[]> {
    const rows = await this.client.store.findMany({ orderBy: { name: "asc" } });
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      iconUrl: row.iconUrl,
      isMock: false,
    }));
  }

  async listDeals(query: DealListQuery): Promise<DealListing> {
    const needle = query.searchQuery?.trim();
    const where: Prisma.DealWhereInput = {
      AND: [
        notExpired(),
        query.categorySlug ? { product: { categorySlug: query.categorySlug } } : {},
        needle ? { product: { title: { contains: needle, mode: "insensitive" } } } : {},
        query.stores?.length ? { storeId: { in: query.stores } } : {},
        query.minPrice !== undefined ? { price: { gte: query.minPrice } } : {},
        query.maxPrice != null ? { price: { lt: query.maxPrice } } : {},
      ],
    };
    // "recentes" (default) prioriza curadas: source desc = manual > demo >
    // awin — outras lojas aparecem antes do feed da KaBuM (variedade), com o
    // catálogo completo preservado na paginação.
    const orderBy: Prisma.DealOrderByWithRelationInput[] =
      query.sort === "menor-preco"
        ? [{ price: "asc" }]
        : query.sort === "maior-preco"
          ? [{ price: "desc" }]
          : [{ source: "desc" }, { createdAt: "desc" }];

    const page = Math.max(1, query.page ?? 1);
    const [total, rows] = await Promise.all([
      this.client.deal.count({ where }),
      this.client.deal.findMany({
        where,
        include: DEAL_INCLUDE,
        orderBy,
        skip: (page - 1) * DEALS_PAGE_SIZE,
        take: DEALS_PAGE_SIZE,
      }),
    ]);

    return {
      deals: rows.map(mapDeal),
      total,
      page,
      pageCount: Math.max(1, Math.ceil(total / DEALS_PAGE_SIZE)),
    };
  }
}
