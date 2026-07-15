import Link from "next/link";

import { buttonClasses } from "@/components/ui/button";
import { formatBRL } from "@/lib/format";
import { requireSessionAdmin } from "@/server/admin-auth";
import { getPrismaClient } from "@/server/prisma";

import { DeleteDealButton } from "./delete-deal-button";

/** Listagem das ofertas manuais (as do feed Awin são geridas pelo cron). */
export default async function AdminOfertasPage() {
  await requireSessionAdmin();
  const prisma = getPrismaClient();
  const [manualDeals, awinCount] = await Promise.all([
    prisma.deal.findMany({
      where: { source: "manual" },
      include: { product: true, store: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.deal.count({ where: { source: "awin" } }),
  ]);

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Ofertas manuais</h1>
          <p className="text-muted-foreground text-sm">
            {manualDeals.length} manual{manualDeals.length === 1 ? "" : "is"} · {awinCount} do feed
            Awin (geridas pelo cron)
          </p>
        </div>
        <Link href="/admin/ofertas/nova" className={buttonClasses("confirm", "sm")}>
          Nova oferta
        </Link>
      </div>

      {manualDeals.length === 0 ? (
        <p className="border-border bg-surface text-muted-foreground rounded-xl border p-6 text-sm">
          Nenhuma oferta manual ainda — clique em “Nova oferta” para cadastrar a primeira.
        </p>
      ) : (
        <div className="border-border overflow-x-auto rounded-xl border">
          <table className="bg-surface w-full text-sm">
            <thead>
              <tr className="border-border text-muted-foreground border-b text-left text-xs uppercase">
                <th className="px-4 py-3 font-medium">Produto</th>
                <th className="px-4 py-3 font-medium">Loja</th>
                <th className="px-4 py-3 font-medium">Preço</th>
                <th className="px-4 py-3 font-medium">Validade</th>
                <th className="px-4 py-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {manualDeals.map((deal) => (
                <tr key={deal.id}>
                  <td className="max-w-64 truncate px-4 py-3" title={deal.product.title}>
                    {deal.product.title}
                  </td>
                  <td className="px-4 py-3">{deal.store.name}</td>
                  <td className="px-4 py-3">{formatBRL(Number(deal.price))}</td>
                  <td className="text-muted-foreground px-4 py-3">
                    {deal.expiresAt ? deal.expiresAt.toLocaleDateString("pt-BR") : "sem validade"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/ofertas/${deal.id}/editar`}
                        className={buttonClasses("outline", "sm")}
                      >
                        Editar
                      </Link>
                      <DeleteDealButton dealId={deal.id} dealTitle={deal.product.title} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
