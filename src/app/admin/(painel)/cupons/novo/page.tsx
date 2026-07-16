import { requireSessionAdmin } from "@/server/admin-auth";
import { getPrismaClient } from "@/server/prisma";

import { createCouponAction } from "../actions";
import { CouponForm } from "../coupon-form";

export default async function AdminNovoCupomPage() {
  await requireSessionAdmin();
  const stores = await getPrismaClient().store.findMany({ orderBy: { name: "asc" } });

  return (
    <section>
      <h1 className="mb-4 text-xl font-semibold">Novo cupom</h1>
      <CouponForm
        action={createCouponAction}
        submitLabel="Cadastrar cupom"
        stores={stores.map((store) => ({ value: store.id, label: store.name }))}
      />
    </section>
  );
}
