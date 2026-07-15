import Link from "next/link";

import { cn } from "@/lib/cn";

import { buildListingHref, type ListingState } from "./listing";

export interface ListingPaginationProps {
  basePath: string;
  state: ListingState;
  pageCount: number;
  /** Parâmetros extras preservados nos links (ex.: q da busca). */
  extra?: Record<string, string>;
}

/** Janela de páginas exibidas ao redor da atual (1 … 4 5 [6] 7 8 … 20). */
const WINDOW = 2;

function pagesToShow(current: number, pageCount: number): number[] {
  const pages = new Set<number>([1, pageCount]);
  for (let page = current - WINDOW; page <= current + WINDOW; page += 1) {
    if (page >= 1 && page <= pageCount) pages.add(page);
  }
  return [...pages].sort((a, b) => a - b);
}

/** Paginação numerada (?page=N) com rel prev/next para SEO. */
export function ListingPagination({ basePath, state, pageCount, extra }: ListingPaginationProps) {
  if (pageCount <= 1) return null;
  const pages = pagesToShow(state.page, pageCount);

  return (
    <nav aria-label="Paginação" className="flex flex-wrap items-center justify-center gap-1.5">
      {state.page > 1 && (
        <Link
          rel="prev"
          href={buildListingHref(basePath, state, { page: state.page - 1 }, extra)}
          className="border-border hover:border-brand hover:text-brand rounded-md border px-3 py-1.5 text-sm transition-colors"
        >
          Anterior
        </Link>
      )}
      {pages.map((page, index) => (
        <span key={page} className="flex items-center gap-1.5">
          {index > 0 && pages[index - 1] !== page - 1 && (
            <span className="text-muted-foreground text-sm">…</span>
          )}
          {page === state.page ? (
            <span
              aria-current="page"
              className="bg-brand text-brand-foreground rounded-md px-3 py-1.5 text-sm font-semibold"
            >
              {page}
            </span>
          ) : (
            <Link
              href={buildListingHref(basePath, state, { page }, extra)}
              className={cn(
                "border-border rounded-md border px-3 py-1.5 text-sm transition-colors",
                "hover:border-brand hover:text-brand",
              )}
            >
              {page}
            </Link>
          )}
        </span>
      ))}
      {state.page < pageCount && (
        <Link
          rel="next"
          href={buildListingHref(basePath, state, { page: state.page + 1 }, extra)}
          className="border-border hover:border-brand hover:text-brand rounded-md border px-3 py-1.5 text-sm transition-colors"
        >
          Próxima
        </Link>
      )}
    </nav>
  );
}
