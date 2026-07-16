import { notFound } from "next/navigation";

import { requireSessionAdmin } from "@/server/admin-auth";
import { getPrismaClient } from "@/server/prisma";

import { updateCouponAction } from "../../actions";
import { CouponForm } from "../../coupon-form";

export default async function AdminEditarCupomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSessionAdmin();
  const { id } = await params;

  const prisma = getPrismaClient();
  const [coupon, stores] = await Promise.all([
    prisma.coupon.findUnique({ where: { id } }),
    prisma.store.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!coupon) notFound();

  return (
    <section>
      <h1 className="mb-4 text-xl font-semibold">Editar cupom</h1>
      <CouponForm
        action={updateCouponAction}
        submitLabel="Salvar alterações"
        stores={stores.map((store) => ({ value: store.id, label: store.name }))}
        defaults={{
          couponId: coupon.id,
          storeId: coupon.storeId,
          code: coupon.code,
          description: coupon.description,
          affiliateUrl: coupon.affiliateUrl,
          expiresAt: coupon.expiresAt?.toISOString().slice(0, 10),
        }}
      />
    </section>
  );
}
