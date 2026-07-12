import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Button } from "./button";

describe("Button", () => {
  it("renderiza como type=button por padrão e dispara onClick", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Ver oferta</Button>);

    const button = screen.getByRole("button", { name: "Ver oferta" });
    expect(button).toHaveAttribute("type", "button");
    await user.click(button);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("aplica a variante confirm (verde) por padrão", () => {
    render(<Button>Confirmar</Button>);
    expect(screen.getByRole("button")).toHaveClass("bg-brand");
  });

  it("aplica a variante destructive (vermelha)", () => {
    render(<Button variant="destructive">Cancelar</Button>);
    expect(screen.getByRole("button")).toHaveClass("bg-destructive");
  });

  it("fica inerte quando disabled", () => {
    render(<Button disabled>Salvar</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });
});
