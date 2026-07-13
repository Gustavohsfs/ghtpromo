import type { Metadata } from "next";
import { SearchX } from "lucide-react";

import { getDealsRepository } from "@/data/repository";
import { ProductCard } from "@/features/deals/product-card";

export const metadata: Metadata = {
  title: "Busca",
  description: "Busque promoções por nome de produto.",
  robots: { index: false }, // página de resultados não deve ser indexada
};

/** Resultados de busca server-side sobre o DealsRepository (?q=...). */
export default async function SearchPage(props: PageProps<"/busca">) {
  const { q } = await props.searchParams;
  const query = (typeof q === "string" ? q : "").trim();
  const deals = query ? await getDealsRepository().searchDeals(query) : [];

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Busca</h1>
        <p className="text-muted-foreground text-sm" role="status">
          {query
            ? `${deals.length} resultado${deals.length === 1 ? "" : "s"} para "${query}"`
            : "Digite algo na busca para encontrar promoções."}
        </p>
      </header>

      <div className="energy-line" aria-hidden />

      {deals.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
          {deals.map((deal) => (
            <ProductCard key={deal.id} deal={deal} />
          ))}
        </div>
      ) : query ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <SearchX className="text-muted-foreground size-8" aria-hidden />
          <p className="text-muted-foreground text-sm">
            Nada encontrado. Tente outro termo — ex.: &quot;iPhone&quot;, &quot;geladeira&quot;,
            &quot;notebook&quot;.
          </p>
        </div>
      ) : null}
    </div>
  );
}
