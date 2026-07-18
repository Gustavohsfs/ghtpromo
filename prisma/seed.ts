import "dotenv/config";

import { MOCK_CATEGORIES, MOCK_DEALS, MOCK_STORES } from "../src/mocks";
import { getPrismaClient } from "../src/server/prisma";
import { seedBlockReason } from "../src/server/seed-guard";

/**
 * Seed: popula o banco com os dados de demonstração de src/mocks/.
 * Idempotente (upserts) — rodar de novo apenas atualiza.
 * Uso: npm run db:seed
 * Banco com ofertas reais (feed/manual) bloqueia o seed — `-- --force` libera.
 */
async function main() {
  const prisma = getPrismaClient();

  const [awin, manual] = await Promise.all([
    prisma.deal.count({ where: { source: "awin" } }),
    prisma.deal.count({ where: { source: "manual" } }),
  ]);
  const blockReason = seedBlockReason({ awin, manual }, process.argv.includes("--force"));
  if (blockReason) {
    throw new Error(blockReason);
  }

  for (const category of MOCK_CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      create: {
        slug: category.slug,
        name: category.name,
        description: category.description,
      },
      update: { name: category.name, description: category.description },
    });
  }

  for (const store of Object.values(MOCK_STORES)) {
    await prisma.store.upsert({
      where: { id: store.id },
      create: { id: store.id, name: store.name, iconUrl: store.iconUrl },
      update: { name: store.name, iconUrl: store.iconUrl },
    });
  }

  for (const deal of MOCK_DEALS) {
    await prisma.product.upsert({
      where: { id: deal.product.id },
      create: {
        id: deal.product.id,
        title: deal.product.title,
        imageUrl: deal.product.imageUrl,
        categorySlug: deal.product.categorySlug,
      },
      update: {
        title: deal.product.title,
        imageUrl: deal.product.imageUrl,
        categorySlug: deal.product.categorySlug,
      },
    });

    const dealData = {
      productId: deal.product.id,
      storeId: deal.store.id,
      price: deal.price,
      oldPrice: deal.oldPrice,
      discountPct: deal.discountPct,
      affiliateUrl: deal.affiliateUrl,
      featured: deal.featured,
      source: "demo",
    };
    await prisma.deal.upsert({
      where: { id: deal.id },
      create: { id: deal.id, shortCode: deal.shortCode, ...dealData },
      update: dealData,
    });
  }

  const counts = {
    categorias: await prisma.category.count(),
    lojas: await prisma.store.count(),
    produtos: await prisma.product.count(),
    ofertas: await prisma.deal.count(),
  };
  console.log("Seed concluído:", counts);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
