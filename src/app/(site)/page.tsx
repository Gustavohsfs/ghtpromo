import type { Metadata } from "next";

import { getDealsRepository } from "@/data/repository";
import { DealsSection } from "@/features/deals/deals-section";
import { diversifyDeals } from "@/features/deals/diversity";
import { ProductCard } from "@/features/deals/product-card";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

/** Quantas ofertas cada seção da home mostra (o "ver todos" leva ao resto). */
const DEALS_PER_SECTION = 8;
/** Quantos cards na vitrine de destaques. */
const FEATURED_SLOTS = 5;

/** Home: destaques do dia + uma seção por categoria, com variedade de lojas. */
export default async function Home() {
  const repository = getDealsRepository();
  const [categories, featured, recent] = await Promise.all([
    repository.getCategories(),
    repository.getFeaturedDeals(),
    // Curadas recentes de todas as categorias — mescladas nos destaques para
    // a vitrine não ficar só com o feed da KaBuM (ver diversifyDeals).
    repository.listDeals({ sort: "recentes", page: 1 }),
  ]);
  const curatedRecent = recent.deals.filter((deal) => deal.source !== "awin");
  const highlights = diversifyDeals([...curatedRecent, ...featured], FEATURED_SLOTS);

  const sections = await Promise.all(
    categories.map(async (category) => ({
      category,
      deals: diversifyDeals(await repository.getDealsByCategory(category.slug), DEALS_PER_SECTION),
    })),
  );

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10">
      <section aria-labelledby="destaques" className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">
            As melhores promoções, <span className="text-brand">num só lugar</span>
          </h1>
          <p className="text-muted-foreground text-sm">
            Ofertas de lojas oficiais, organizadas por categoria e atualizadas com carinho.
          </p>
        </div>

        {highlights.length > 0 && (
          <>
            <h2 id="destaques" className="sr-only">
              Destaques de hoje
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
              {highlights.map((deal) => (
                <ProductCard key={deal.id} deal={deal} />
              ))}
            </div>
          </>
        )}
        <div className="energy-line" aria-hidden />
      </section>

      {sections.map(({ category, deals }) => (
        <DealsSection key={category.slug} category={category} deals={deals} />
      ))}
    </div>
  );
}
