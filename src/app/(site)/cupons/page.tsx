import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, TicketPercent } from "lucide-react";

import { Card } from "@/components/ui/card";
import { getDealsRepository } from "@/data/repository";
import type { Coupon } from "@/features/coupons/types";

export const metadata: Metadata = {
  title: "Cupons de desconto",
  description:
    "Cupons de desconto válidos das lojas oficiais, organizados por loja — copie o código e economize.",
  alternates: { canonical: "/cupons" },
  openGraph: {
    title: "Cupons de desconto",
    description: "Cupons válidos das lojas oficiais, organizados por loja.",
    url: "/cupons",
  },
};

/** Agrupa cupons ativos por loja, preservando a ordem (mais recente antes). */
function groupByStore(coupons: Coupon[]) {
  const groups = new Map<string, { store: Coupon["store"]; count: number }>();
  for (const coupon of coupons) {
    const group = groups.get(coupon.store.id);
    if (group) group.count += 1;
    else groups.set(coupon.store.id, { store: coupon.store, count: 1 });
  }
  return [...groups.values()].sort((a, b) => a.store.name.localeCompare(b.store.name, "pt-BR"));
}

/** Aba de cupons: uma vitrine por loja — clique na loja para ver os códigos. */
export default async function CouponsPage() {
  const coupons = await getDealsRepository().getActiveCoupons();
  const groups = groupByStore(coupons);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Cupons de desconto</h1>
        <p className="text-muted-foreground text-sm">
          Escolha a loja para ver os códigos válidos — validade e regras são de cada loja.
        </p>
      </header>

      <div className="energy-line" aria-hidden />

      {groups.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {groups.map(({ store, count }) => (
            <Link key={store.id} href={`/cupons/${store.id}`} className="group">
              <Card glowOnHover className="flex items-center gap-4 p-5">
                <Image
                  src={store.iconUrl}
                  alt=""
                  width={96}
                  height={29}
                  className="h-7 w-24 rounded-md"
                />
                <div className="flex-1">
                  <h2 className="group-hover:text-brand text-sm font-semibold transition-colors">
                    {store.name}
                  </h2>
                  <p className="text-muted-foreground text-xs">
                    {count} cupo{count === 1 ? "m" : "ns"} ativo{count === 1 ? "" : "s"}
                  </p>
                </div>
                <ArrowRight
                  className="text-muted-foreground group-hover:text-brand size-4 transition-colors"
                  aria-hidden
                />
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <TicketPercent className="text-muted-foreground size-8" aria-hidden />
          <p className="text-muted-foreground text-sm">
            Nenhum cupom ativo agora — volte em breve, sempre pintam códigos novos!
          </p>
        </div>
      )}
    </div>
  );
}
