"use client";

import { useState, type FormEvent } from "react";
import { Menu, Search } from "lucide-react";

import { Logo } from "@/components/layout/logo";

export interface HeaderProps {
  onOpenMobileMenu: () => void;
}

/** Header enxuto: menu (mobile), logo e busca. */
export function Header({ onOpenMobileMenu }: HeaderProps) {
  const [query, setQuery] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // TODO(Fase 5): buscar sobre o DealsRepository (client-side por enquanto).
  }

  return (
    <header className="border-border bg-background/90 sticky top-0 z-10 border-b backdrop-blur">
      <div className="flex h-14 items-center gap-4 px-4">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Abrir menu de categorias"
          className="text-muted-foreground hover:bg-surface-raised hover:text-foreground focus-visible:outline-ring rounded-md p-2 transition-colors focus-visible:outline-2 md:hidden"
        >
          <Menu className="size-5" aria-hidden />
        </button>

        <Logo />

        <form
          role="search"
          onSubmit={handleSubmit}
          className="ml-auto flex w-full max-w-xs items-center"
        >
          <label htmlFor="site-search" className="sr-only">
            Buscar promoções
          </label>
          <div className="relative w-full">
            <Search
              className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
              aria-hidden
            />
            <input
              id="site-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar promoções…"
              className="border-border bg-surface text-foreground placeholder:text-muted-foreground focus-visible:border-brand focus-visible:outline-ring h-9 w-full rounded-md border pr-3 pl-9 text-sm focus-visible:outline-2 focus-visible:outline-offset-0"
            />
          </div>
        </form>
      </div>
      <div className="energy-line" aria-hidden />
    </header>
  );
}
