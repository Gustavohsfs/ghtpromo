import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ConfirmDialog } from "./confirm-dialog";

function renderDialog(open = true) {
  const onConfirm = vi.fn();
  const onCancel = vi.fn();
  render(
    <ConfirmDialog open={open} title="Sair do site" onConfirm={onConfirm} onCancel={onCancel}>
      Você será levado à loja parceira.
    </ConfirmDialog>,
  );
  return { onConfirm, onCancel };
}

describe("ConfirmDialog", () => {
  it("mostra título e conteúdo quando aberto", () => {
    renderDialog();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Sair do site" })).toBeInTheDocument();
    expect(screen.getByText("Você será levado à loja parceira.")).toBeInTheDocument();
  });

  it("dispara onConfirm no botão verde de confirmação", async () => {
    const user = userEvent.setup();
    const { onConfirm, onCancel } = renderDialog();

    const confirmButton = screen.getByRole("button", { name: "Confirmar" });
    expect(confirmButton).toHaveClass("bg-brand");
    await user.click(confirmButton);
    expect(onConfirm).toHaveBeenCalledOnce();
    expect(onCancel).not.toHaveBeenCalled();
  });

  it("dispara onCancel no botão vermelho de cancelar", async () => {
    const user = userEvent.setup();
    const { onConfirm, onCancel } = renderDialog();

    const cancelButton = screen.getByRole("button", { name: "Cancelar" });
    expect(cancelButton).toHaveClass("bg-destructive");
    await user.click(cancelButton);
    expect(onCancel).toHaveBeenCalledOnce();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("não renderiza conteúdo visível quando fechado", () => {
    renderDialog(false);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
