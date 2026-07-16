import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { getDealsRepository } from "@/data/repository";
import { CouponCard } from "@/features/coupons/coupon-card";

async function couponsOfStore(storeId: string) {
  const coupons = await getDealsRepository().getActiveCoupons();
  return coupons.filter((coupon) => coupon.store.id === storeId);
}

export async function generateMetadata(props: PageProps<"/cupons/[loja]">): Promise<Metadata> {
  const { loja } = await props.params;
  const coupons = await couponsOfStore(loja);
  if (coupons.length === 0) return {};
  const storeName = coupons[0].store.name;

  return {
    title: `Cupons ${storeName}`,
    description: `Cupons de desconto válidos da ${storeName} — copie o código e economize.`,
    alternates: { canonical: `/cupons/${loja}` },
    openGraph: {
      title: `Cupons ${storeName}`,
      description: `Cupons de desconto válidos da ${storeName}.`,
      url: `/cupons/${loja}`,
    },
  };
}

/** Cupons de uma loja específica (ex.: /cupons/mercadolivre). */
export default async function StoreCouponsPage(props: PageProps<"/cupons/[loja]">) {
  const { loja } = await props.params;
  const coupons = await couponsOfStore(loja);
  if (coupons.length === 0) notFound();
  const storeName = coupons[0].store.name;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <header className="flex flex-col gap-2">
        <Link
          href="/cupons"
          className="text-muted-foreground hover:text-brand inline-flex items-center gap-1 text-xs transition-colors"
        >
          <ArrowLeft className="size-3.5" aria-hidden />
          Todas as lojas
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Cupons {storeName}</h1>
        <p className="text-muted-foreground text-sm">
          {coupons.length} código{coupons.length === 1 ? "" : "s"} válido
          {coupons.length === 1 ? "" : "s"} — toque no cupom para ver como usar.
        </p>
      </header>

      <div className="energy-line" aria-hidden />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {coupons.map((coupon) => (
          <CouponCard key={coupon.id} coupon={coupon} />
        ))}
      </div>
    </div>
  );
}
