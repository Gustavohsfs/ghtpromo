import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Home from "./page";

describe("Home", () => {
  it("renderiza o heading principal e as seções por categoria", async () => {
    render(await Home());

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/promoções/i);

    // Uma seção (h2) por categoria da vitrine
    for (const name of ["Eletrônicos", "Geladeiras", "TVs", "Computadores", "iPhones"]) {
      expect(screen.getByRole("heading", { level: 2, name })).toBeInTheDocument();
    }
  });

  it("cada seção tem link 'ver todos' para a página da categoria", async () => {
    render(await Home());

    const link = screen.getByRole("link", { name: /ver todos de geladeiras/i });
    expect(link).toHaveAttribute("href", "/categorias/geladeiras");
  });
});
