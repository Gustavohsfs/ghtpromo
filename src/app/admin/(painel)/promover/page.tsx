import Image from "next/image";
import Link from "next/link";

import { buttonClasses } from "@/components/ui/button";
import type { ListingState } from "@/features/deals/listing";
import { ListingPagination } from "@/features/deals/listing-pagination";
import { formatBRL } from "@/lib/format";
import { absoluteUrl } from "@/lib/site";
import { requireSessionAdmin } from "@/server/admin-auth";
import { getPrismaClient } from "@/server/prisma";

import { DeleteDealButton } from "../ofertas/delete-deal-button";
import { PromoteDealButton } from "./promote-deal-button";
import { SearchForm } from "./search-form";

const PAGE_SIZE = 20;

/**
 * Grid de TODAS as ofertas ativas (manuais primeiro, feed por último) para
 * promover no WhatsApp. Ofertas do feed só têm Promover — o cron diário
 * sobrescreveria edições e ressuscitaria exclusões.
 */
export default async function AdminPromoverPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireSessionAdmin();
  const params = await searchParams;
  const query = (Array.isArray(params.q) ? params.q[0] : params.q)?.trim() ?? "";
  const pageParam = Number(Array.isArray(params.page) ? params.page[0] : params.page);
  const page = Number.isInteger(pageParam) && pageParam > 1 ? pageParam : 1;

  const prisma = getPrismaClient();
  const where = {
    OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    ...(query && {
      product: {
        OR: [
          { title: { contains: query, mode: "insensitive" as const } },
          { description: { contains: query, mode: "insensitive" as const } },
        ],
      },
    }),
  };
  const [deals, total] = await Promise.all([
    prisma.deal.findMany({
      where,
      include: { product: true, store: true },
      orderBy: [{ source: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.deal.count({ where }),
  ]);
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const paginationState: ListingState = { stores: [], priceRange: null, sort: "recentes", page };

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Promover no WhatsApp</h1>
          <p className="text-muted-foreground text-sm">
            {total} oferta{total === 1 ? "" : "s"} ativa{total === 1 ? "" : "s"} — manuais primeiro,
            feed por último
          </p>
        </div>
        <SearchForm query={query} />
      </div>

      {deals.length === 0 ? (
        <p className="border-border bg-surface text-muted-foreground rounded-xl border p-6 text-sm">
          {query ? `Nenhuma oferta encontrada para “${query}”.` : "Nenhuma oferta ativa."}
        </p>
      ) : (
        <div className="border-border overflow-x-auto rounded-xl border">
          <table className="bg-surface w-full text-sm">
            <thead>
              <tr className="border-border text-muted-foreground border-b text-left text-xs uppercase">
                <th className="px-4 py-3 font-medium">Produto</th>
                <th className="px-4 py-3 font-medium">Loja</th>
                <th className="px-4 py-3 font-medium">Preço</th>
                <th className="px-4 py-3 font-medium">Origem</th>
                <th className="px-4 py-3 font-medium">Cadastro</th>
                <th className="px-4 py-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {deals.map((deal) => {
                const isManual = deal.source === "manual";
                const whatsAppDeal = {
                  title: deal.product.title,
                  url: absoluteUrl(`/p/${deal.shortCode}`),
                  price: Number(deal.price),
                  oldPrice: deal.oldPrice ? Number(deal.oldPrice) : null,
                  discountPct: deal.discountPct ?? null,
                  paymentInfo: deal.paymentInfo ?? null,
                  couponCode: deal.couponCode ?? null,
                  description: deal.product.description ?? null,
                };
                return (
                  <tr key={deal.id}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="relative size-10 shrink-0 overflow-hidden rounded-md bg-white">
                          <Image
                            src={deal.product.imageUrl}
                            alt=""
                            fill
                            sizes="40px"
                            className="object-contain"
                            unoptimized
                          />
                        </span>
                        <span className="max-w-64 truncate" title={deal.product.title}>
                          {deal.product.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">{deal.store.name}</td>
                    <td className="px-4 py-3">{formatBRL(Number(deal.price))}</td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          isManual
                            ? "bg-brand/15 text-brand rounded-full px-2 py-0.5 text-xs font-medium"
                            : "bg-surface-raised text-muted-foreground rounded-full px-2 py-0.5 text-xs font-medium"
                        }
                      >
                        {isManual ? "Manual" : "Automática"}
                      </span>
                    </td>
                    <td className="text-muted-foreground px-4 py-3">
                      {deal.createdAt.toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <PromoteDealButton deal={whatsAppDeal} />
                        {isManual && (
                          <>
                            <Link
                              href={`/admin/ofertas/${deal.id}/editar`}
                              className={buttonClasses("outline", "sm")}
                            >
                              Editar
                            </Link>
                            <DeleteDealButton dealId={deal.id} dealTitle={deal.product.title} />
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <ListingPagination
        basePath="/admin/promover"
        state={paginationState}
        pageCount={pageCount}
        extra={query ? { q: query } : undefined}
      />
    </section>
  );
}
