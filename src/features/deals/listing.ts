/**
 * Estado de listagem com filtros e paginação — vive na URL
 * (?lojas=a,b&preco=100-500&ordem=menor-preco&page=2), então é compartilhável
 * e renderizado no servidor. Parse tolerante: valor inválido vira default.
 */

export const DEALS_PAGE_SIZE = 60;

export type DealSort = "recentes" | "menor-preco" | "maior-preco";

const SORTS: readonly DealSort[] = ["recentes", "menor-preco", "maior-preco"];

export interface PriceRange {
  id: string;
  label: string;
  min: number;
  /** null = sem teto. */
  max: number | null;
}

export const PRICE_RANGES: readonly PriceRange[] = [
  { id: "ate-100", label: "Até R$ 100", min: 0, max: 100 },
  { id: "100-500", label: "R$ 100 a R$ 500", min: 100, max: 500 },
  { id: "500-1500", label: "R$ 500 a R$ 1.500", min: 500, max: 1500 },
  { id: "1500-mais", label: "Acima de R$ 1.500", min: 1500, max: null },
];

/** Estado de filtros/página vindo da URL. */
export interface ListingState {
  stores: string[];
  priceRange: string | null;
  sort: DealSort;
  page: number;
}

type SearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

export function parseListingParams(searchParams: SearchParams): ListingState {
  const stores = first(searchParams.lojas)
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  const preco = first(searchParams.preco);
  const ordem = first(searchParams.ordem) as DealSort;
  const page = Number(first(searchParams.page));

  return {
    stores,
    priceRange: PRICE_RANGES.some((range) => range.id === preco) ? preco : null,
    sort: SORTS.includes(ordem) ? ordem : "recentes",
    page: Number.isInteger(page) && page > 1 ? page : 1,
  };
}

/** Filtro real ativo (loja/preço/ordenação)? Paginação pura não conta. */
export function hasActiveFilters(state: ListingState): boolean {
  return state.stores.length > 0 || state.priceRange !== null || state.sort !== "recentes";
}

/**
 * Monta o href de uma listagem: defaults são omitidos (URL limpa), `extra`
 * preserva parâmetros alheios ao filtro (ex.: `q` da busca).
 */
export function buildListingHref(
  basePath: string,
  state: ListingState,
  overrides: Partial<ListingState> = {},
  extra: Record<string, string> = {},
): string {
  const merged = { ...state, ...overrides };
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(extra)) {
    if (value) params.set(key, value);
  }
  if (merged.stores.length > 0) params.set("lojas", merged.stores.join(","));
  if (merged.priceRange) params.set("preco", merged.priceRange);
  if (merged.sort !== "recentes") params.set("ordem", merged.sort);
  if (merged.page > 1) params.set("page", String(merged.page));

  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}
