import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buildProductPath } from "@/features/deals/product-path";
import { reportReasonLabel } from "@/features/deals/report-reasons";
import { requireSessionAdmin } from "@/server/admin-auth";
import { getPrismaClient } from "@/server/prisma";

import { ReportRowActions } from "./report-row-actions";

/** Reports enviados pelo público nas páginas de produto (abertos primeiro). */
export default async function AdminReportsPage() {
  await requireSessionAdmin();
  const reports = await getPrismaClient().report.findMany({
    include: { deal: { include: { product: true, store: true } } },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });
  const openCount = reports.filter((report) => report.status === "aberto").length;

  return (
    <section>
      <h1 className="mb-1 text-xl font-semibold">Reports</h1>
      <p className="text-muted-foreground mb-4 text-sm">
        {reports.length === 0
          ? "Nenhum report recebido até agora."
          : `${openCount} aberto${openCount === 1 ? "" : "s"} de ${reports.length} no total.`}
      </p>

      {reports.length > 0 && (
        <ul className="border-border divide-border bg-surface divide-y rounded-xl border">
          {reports.map((report) => (
            <li key={report.id} className="flex flex-col gap-2 px-4 py-3 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="flex items-center gap-2">
                  {report.status === "aberto" ? (
                    <Badge>aberto</Badge>
                  ) : (
                    <span className="text-muted-foreground text-xs">resolvido</span>
                  )}
                  <strong>{reportReasonLabel(report.reason)}</strong>
                </span>
                <span className="text-muted-foreground text-xs">
                  {report.createdAt.toLocaleString("pt-BR")}
                </span>
              </div>
              <Link
                href={buildProductPath({ id: report.deal.id, title: report.deal.product.title })}
                className="text-brand hover:text-brand-strong max-w-xl truncate text-sm"
              >
                {report.deal.product.title} · {report.deal.store.name}
              </Link>
              {report.details && (
                <p className="text-muted-foreground max-w-2xl text-xs">“{report.details}”</p>
              )}
              <ReportRowActions reportId={report.id} status={report.status} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
