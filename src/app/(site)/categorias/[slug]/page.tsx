import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getDealsRepository } from "@/data/repository";
import { ProductCard } from "@/features/deals/product-card";

/** Pré-renderiza todas as categorias no build (SSG). */
export async function generateStaticParams() {
  const categories = await getDealsRepository().getCategories();
  return categories.map(({ slug }) => ({ slug }));
}

export async function generateMetadata(props: PageProps<"/categorias/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const category = await getDealsRepository().getCategoryBySlug(slug);
  if (!category) return {};
  return {
    title: category.name,
    description: category.description,
  };
}

/** Listagem da categoria em grade de cards (ver skill ght-product-card). */
export default async function CategoryPage(props: PageProps<"/categorias/[slug]">) {
  const { slug } = await props.params;
  const repository = getDealsRepository();
  const category = await repository.getCategoryBySlug(slug);
  if (!category) notFound();

  const deals = await repository.getDealsByCategory(slug);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">{category.name}</h1>
        <p className="text-muted-foreground text-sm">{category.description}</p>
      </header>

      <div className="energy-line" aria-hidden />

      {deals.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
          {deals.map((deal) => (
            <ProductCard key={deal.id} deal={deal} />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground py-12 text-center text-sm">
          Nenhuma oferta ativa nesta categoria agora — volte em breve!
        </p>
      )}
    </div>
  );
}
