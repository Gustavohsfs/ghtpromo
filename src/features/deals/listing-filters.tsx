"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { cn } from "@/lib/cn";

import {
  buildListingHref,
  hasActiveFilters,
  parseListingParams,
  PRICE_RANGES,
  type DealSort,
  type ListingState,
} from "./listing";

export interface ListingFiltersProps {
  stores: { id: string; name: string }[];
  /** Compacto (sidebar colapsada) esconde os filtros. */
  hidden?: boolean;
}

const SORT_OPTIONS: { value: DealSort; label: string }[] = [
  { value: "recentes", label: "Mais recentes" },
  { value: "menor-preco", label: "Menor preço" },
  { value: "maior-preco", label: "Maior preço" },
];

/**
 * Filtros enxutos da sidebar (loja, faixa de preço, ordenação). Só aparecem
 * nas listagens (/categorias/*, /busca); o estado vive na URL — cada mudança
 * navega (Server Component refaz a consulta) e zera a página.
 */
export function ListingFilters({ stores, hidden }: ListingFiltersProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const isListing = pathname.startsWith("/categorias/") || pathname === "/busca";
  if (!isListing || hidden) return null;

  const state = parseListingParams(Object.fromEntries(searchParams.entries()));
  const extra: Record<string, string> =
    pathname === "/busca" ? { q: searchParams.get("q") ?? "" } : {};

  function navigate(overrides: Partial<ListingState>) {
    router.push(buildListingHref(pathname, state, { ...overrides, page: 1 }, extra));
  }

  function toggleStore(storeId: string) {
    const next = state.stores.includes(storeId)
      ? state.stores.filter((id) => id !== storeId)
      : [...state.stores, storeId];
    navigate({ stores: next });
  }

  return (
    <div className="border-border flex flex-col gap-4 border-t pt-4" data-testid="listing-filters">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
          Filtros
        </p>
        {hasActiveFilters(state) && (
          <button
            type="button"
            onClick={() => navigate({ stores: [], priceRange: null, sort: "recentes" })}
            className="text-brand hover:text-brand-strong text-xs"
          >
            Limpar
          </button>
        )}
      </div>

      <fieldset className="flex flex-col gap-1.5">
        <legend className="mb-1.5 text-xs font-medium">Lojas</legend>
        {stores.map((store) => (
          <label
            key={store.id}
            className="hover:text-brand flex cursor-pointer items-center gap-2 text-sm transition-colors"
          >
            <input
              type="checkbox"
              checked={state.stores.includes(store.id)}
              onChange={() => toggleStore(store.id)}
              className="accent-brand size-3.5"
            />
            {store.name}
          </label>
        ))}
      </fieldset>

      <fieldset className="flex flex-col gap-1.5">
        <legend className="mb-1.5 text-xs font-medium">Preço</legend>
        {PRICE_RANGES.map((range) => {
          const active = state.priceRange === range.id;
          return (
            <label
              key={range.id}
              className={cn(
                "flex cursor-pointer items-center gap-2 text-sm transition-colors",
                active ? "text-brand" : "hover:text-brand",
              )}
            >
              <input
                type="radio"
                name="preco"
                checked={active}
                onChange={() => navigate({ priceRange: active ? null : range.id })}
                onClick={() => active && navigate({ priceRange: null })}
                className="accent-brand size-3.5"
              />
              {range.label}
            </label>
          );
        })}
      </fieldset>

      <label className="flex flex-col gap-1.5 text-xs font-medium">
        Ordenar por
        <select
          value={state.sort}
          onChange={(event) => navigate({ sort: event.target.value as DealSort })}
          className="border-border bg-surface text-foreground w-full rounded-md border px-2 py-1.5 text-sm"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
