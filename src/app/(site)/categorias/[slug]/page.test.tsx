import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import CategoryPage, { generateStaticParams } from "./page";

function pageProps(slug: string) {
  return {
    params: Promise.resolve({ slug }),
    searchParams: Promise.resolve({}),
  } as PageProps<"/categorias/[slug]">;
}

describe("CategoryPage", () => {
  it("renderiza heading e grade de ofertas da categoria", async () => {
    render(await CategoryPage(pageProps("tvs")));

    expect(screen.getByRole("heading", { level: 1, name: "TVs" })).toBeVisible();
    const offerLinks = screen.getAllByRole("link", { name: /ver oferta/i });
    expect(offerLinks.length).toBeGreaterThanOrEqual(3);
  });

  it("dispara notFound() para slug inexistente", async () => {
    await expect(CategoryPage(pageProps("nao-existe"))).rejects.toThrow();
  });

  it("gera params estáticos para todas as categorias", async () => {
    const params = await generateStaticParams();
    expect(params).toContainEqual({ slug: "iphones" });
    expect(params).toHaveLength(5);
  });
});
