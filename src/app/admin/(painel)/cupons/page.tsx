import Link from "next/link";

import { buttonClasses } from "@/components/ui/button";
import { requireSessionAdmin } from "@/server/admin-auth";
import { getPrismaClient } from "@/server/prisma";

import { DeleteCouponButton } from "./delete-coupon-button";

/** Listagem/gestão de cupons — a aba pública /cupons mostra só os válidos. */
export default async function AdminCuponsPage() {
  await requireSessionAdmin();
  const coupons = await getPrismaClient().coupon.findMany({
    include: { store: true },
    orderBy: { createdAt: "desc" },
  });
  const now = new Date();

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Cupons</h1>
          <p className="text-muted-foreground text-sm">
            {coupons.length} cadastrado{coupons.length === 1 ? "" : "s"} — vencidos somem da aba
            pública automaticamente.
          </p>
        </div>
        <Link href="/admin/cupons/novo" className={buttonClasses("confirm", "sm")}>
          Novo cupom
        </Link>
      </div>

      {coupons.length === 0 ? (
        <p className="border-border bg-surface text-muted-foreground rounded-xl border p-6 text-sm">
          Nenhum cupom ainda — clique em “Novo cupom” para cadastrar o primeiro.
        </p>
      ) : (
        <div className="border-border overflow-x-auto rounded-xl border">
          <table className="bg-surface w-full text-sm">
            <thead>
              <tr className="border-border text-muted-foreground border-b text-left text-xs uppercase">
                <th className="px-4 py-3 font-medium">Código</th>
                <th className="px-4 py-3 font-medium">Benefício</th>
                <th className="px-4 py-3 font-medium">Loja</th>
                <th className="px-4 py-3 font-medium">Validade</th>
                <th className="px-4 py-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {coupons.map((coupon) => {
                const expired = coupon.expiresAt !== null && coupon.expiresAt <= now;
                return (
                  <tr key={coupon.id} className={expired ? "opacity-50" : undefined}>
                    <td className="px-4 py-3">
                      <code className="text-brand font-bold">{coupon.code}</code>
                    </td>
                    <td className="max-w-64 truncate px-4 py-3" title={coupon.description}>
                      {coupon.description}
                    </td>
                    <td className="px-4 py-3">{coupon.store.name}</td>
                    <td className="text-muted-foreground px-4 py-3">
                      {coupon.expiresAt
                        ? `${coupon.expiresAt.toLocaleDateString("pt-BR")}${expired ? " (vencido)" : ""}`
                        : "sem validade"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/cupons/${coupon.id}/editar`}
                          className={buttonClasses("outline", "sm")}
                        >
                          Editar
                        </Link>
                        <DeleteCouponButton couponId={coupon.id} couponCode={coupon.code} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
