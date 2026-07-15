import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getDealsRepository } from "@/data/repository";
import { hasActiveFilters, parseListingParams, PRICE_RANGES } from "@/features/deals/listing";
import { ListingPagination } from "@/features/deals/listing-pagination";
import { ProductCard } from "@/features/deals/product-card";
import { breadcrumbJsonLd, itemListJsonLd, JsonLd } from "@/lib/jsonld";

/** Slugs conhecidos no build; a página é dinâmica (filtros via searchParams). */
export async function generateStaticParams() {
  const categories = await getDealsRepository().getCategories();
  return categories.map(({ slug }) => ({ slug }));
}

export async function generateMetadata(props: PageProps<"/categorias/[slug]">): Promise<Metadata> {
  const [{ slug }, searchParams] = await Promise.all([props.params, props.searchParams]);
  const category = await getDealsRepository().getCategoryBySlug(slug);
  if (!category) return {};
  const state = parseListingParams(searchParams);

  return {
    title: `${category.name} em promoção`,
    description: category.description,
    alternates: { canonical: `/categorias/${category.slug}` },
    // Combinações filtradas não entram no índice (evita duplicação);
    // paginação pura (?page=N) continua indexável.
    robots: hasActiveFilters(state) ? { index: false, follow: true } : undefined,
    openGraph: {
      title: `${category.name} em promoção`,
      description: category.description,
      url: `/categorias/${category.slug}`,
    },
  };
}

/** Listagem da categoria com filtros da sidebar e paginação numerada. */
export default async function CategoryPage(props: PageProps<"/categorias/[slug]">) {
  const [{ slug }, searchParams] = await Promise.all([props.params, props.searchParams]);
  const repository = getDealsRepository();
  const category = await repository.getCategoryBySlug(slug);
  if (!category) notFound();

  const state = parseListingParams(searchParams);
  const range = PRICE_RANGES.find((candidate) => candidate.id === state.priceRange);
  const listing = await repository.listDeals({
    categorySlug: slug,
    stores: state.stores,
    minPrice: range?.min,
    maxPrice: range?.max ?? undefined,
    sort: state.sort,
    page: state.page,
  });

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <JsonLd data={itemListJsonLd(category, listing.deals)} />
      <JsonLd data={breadcrumbJsonLd(category)} />
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">{category.name}</h1>
        <p className="text-muted-foreground text-sm">
          {category.description}
          {listing.total > 0 &&
            ` · ${listing.total} oferta${listing.total === 1 ? "" : "s"}${
              listing.pageCount > 1 ? ` · página ${listing.page} de ${listing.pageCount}` : ""
            }`}
        </p>
      </header>

      <div className="energy-line" aria-hidden />

      {listing.deals.length > 0 ? (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
            {listing.deals.map((deal) => (
              <ProductCard key={deal.id} deal={deal} titleAs="h2" />
            ))}
          </div>
          <ListingPagination
            basePath={`/categorias/${slug}`}
            state={state}
            pageCount={listing.pageCount}
          />
        </>
      ) : (
        <p className="text-muted-foreground py-12 text-center text-sm">
          {hasActiveFilters(state) || state.page > 1
            ? "Nenhuma oferta com esses filtros — limpe os filtros na barra lateral."
            : "Nenhuma oferta ativa nesta categoria agora — volte em breve!"}
        </p>
      )}
    </div>
  );
}
