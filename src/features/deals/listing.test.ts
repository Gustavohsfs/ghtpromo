import { describe, expect, it } from "vitest";

import { buildListingHref, hasActiveFilters, parseListingParams, PRICE_RANGES } from "./listing";

describe("parseListingParams", () => {
  it("aplica defaults com searchParams vazios", () => {
    expect(parseListingParams({})).toEqual({
      stores: [],
      priceRange: null,
      sort: "recentes",
      page: 1,
    });
  });

  it("lê lojas (CSV), faixa de preço, ordenação e página", () => {
    const parsed = parseListingParams({
      lojas: "amazon,kabum",
      preco: "100-500",
      ordem: "menor-preco",
      page: "3",
    });
    expect(parsed).toEqual({
      stores: ["amazon", "kabum"],
      priceRange: "100-500",
      sort: "menor-preco",
      page: 3,
    });
  });

  it("descarta valores inválidos sem quebrar", () => {
    const parsed = parseListingParams({
      preco: "banana",
      ordem: "hackeado",
      page: "-5",
      lojas: " , ,",
    });
    expect(parsed).toEqual({ stores: [], priceRange: null, sort: "recentes", page: 1 });
  });
});

describe("hasActiveFilters", () => {
  it("página e ordenação não contam como filtro (só noindex com filtro real)", () => {
    expect(hasActiveFilters(parseListingParams({ page: "2" }))).toBe(false);
    expect(hasActiveFilters(parseListingParams({ ordem: "menor-preco" }))).toBe(true);
    expect(hasActiveFilters(parseListingParams({ lojas: "amazon" }))).toBe(true);
    expect(hasActiveFilters(parseListingParams({ preco: "ate-100" }))).toBe(true);
  });
});

describe("buildListingHref", () => {
  it("monta URL limpa com defaults omitidos", () => {
    const state = parseListingParams({});
    expect(buildListingHref("/categorias/computadores", state)).toBe("/categorias/computadores");
  });

  it("inclui filtros ativos e página, e aceita overrides", () => {
    const state = parseListingParams({ lojas: "amazon", preco: "ate-100", page: "2" });
    const href = buildListingHref("/categorias/computadores", state, { page: 3 });
    expect(href).toBe("/categorias/computadores?lojas=amazon&preco=ate-100&page=3");
  });

  it("preserva parâmetros extras (ex.: q da busca)", () => {
    const state = parseListingParams({});
    const href = buildListingHref("/busca", state, {}, { q: "ssd" });
    expect(href).toBe("/busca?q=ssd");
  });

  it("remove a página ao trocar filtro (volta pra 1)", () => {
    const state = parseListingParams({ page: "4" });
    const href = buildListingHref("/categorias/tvs", state, { stores: ["kabum"], page: 1 });
    expect(href).toBe("/categorias/tvs?lojas=kabum");
  });
});

describe("PRICE_RANGES", () => {
  it("cobre as 4 faixas do spec com min/max coerentes", () => {
    expect(PRICE_RANGES.map((r) => r.id)).toEqual(["ate-100", "100-500", "500-1500", "1500-mais"]);
    expect(PRICE_RANGES[0]).toMatchObject({ min: 0, max: 100 });
    expect(PRICE_RANGES[3]).toMatchObject({ min: 1500, max: null });
  });
});
