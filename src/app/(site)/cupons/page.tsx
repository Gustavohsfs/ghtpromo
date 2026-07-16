import type { Metadata } from "next";
import { TicketPercent } from "lucide-react";

import { getDealsRepository } from "@/data/repository";
import { CouponCard } from "@/features/coupons/coupon-card";

export const metadata: Metadata = {
  title: "Cupons de desconto",
  description:
    "Cupons de desconto válidos das lojas oficiais — copie o código e economize na hora.",
  alternates: { canonical: "/cupons" },
  openGraph: {
    title: "Cupons de desconto",
    description: "Cupons válidos das lojas oficiais — copie o código e economize.",
    url: "/cupons",
  },
};

/** Aba de cupons: códigos válidos das lojas parceiras, copiáveis em um toque. */
export default async function CouponsPage() {
  const coupons = await getDealsRepository().getActiveCoupons();

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Cupons de desconto</h1>
        <p className="text-muted-foreground text-sm">
          Copie o código, aplique no carrinho da loja e economize — validade e regras são da loja.
        </p>
      </header>

      <div className="energy-line" aria-hidden />

      {coupons.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {coupons.map((coupon) => (
            <CouponCard key={coupon.id} coupon={coupon} />
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
