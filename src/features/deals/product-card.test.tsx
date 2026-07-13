import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ProductCard } from "./product-card";
import type { Deal } from "./types";

const deal: Deal = {
  id: "samsung-crystal-55",
  product: {
    id: "produto-samsung-crystal-55",
    title: 'Smart TV Samsung 55" Crystal UHD 4K',
    imageUrl: "/products/tvs.svg",
    categorySlug: "tvs",
    isMock: true,
  },
  store: { id: "magalu", name: "Magazine Luiza", iconUrl: "/stores/magalu.svg", isMock: true },
  price: 2399,
  oldPrice: 3299,
  discountPct: 27,
  affiliateUrl: "https://exemplo.ghtpromo.dev/redir/samsung-crystal-55",
  featured: true,
  isMock: true,
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("ProductCard", () => {
  it("renderiza a anatomia completa do card", () => {
    render(<ProductCard deal={deal} />);

    expect(screen.getByRole("heading", { level: 3, name: deal.product.title })).toBeVisible();
    expect(screen.getByRole("img", { name: deal.product.title })).toBeInTheDocument();
    expect(screen.getByText("R$ 2.399")).toBeVisible();
    expect(screen.getByText("R$ 3.299")).toBeVisible();
    expect(screen.getByText("-27%")).toBeVisible();
    expect(screen.getByText("Oferta na Magazine Luiza")).toBeInTheDocument();
  });

  it("aponta o link da oferta para buildAffiliateUrl com rel de afiliado", () => {
    render(<ProductCard deal={deal} />);

    const link = screen.getByRole("link", { name: /ver oferta/i });
    expect(link).toHaveAttribute("href", deal.affiliateUrl);
    expect(link).toHaveAttribute("rel", "sponsored noopener");
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("abre a oferta em nova aba só após confirmar (verde)", async () => {
    const user = userEvent.setup();
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
    render(<ProductCard deal={deal} />);

    await user.click(screen.getByRole("link", { name: /ver oferta/i }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(openSpy).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Continuar" }));
    expect(openSpy).toHaveBeenCalledWith(deal.affiliateUrl, "_blank", "noopener");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("cancelar (vermelho) fecha sem abrir a oferta", async () => {
    const user = userEvent.setup();
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
    render(<ProductCard deal={deal} />);

    await user.click(screen.getByRole("link", { name: /ver oferta/i }));
    await user.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(openSpy).not.toHaveBeenCalled();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
