import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { ProductCard } from "./product-card";
import type { Category, Deal } from "./types";

export interface DealsSectionProps {
  category: Category;
  deals: Deal[];
}

/** Seção da home: título da categoria, grade de ofertas e "ver todos". */
export function DealsSection({ category, deals }: DealsSectionProps) {
  if (deals.length === 0) return null;
  const headingId = `secao-${category.slug}`;

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between gap-4">
        <h2 id={headingId} className="text-lg font-semibold tracking-tight">
          {category.name}
        </h2>
        <Link
          href={`/categorias/${category.slug}`}
          aria-label={`Ver todos de ${category.name}`}
          className="focus-visible:outline-ring text-brand hover:text-brand-strong inline-flex items-center gap-1 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          ver todos
          <ArrowRight className="size-3.5" aria-hidden />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
        {deals.map((deal) => (
          <ProductCard key={deal.id} deal={deal} />
        ))}
      </div>
    </section>
  );
}
