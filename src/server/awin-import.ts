import { parse } from "csv-parse/sync";

import { generateShortCode } from "@/features/deals/short-code";
import { htmlToPlainText } from "@/lib/html-text";
import { getPrismaClient } from "@/server/prisma";

/**
 * Núcleo de importação do datafeed Awin (KaBuM): normaliza as linhas do CSV,
 * faz upsert idempotente no banco, marca destaques e expira ofertas que
 * saíram do feed. Usado pelo script manual (scripts/import-awin.ts) e pela
 * rota de cron (/api/cron/import-awin) — ver spec em docs/superpowers/specs/.
 */

const STORE_ID = "kabum";
/** Quantos produtos (por preço desc.) marcar como destaque da home. */
const FEATURED_COUNT = 6;
/** Tamanho máximo da descrição persistida (o card trunca em 2 linhas). */
const DESCRIPTION_MAX_LENGTH = 300;
/** Upserts simultâneos contra o banco (feed completo tem ~5k linhas). */
const CONCURRENCY = 10;

export interface AwinFeedRow {
  aw_deep_link: string;
  product_name: string;
  merchant_product_id: string;
  merchant_image_url: string;
  merchant_category: string;
  search_price: string;
  in_stock: string;
  description?: string;
  product_short_description?: string;
  rrp_price?: string;
  product_price_old?: string;
}

/** Oferta normalizada, pronta para o banco — o "idioma comum" da ingestão. */
export interface ImportedOffer {
  productId: string;
  dealId: string;
  title: string;
  description: string | null;
  imageUrl: string;
  categorySlug: string;
  price: number;
  oldPrice: number | null;
  discountPct: number | null;
  affiliateUrl: string;
}

export interface ImportStats {
  lidas: number;
  importadas: number;
  ignoradas: number;
  comDescricao: number;
  comPrecoAntigo: number;
  destaques: number;
  expiradas: number;
  demoRemovidas: number;
  totalOfertasNoBanco: number;
}

/** merchant_category (1º nível) → slug de categoria da vitrine. */
function mapCategorySlug(merchantCategory: string): string | null {
  const root = merchantCategory.split(">")[0]?.trim().toLowerCase() ?? "";
  switch (root) {
    case "áudio":
      return "eletronicos";
    case "hardware":
    case "periféricos":
    case "computadores":
      return "computadores";
    default:
      return null;
  }
}

/**
 * Preço "de" (riscado): usa product_price_old ou, na falta, rrp_price (preço
 * de tabela). Só vale quando maior que o preço atual.
 */
function parseOldPrice(row: AwinFeedRow, price: number): number | null {
  for (const candidate of [row.product_price_old, row.rrp_price]) {
    const value = Number(candidate);
    if (value > price) return value;
  }
  return null;
}

/**
 * Normaliza uma linha do feed para o formato do banco. Retorna null para
 * linhas que não entram na vitrine: categoria sem mapeamento, sem estoque,
 * sem id/link ou preço inválido.
 */
export function normalizeFeedRow(row: AwinFeedRow): ImportedOffer | null {
  const categorySlug = mapCategorySlug(row.merchant_category);
  const price = Number(row.search_price);
  if (!categorySlug || !row.merchant_product_id || !row.aw_deep_link || !(price > 0)) return null;
  if (row.in_stock !== "1") return null;

  const productId = `${STORE_ID}-${row.merchant_product_id}`;
  const rawDescription = row.product_short_description?.trim() || row.description?.trim() || "";
  const oldPrice = parseOldPrice(row, price);

  return {
    productId,
    dealId: `deal-${productId}`,
    title: row.product_name,
    description: htmlToPlainText(rawDescription, DESCRIPTION_MAX_LENGTH),
    // CDN da KaBuM aceita https; o feed às vezes traz http.
    imageUrl: row.merchant_image_url.replace(/^http:\/\//, "https://"),
    categorySlug,
    price,
    oldPrice,
    discountPct: oldPrice === null ? null : Math.round((1 - price / oldPrice) * 100),
    affiliateUrl: row.aw_deep_link,
  };
}

/** Executa `task` sobre todos os itens com no máximo `limit` em paralelo. */
async function runWithConcurrency<T>(
  items: readonly T[],
  limit: number,
  task: (item: T) => Promise<void>,
): Promise<void> {
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const item = items[next];
      next += 1;
      await task(item);
    }
  });
  await Promise.all(workers);
}

/**
 * Importa o CSV do datafeed (conteúdo já descompactado). Idempotente:
 * reimportar atualiza preço/descrição/link. O feed é a fonte da verdade do
 * catálogo da loja — ofertas que saíram dele são removidas (expiração).
 */
export async function importAwinFeed(
  csv: string | Buffer,
  options: { cleanDemo?: boolean } = {},
): Promise<ImportStats> {
  const prisma = getPrismaClient();
  const rows = parse(csv, { columns: true, skip_empty_lines: true }) as AwinFeedRow[];

  const offers = rows
    .map(normalizeFeedRow)
    .filter((offer): offer is ImportedOffer => offer !== null);

  await runWithConcurrency(offers, CONCURRENCY, async (offer) => {
    await prisma.product.upsert({
      where: { id: offer.productId },
      create: {
        id: offer.productId,
        title: offer.title,
        description: offer.description,
        imageUrl: offer.imageUrl,
        categorySlug: offer.categorySlug,
      },
      update: {
        title: offer.title,
        description: offer.description,
        imageUrl: offer.imageUrl,
        categorySlug: offer.categorySlug,
      },
    });
    await prisma.deal.upsert({
      where: { id: offer.dealId },
      create: {
        id: offer.dealId,
        shortCode: generateShortCode(),
        productId: offer.productId,
        storeId: STORE_ID,
        price: offer.price,
        oldPrice: offer.oldPrice,
        discountPct: offer.discountPct,
        affiliateUrl: offer.affiliateUrl,
        featured: false,
        source: "awin",
      },
      update: {
        price: offer.price,
        oldPrice: offer.oldPrice,
        discountPct: offer.discountPct,
        affiliateUrl: offer.affiliateUrl,
        featured: false,
      },
    });
  });

  // Destaques da home: os N mais premium (maior preço) do feed.
  const featuredIds = [...offers]
    .sort((a, b) => b.price - a.price)
    .slice(0, FEATURED_COUNT)
    .map((offer) => offer.dealId);
  await prisma.deal.updateMany({ where: { id: { in: featuredIds } }, data: { featured: true } });

  // Expiração: ofertas do feed que saíram dele ou ficaram sem estoque são
  // removidas. Só ofertas source="awin" — manuais (painel admin) e demo
  // (seed) nunca são tocadas pelo cron, mesmo sendo da mesma loja.
  const staleDeals = await prisma.deal.findMany({
    where: {
      storeId: STORE_ID,
      source: "awin",
      id: { notIn: offers.map((offer) => offer.dealId) },
    },
    select: { id: true, productId: true },
  });
  await prisma.deal.deleteMany({ where: { id: { in: staleDeals.map((d) => d.id) } } });
  await prisma.product.deleteMany({
    where: { id: { in: staleDeals.map((d) => d.productId) }, deals: { none: {} } },
  });

  let demoRemoved = 0;
  if (options.cleanDemo) {
    const demoDeals = await prisma.deal.findMany({
      where: { source: "demo" },
      select: { id: true, productId: true },
    });
    await prisma.deal.deleteMany({ where: { id: { in: demoDeals.map((d) => d.id) } } });
    await prisma.product.deleteMany({
      where: { id: { in: demoDeals.map((d) => d.productId) }, deals: { none: {} } },
    });
    demoRemoved = demoDeals.length;
  }

  return {
    lidas: rows.length,
    importadas: offers.length,
    ignoradas: rows.length - offers.length,
    comDescricao: offers.filter((o) => o.description !== null).length,
    comPrecoAntigo: offers.filter((o) => o.oldPrice !== null).length,
    destaques: featuredIds.length,
    expiradas: staleDeals.length,
    demoRemovidas: demoRemoved,
    totalOfertasNoBanco: await prisma.deal.count(),
  };
}
