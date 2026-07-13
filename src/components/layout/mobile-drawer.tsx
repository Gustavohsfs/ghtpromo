"use client";

import { useEffect, useRef, type MouseEvent } from "react";
import { X } from "lucide-react";

import { Logo } from "@/components/layout/logo";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import type { CategoryNavItem } from "@/features/categories/nav";

export interface MobileDrawerProps {
  navItems: CategoryNavItem[];
  open: boolean;
  onClose: () => void;
}

/**
 * Drawer de navegação no mobile, sobre <dialog> nativo (foco preso, Esc fecha,
 * foco retorna ao botão do header ao fechar).
 */
export function MobileDrawer({ navItems, open, onClose }: MobileDrawerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  function handleBackdropClick(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === dialogRef.current) onClose();
  }

  return (
    <dialog
      ref={dialogRef}
      aria-label="Menu de categorias"
      onClose={onClose}
      onClick={handleBackdropClick}
      className={
        "border-border bg-surface m-0 h-dvh max-h-none w-72 max-w-[85vw] border-r " +
        "text-foreground backdrop:bg-black/70 md:hidden"
      }
    >
      <div className="border-border flex items-center justify-between border-b px-4 py-4">
        <Logo />
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar menu"
          className="text-muted-foreground hover:bg-surface-raised hover:text-foreground focus-visible:outline-ring rounded-md p-1 transition-colors focus-visible:outline-2"
        >
          <X className="size-5" aria-hidden />
        </button>
      </div>
      <div className="p-3">
        <SidebarNav items={navItems} onNavigate={onClose} />
      </div>
    </dialog>
  );
}
