"use client";

import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  /** Corpo da confirmação (texto ou conteúdo rico). */
  children: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Diálogo de confirmação com a semântica de cores do projeto:
 * verde = confirmar/positivo · vermelho = negar/cancelar.
 */
export function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onCancel} title={title}>
      <div className="text-muted-foreground text-sm">{children}</div>
      <div className="mt-5 flex justify-end gap-3">
        <Button variant="destructive" size="sm" onClick={onCancel}>
          {cancelLabel}
        </Button>
        <Button variant="confirm" size="sm" onClick={onConfirm} autoFocus>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
