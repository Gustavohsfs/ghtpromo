import { getDealsRepository } from "@/data/repository";
import { DealsSection } from "@/features/deals/deals-section";
import { ProductCard } from "@/features/deals/product-card";

/** Home: destaques do dia + uma seção por categoria (estilo garimpeiros). */
export default async function Home() {
  const repository = getDealsRepository();
  const [categories, featured] = await Promise.all([
    repository.getCategories(),
    repository.getFeaturedDeals(),
  ]);
  const sections = await Promise.all(
    categories.map(async (category) => ({
      category,
      deals: await repository.getDealsByCategory(category.slug),
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

        <h2 id="destaques" className="sr-only">
          Destaques de hoje
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
          {featured.map((deal) => (
            <ProductCard key={deal.id} deal={deal} />
          ))}
        </div>
        <div className="energy-line" aria-hidden />
      </section>

      {sections.map(({ category, deals }) => (
        <DealsSection key={category.slug} category={category} deals={deals} />
      ))}
    </div>
  );
}
