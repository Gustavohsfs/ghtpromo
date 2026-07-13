"use client";

import { useState, type MouseEvent } from "react";
import { ExternalLink } from "lucide-react";

import { buttonClasses } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { AFFILIATE_LINK_REL, buildAffiliateUrl } from "@/lib/affiliate";

import type { Deal } from "./types";

export interface DealLinkButtonProps {
  deal: Deal;
}

/**
 * Botão "Ver oferta": âncora real (crawlers leem o href com rel="sponsored")
 * interceptada por uma confirmação de saída — verde continua, vermelho
 * cancela. Confirmando, a oferta abre em nova aba com noopener.
 */
export function DealLinkButton({ deal }: DealLinkButtonProps) {
  const [confirming, setConfirming] = useState(false);
  const url = buildAffiliateUrl(deal);

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    setConfirming(true);
  }

  function handleConfirm() {
    window.open(url, "_blank", "noopener");
    setConfirming(false);
  }

  return (
    <>
      <a
        href={url}
        target="_blank"
        rel={AFFILIATE_LINK_REL}
        onClick={handleClick}
        className={buttonClasses("confirm", "sm")}
      >
        Ver oferta
        <ExternalLink className="size-3.5" aria-hidden />
      </a>

      <ConfirmDialog
        open={confirming}
        title="Ir para a loja"
        confirmLabel="Continuar"
        cancelLabel="Cancelar"
        onConfirm={handleConfirm}
        onCancel={() => setConfirming(false)}
      >
        Você será levado(a) para a página da oferta na <strong>{deal.store.name}</strong>. Preços e
        disponibilidade podem mudar sem aviso.
      </ConfirmDialog>
    </>
  );
}
