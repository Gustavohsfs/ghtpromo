import type { Metadata } from "next";
import { SearchX } from "lucide-react";

import { getDealsRepository } from "@/data/repository";
import { parseListingParams, PRICE_RANGES } from "@/features/deals/listing";
import { ListingPagination } from "@/features/deals/listing-pagination";
import { ProductCard } from "@/features/deals/product-card";

export const metadata: Metadata = {
  title: "Busca",
  description: "Busque promoções por nome de produto.",
  robots: { index: false }, // página de resultados não deve ser indexada
};

/** Resultados de busca server-side com filtros e paginação (?q=...). */
export default async function SearchPage(props: PageProps<"/busca">) {
  const searchParams = await props.searchParams;
  const query = (typeof searchParams.q === "string" ? searchParams.q : "").trim();
  const state = parseListingParams(searchParams);
  const range = PRICE_RANGES.find((candidate) => candidate.id === state.priceRange);

  const listing = query
    ? await getDealsRepository().listDeals({
        searchQuery: query,
        stores: state.stores,
        minPrice: range?.min,
        maxPrice: range?.max ?? undefined,
        sort: state.sort,
        page: state.page,
      })
    : null;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Busca</h1>
        <p className="text-muted-foreground text-sm" role="status">
          {listing
            ? `${listing.total} resultado${listing.total === 1 ? "" : "s"} para "${query}"${
                listing.pageCount > 1 ? ` · página ${listing.page} de ${listing.pageCount}` : ""
              }`
            : "Digite algo na busca para encontrar promoções."}
        </p>
      </header>

      <div className="energy-line" aria-hidden />

      {listing && listing.deals.length > 0 ? (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
            {listing.deals.map((deal) => (
              <ProductCard key={deal.id} deal={deal} titleAs="h2" />
            ))}
          </div>
          <ListingPagination
            basePath="/busca"
            state={state}
            pageCount={listing.pageCount}
            extra={{ q: query }}
          />
        </>
      ) : listing ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <SearchX className="text-muted-foreground size-8" aria-hidden />
          <p className="text-muted-foreground text-sm">
            Nada encontrado. Tente outro termo ou limpe os filtros da barra lateral.
          </p>
        </div>
      ) : null}
    </div>
  );
}
