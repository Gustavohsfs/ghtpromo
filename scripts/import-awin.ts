import "dotenv/config";

import { readFileSync } from "node:fs";
import { parse } from "csv-parse/sync";

import { getPrismaClient } from "../src/server/prisma";

/**
 * Importa o datafeed da Awin (CSV, gitignorado em data/private/) para o banco:
 * produtos reais com link de afiliado (aw_deep_link), preço e imagem da loja.
 *
 * Uso:
 *   npm run db:import-awin                     # importa data/private/awin-kabum.csv
 *   npm run db:import-awin -- --clean-demo     # também remove ofertas demo
 *                                              # (links exemplo.ghtpromo.dev);
 *                                              # `npm run db:seed` restaura
 *
 * O feed não traz preço antigo/desconto — oldPrice/discountPct ficam nulos e
 * o card omite o riscado/selo. Idempotente: reimportar atualiza preço/estoque.
 */

const FEED_PATH = "data/private/awin-kabum.csv";
const STORE_ID = "kabum";
const DEMO_URL_PREFIX = "https://exemplo.ghtpromo.dev/";
/** Quantos produtos (por preço desc.) marcar como destaque da home. */
const FEATURED_COUNT = 6;

interface FeedRow {
  aw_deep_link: string;
  product_name: string;
  merchant_product_id: string;
  merchant_image_url: string;
  merchant_category: string;
  search_price: string;
  in_stock: string;
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

async function main() {
  const cleanDemo = process.argv.includes("--clean-demo");
  const prisma = getPrismaClient();

  const rows = parse(readFileSync(FEED_PATH), {
    columns: true,
    skip_empty_lines: true,
  }) as FeedRow[];

  let imported = 0;
  let skipped = 0;
  const importedDealIds: { id: string; price: number }[] = [];

  for (const row of rows) {
    const categorySlug = mapCategorySlug(row.merchant_category);
    const price = Number(row.search_price);
    if (!categorySlug || !row.merchant_product_id || !row.aw_deep_link || !(price > 0)) {
      skipped += 1;
      continue;
    }
    if (row.in_stock !== "1") {
      skipped += 1;
      continue;
    }

    const productId = `${STORE_ID}-${row.merchant_product_id}`;
    const dealId = `deal-${productId}`;
    // CDN da KaBuM aceita https; o feed às vezes traz http.
    const imageUrl = row.merchant_image_url.replace(/^http:\/\//, "https://");

    await prisma.product.upsert({
      where: { id: productId },
      create: { id: productId, title: row.product_name, imageUrl, categorySlug },
      update: { title: row.product_name, imageUrl, categorySlug },
    });
    await prisma.deal.upsert({
      where: { id: dealId },
      create: {
        id: dealId,
        productId,
        storeId: STORE_ID,
        price,
        oldPrice: null,
        discountPct: null,
        affiliateUrl: row.aw_deep_link,
        featured: false,
      },
      update: { price, affiliateUrl: row.aw_deep_link, featured: false },
    });
    importedDealIds.push({ id: dealId, price });
    imported += 1;
  }

  // Destaques da home: os N mais premium (maior preço) do feed.
  const featuredIds = importedDealIds
    .sort((a, b) => b.price - a.price)
    .slice(0, FEATURED_COUNT)
    .map((deal) => deal.id);
  await prisma.deal.updateMany({
    where: { id: { in: featuredIds } },
    data: { featured: true },
  });

  let demoRemoved = 0;
  if (cleanDemo) {
    const demoDeals = await prisma.deal.findMany({
      where: { affiliateUrl: { startsWith: DEMO_URL_PREFIX } },
      select: { id: true, productId: true },
    });
    await prisma.deal.deleteMany({ where: { id: { in: demoDeals.map((d) => d.id) } } });
    await prisma.product.deleteMany({
      where: { id: { in: demoDeals.map((d) => d.productId) }, deals: { none: {} } },
    });
    demoRemoved = demoDeals.length;
  }

  console.log("Importação Awin concluída:", {
    lidas: rows.length,
    importadas: imported,
    ignoradas: skipped,
    destaques: featuredIds.length,
    demoRemovidas: demoRemoved,
    totalOfertasNoBanco: await prisma.deal.count(),
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
