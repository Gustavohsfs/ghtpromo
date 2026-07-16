"use client";

import { useEffect, useRef, useState } from "react";

import { Check, Copy, MessageCircle, Share2 } from "lucide-react";

import { Button } from "@/components/ui/button";

export interface ShareButtonProps {
  /** URL da página de detalhe NO NOSSO site (não o link de afiliado). */
  url: string;
  title: string;
}

/**
 * Compartilhar oferta: dropdown com copiar link e WhatsApp (wa.me — o fluxo
 * padrão abre o app no celular e o WhatsApp Web/Desktop no computador).
 */
export function ShareButton({ url, title }: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setOpen(false);
      }, 1200);
    } catch {
      window.prompt("Copie o link:", url);
    }
  }

  function shareWhatsApp() {
    const text = encodeURIComponent(`${title} 🔥 ${url}`);
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener");
    setOpen(false);
  }

  const itemClasses =
    "flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm " +
    "hover:bg-surface-raised hover:text-brand transition-colors";

  return (
    <div ref={containerRef} className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <Share2 className="size-4" aria-hidden />
        Compartilhar
      </Button>

      {open && (
        <div
          role="menu"
          className="border-border bg-surface-raised absolute z-10 mt-2 w-56 rounded-lg border p-1 shadow-lg"
        >
          <button type="button" role="menuitem" onClick={copyLink} className={itemClasses}>
            {copied ? (
              <Check className="text-brand size-4" aria-hidden />
            ) : (
              <Copy className="size-4" aria-hidden />
            )}
            {copied ? "Link copiado!" : "Copiar link"}
          </button>
          <button type="button" role="menuitem" onClick={shareWhatsApp} className={itemClasses}>
            <MessageCircle className="size-4" aria-hidden />
            Enviar no WhatsApp
          </button>
        </div>
      )}
    </div>
  );
}
