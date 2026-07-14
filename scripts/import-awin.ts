import "dotenv/config";

import { readFileSync } from "node:fs";
import { parse } from "csv-parse/sync";

import { htmlToPlainText } from "../src/lib/html-text";
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
 * Descrição e preço antigo (riscado) vêm do feed quando exportados
 * (product_short_description/description, product_price_old/rrp_price);
 * ausentes, ficam nulos e o card omite os blocos correspondentes.
 * Idempotente: reimportar atualiza preço/estoque/descrição. O feed é a fonte
 * da verdade do catálogo da loja: ofertas que saíram dele (ou sem estoque)
 * são removidas a cada importação (expiração).
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
  description?: string;
  product_short_description?: string;
  rrp_price?: string;
  product_price_old?: string;
}

/** Tamanho máximo da descrição persistida (o card trunca em 2 linhas). */
const DESCRIPTION_MAX_LENGTH = 300;

/**
 * Normaliza a descrição do feed via htmlToPlainText (remove tags, decodifica
 * entidades HTML como &eacute;/&nbsp;, colapsa espaços e trunca). Retorna
 * null quando o feed não traz texto útil.
 */
function sanitizeDescription(row: FeedRow): string | null {
  const raw = row.product_short_description?.trim() || row.description?.trim() || "";
  return htmlToPlainText(raw, DESCRIPTION_MAX_LENGTH);
}

/**
 * Preço "de" (riscado): usa product_price_old ou, na falta, rrp_price (preço
 * de tabela). Só vale quando maior que o preço atual — senão null e o card
 * omite riscado/selo.
 */
function parseOldPrice(row: FeedRow, price: number): number | null {
  for (const candidate of [row.product_price_old, row.rrp_price]) {
    const value = Number(candidate);
    if (value > price) return value;
  }
  return null;
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
  let comDescricao = 0;
  let comPrecoAntigo = 0;
  const precoAntigoBruto = new Map<string, number>();
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
    const description = sanitizeDescription(row);
    const oldPrice = parseOldPrice(row, price);
    const discountPct = oldPrice === null ? null : Math.round((1 - price / oldPrice) * 100);
    if (description !== null) comDescricao += 1;
    if (oldPrice !== null) comPrecoAntigo += 1;
    // Amostra dos valores brutos das colunas de preço antigo, para diagnosticar
    // feeds que vêm vazios ou em formato inesperado.
    const bruto = `old="${row.product_price_old ?? ""}" rrp="${row.rrp_price ?? ""}"`;
    precoAntigoBruto.set(bruto, (precoAntigoBruto.get(bruto) ?? 0) + 1);

    await prisma.product.upsert({
      where: { id: productId },
      create: { id: productId, title: row.product_name, description, imageUrl, categorySlug },
      update: { title: row.product_name, description, imageUrl, categorySlug },
    });
    await prisma.deal.upsert({
      where: { id: dealId },
      create: {
        id: dealId,
        productId,
        storeId: STORE_ID,
        price,
        oldPrice,
        discountPct,
        affiliateUrl: row.aw_deep_link,
        featured: false,
      },
      update: { price, oldPrice, discountPct, affiliateUrl: row.aw_deep_link, featured: false },
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

  // Expiração: o feed é a fonte da verdade do catálogo da loja. Ofertas da
  // KaBuM que saíram do feed ou ficaram sem estoque são removidas (as demo
  // ficam de fora — são geridas por db:seed/--clean-demo).
  const staleDeals = await prisma.deal.findMany({
    where: {
      storeId: STORE_ID,
      id: { notIn: importedDealIds.map((deal) => deal.id) },
      affiliateUrl: { not: { startsWith: DEMO_URL_PREFIX } },
    },
    select: { id: true, productId: true },
  });
  await prisma.deal.deleteMany({ where: { id: { in: staleDeals.map((d) => d.id) } } });
  await prisma.product.deleteMany({
    where: { id: { in: staleDeals.map((d) => d.productId) }, deals: { none: {} } },
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
    comDescricao,
    comPrecoAntigo,
    destaques: featuredIds.length,
    expiradas: staleDeals.length,
    demoRemovidas: demoRemoved,
    totalOfertasNoBanco: await prisma.deal.count(),
  });
  if (comPrecoAntigo === 0) {
    const amostra = [...precoAntigoBruto.entries()].slice(0, 5);
    console.log("Nenhum preço antigo válido no feed. Valores brutos (amostra):", amostra);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
