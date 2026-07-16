import { notFound } from "next/navigation";

import { requireSessionAdmin } from "@/server/admin-auth";
import { getPrismaClient } from "@/server/prisma";

import { updateDealAction } from "../../actions";
import { DealForm } from "../../deal-form";

/** Edita uma oferta manual. Ofertas do feed Awin não são editáveis. */
export default async function AdminEditarOfertaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSessionAdmin();
  const { id } = await params;

  const prisma = getPrismaClient();
  const [deal, stores, categories] = await Promise.all([
    prisma.deal.findUnique({ where: { id }, include: { product: true } }),
    prisma.store.findMany({ orderBy: { name: "asc" } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!deal || deal.source !== "manual") notFound();

  return (
    <section>
      <h1 className="mb-4 text-xl font-semibold">Editar oferta</h1>
      <DealForm
        action={updateDealAction}
        submitLabel="Salvar alterações"
        stores={stores.map((store) => ({ value: store.id, label: store.name }))}
        categories={categories.map((category) => ({
          value: category.slug,
          label: category.name,
        }))}
        defaults={{
          dealId: deal.id,
          title: deal.product.title,
          description: deal.product.description ?? "",
          storeId: deal.storeId,
          categorySlug: deal.product.categorySlug,
          price: String(deal.price),
          oldPrice: deal.oldPrice === null ? "" : String(deal.oldPrice),
          affiliateUrl: deal.affiliateUrl,
          imageUrl: deal.product.imageUrl,
          expiresAt: deal.expiresAt?.toISOString().slice(0, 10),
          paymentInfo: deal.paymentInfo ?? "",
          couponCode: deal.couponCode ?? "",
        }}
      />
    </section>
  );
}
