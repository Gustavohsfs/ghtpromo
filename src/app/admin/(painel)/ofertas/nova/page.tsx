import { requireSessionAdmin } from "@/server/admin-auth";
import { getPrismaClient } from "@/server/prisma";

import { createDealAction } from "../actions";
import { DealForm } from "../deal-form";

export default async function AdminNovaOfertaPage() {
  await requireSessionAdmin();
  const prisma = getPrismaClient();
  const [stores, categories] = await Promise.all([
    prisma.store.findMany({ orderBy: { name: "asc" } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <section>
      <h1 className="mb-4 text-xl font-semibold">Nova oferta</h1>
      <DealForm
        action={createDealAction}
        submitLabel="Cadastrar oferta"
        stores={stores.map((store) => ({ value: store.id, label: store.name }))}
        categories={categories.map((category) => ({
          value: category.slug,
          label: category.name,
        }))}
      />
    </section>
  );
}
