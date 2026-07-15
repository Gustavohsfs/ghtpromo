import type { Deal } from "./types";

/**
 * Variedade de lojas nas vitrines (destaques e seções da home): ofertas
 * curadas (manual/demo) vêm primeiro e o feed automático (source "awin",
 * hoje só KaBuM) entra limitado — para a vitrine não virar um mar de uma
 * loja só. Sem nenhuma curada, o feed preenche tudo (fallback).
 */

/** Máximo de ofertas do feed automático por vitrine quando há curadas. */
const MAX_FEED_DEALS_PER_SHOWCASE = 2;

export function diversifyDeals(deals: Deal[], slots: number): Deal[] {
  const curated = deals.filter((deal) => deal.source !== "awin");
  const feed = deals.filter((deal) => deal.source === "awin");

  if (curated.length === 0) return feed.slice(0, slots);

  const picked = curated.slice(0, slots);
  const feedSlots = Math.min(MAX_FEED_DEALS_PER_SHOWCASE, slots - picked.length);
  return [...picked, ...feed.slice(0, Math.max(0, feedSlots))];
}
