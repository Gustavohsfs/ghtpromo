import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Modal } from "./modal";

describe("Modal", () => {
  it("fechado não força display no <dialog> (regressão: modais sobrepostos na página)", () => {
    render(
      <Modal open={false} onClose={() => {}} title="Teste" footer={<button>Ação</button>}>
        Conteúdo
      </Modal>,
    );
    const dialog = document.querySelector("dialog");
    expect(dialog).not.toBeNull();
    // `display: flex` incondicional vence o `dialog:not([open]) { display: none }`
    // do navegador e faz todo modal fechado aparecer no meio da página.
    // O certo é a variante `open:flex`, que só vale com o atributo [open].
    expect(dialog?.classList.contains("flex")).toBe(false);
    expect(dialog?.className).toContain("open:flex");
  });

  it("aberto renderiza título, corpo e rodapé", () => {
    render(
      <Modal open onClose={() => {}} title="Promover" footer={<button>Confirmar</button>}>
        Corpo do modal
      </Modal>,
    );
    expect(screen.getByRole("heading", { name: "Promover" })).toBeInTheDocument();
    expect(screen.getByText("Corpo do modal")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Confirmar" })).toBeInTheDocument();
  });
});
