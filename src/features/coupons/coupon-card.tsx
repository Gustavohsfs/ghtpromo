"use client";

import { useState } from "react";

import Image from "next/image";
import { Check, Copy, ExternalLink, Info } from "lucide-react";

import { Button, buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { AFFILIATE_LINK_REL } from "@/lib/affiliate";

import type { Coupon } from "./types";

/**
 * Card de cupom: selo da loja, benefício, código tracejado com copiar em um
 * toque e link para a loja. Clicar no card (ou em "como usar") abre o modal
 * com a descrição de uso + código + botão para as promoções.
 */
export function CouponCard({ coupon }: { coupon: Coupon }) {
  const [copied, setCopied] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(coupon.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      window.prompt("Copie o código:", coupon.code);
    }
  }

  const codeBlock = (
    <button
      type="button"
      onClick={copyCode}
      aria-label={`Copiar código ${coupon.code}`}
      className="border-brand/50 bg-brand-soft hover:border-brand group flex w-full items-center justify-between rounded-lg border border-dashed px-4 py-2.5 transition-colors"
    >
      <code className="text-brand text-base font-bold tracking-widest">{coupon.code}</code>
      {copied ? (
        <span className="text-brand flex items-center gap-1 text-xs">
          <Check className="size-4" aria-hidden /> copiado!
        </span>
      ) : (
        <span className="text-muted-foreground group-hover:text-brand flex items-center gap-1 text-xs transition-colors">
          <Copy className="size-4" aria-hidden /> copiar
        </span>
      )}
    </button>
  );

  return (
    <Card glowOnHover className="flex flex-col gap-4 p-5">
      <div className="flex items-center justify-between gap-3">
        <Image
          src={coupon.store.iconUrl}
          alt={`Loja ${coupon.store.name}`}
          width={80}
          height={24}
          className="h-6 w-20 rounded-md"
        />
        {coupon.expiresAt && (
          <span className="text-muted-foreground text-xs">
            até {coupon.expiresAt.toLocaleDateString("pt-BR")}
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={() => setDetailsOpen(true)}
        className="hover:text-brand flex min-h-10 items-start gap-2 text-left text-sm font-medium transition-colors"
      >
        <span className="flex-1">{coupon.description}</span>
        <Info className="text-muted-foreground mt-0.5 size-4 shrink-0" aria-hidden />
        <span className="sr-only">— ver como usar</span>
      </button>

      {codeBlock}

      <a
        href={coupon.affiliateUrl}
        target="_blank"
        rel={AFFILIATE_LINK_REL}
        className={buttonClasses("confirm", "sm", "w-full")}
      >
        Usar na {coupon.store.name}
        <ExternalLink className="size-3.5" aria-hidden />
      </a>

      <Modal open={detailsOpen} onClose={() => setDetailsOpen(false)} title={coupon.description}>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <Image
              src={coupon.store.iconUrl}
              alt={`Loja ${coupon.store.name}`}
              width={80}
              height={24}
              className="h-6 w-20 rounded-md"
            />
            {coupon.expiresAt && (
              <span className="text-muted-foreground text-xs">
                válido até {coupon.expiresAt.toLocaleDateString("pt-BR")}
              </span>
            )}
          </div>

          <div>
            <h3 className="mb-1 text-sm font-semibold">Como usar</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {coupon.usageInfo ??
                `Copie o código e cole no campo de cupom do carrinho da ${coupon.store.name} antes de fechar o pedido.`}
            </p>
          </div>

          {codeBlock}

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button variant="ghost" size="sm" onClick={() => setDetailsOpen(false)}>
              Fechar
            </Button>
            <a
              href={coupon.affiliateUrl}
              target="_blank"
              rel={AFFILIATE_LINK_REL}
              className={buttonClasses("confirm", "sm")}
            >
              Ir para as promoções
              <ExternalLink className="size-3.5" aria-hidden />
            </a>
          </div>
        </div>
      </Modal>
    </Card>
  );
}
