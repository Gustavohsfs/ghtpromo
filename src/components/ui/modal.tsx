"use client";

import { useEffect, useRef, type MouseEvent, type ReactNode } from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/cn";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  /** Título acessível do diálogo (vira o aria-labelledby). */
  title: string;
  children: ReactNode;
  /** Ações fixadas no rodapé (sempre visíveis; só o miolo rola). */
  footer?: ReactNode;
  className?: string;
}

/**
 * Modal acessível sobre <dialog> nativo: foco preso, Esc fecha e o foco
 * retorna ao elemento de origem automaticamente. Clique no backdrop fecha.
 * Altura limitada à viewport: cabeçalho/rodapé fixos, só o corpo rola.
 * CUIDADO: o display precisa ser `open:flex` — um display incondicional vence
 * o `dialog:not([open]) { display: none }` do navegador e faz todo modal
 * fechado aparecer sobreposto na página.
 */
export function Modal({ open, onClose, title, children, footer, className }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = `${title.replace(/\s+/g, "-").toLowerCase()}-modal-title`;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  function handleBackdropClick(event: MouseEvent<HTMLDialogElement>) {
    // Cliques no ::backdrop têm o próprio <dialog> como alvo.
    if (event.target === dialogRef.current) onClose();
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={handleBackdropClick}
      className={cn(
        "border-border bg-surface text-foreground m-auto max-h-[90dvh] w-full max-w-[calc(100vw-1.5rem)] flex-col rounded-lg border open:flex sm:max-w-md",
        "shadow-[0_0_48px_-12px_var(--color-brand-glow)] backdrop:bg-black/70",
        className,
      )}
    >
      <div className="border-border flex shrink-0 items-center justify-between border-b px-5 py-4">
        <h2 id={titleId} className="text-base font-semibold">
          {title}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="text-muted-foreground hover:bg-surface-raised hover:text-foreground focus-visible:outline-ring rounded-md p-1 transition-colors focus-visible:outline-2"
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
      {footer && (
        <div className="border-border bg-surface shrink-0 rounded-b-lg border-t px-5 py-4">
          {footer}
        </div>
      )}
    </dialog>
  );
}
