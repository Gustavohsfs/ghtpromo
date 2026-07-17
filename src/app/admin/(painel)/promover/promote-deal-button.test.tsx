import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { PromoteDealButton } from "./promote-deal-button";

const deal = {
  title: "Furadeira Bosch 750W",
  url: "https://ghtpromo.com.br/produto/furadeira--abc123",
  price: 299.9,
  oldPrice: null,
  discountPct: null,
  paymentInfo: null,
  couponCode: null,
  description: null,
};

beforeAll(() => {
  // jsdom não implementa <dialog>.showModal().
  HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
    this.open = true;
  });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.open = false;
  });
});

describe("PromoteDealButton", () => {
  it("abre o modal com o preview e atualiza com a mensagem opcional", () => {
    render(<PromoteDealButton deal={deal} />);
    fireEvent.click(screen.getByRole("button", { name: /promover/i }));

    const preview = screen.getByTestId("whatsapp-preview");
    expect(preview.textContent).toContain("*Furadeira Bosch 750W*");

    fireEvent.change(screen.getByLabelText(/mensagem opcional/i), {
      target: { value: "Só hoje!" },
    });
    expect(preview.textContent).toContain("Só hoje!");
  });

  it("no desktop (jsdom) oferece copiar a mensagem e a instrução de colar", () => {
    render(<PromoteDealButton deal={deal} />);
    fireEvent.click(screen.getByRole("button", { name: /promover/i }));

    expect(screen.getByRole("button", { name: /copiar mensagem/i })).toBeInTheDocument();
    expect(screen.getByText(/cole no grupo do whatsapp/i)).toBeInTheDocument();
  });
});
