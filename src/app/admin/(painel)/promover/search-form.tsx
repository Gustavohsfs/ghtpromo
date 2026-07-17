import { Search } from "lucide-react";

/** Busca server-side por título/descrição — form GET nativo, sem JS. */
export function SearchForm({ query }: { query: string }) {
  return (
    <form action="/admin/promover" className="flex items-center gap-2">
      <label htmlFor="promover-busca" className="sr-only">
        Buscar ofertas
      </label>
      <div className="relative">
        <Search
          aria-hidden
          className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
        />
        <input
          id="promover-busca"
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Buscar por título ou descrição…"
          className="border-border bg-surface placeholder:text-muted-foreground focus-visible:outline-ring w-72 rounded-md border py-2 pr-3 pl-9 text-sm focus-visible:outline-2"
        />
      </div>
      <button
        type="submit"
        className="border-border hover:border-brand hover:text-brand rounded-md border px-3 py-2 text-sm transition-colors"
      >
        Buscar
      </button>
    </form>
  );
}
