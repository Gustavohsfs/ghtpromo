"use client";

import { useState } from "react";

import Image from "next/image";
import { Check, Copy, ExternalLink } from "lucide-react";

import { buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AFFILIATE_LINK_REL } from "@/lib/affiliate";

import type { Coupon } from "./types";

/**
 * Card de cupom: selo da loja, benefício, código em destaque tracejado com
 * copiar em um toque e link para usar na loja (rel de afiliado).
 */
export function CouponCard({ coupon }: { coupon: Coupon }) {
  const [copied, setCopied] = useState(false);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(coupon.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      window.prompt("Copie o código:", coupon.code);
    }
  }

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

      <h2 className="min-h-10 text-sm font-medium">{coupon.description}</h2>

      <button
        type="button"
        onClick={copyCode}
        aria-label={`Copiar código ${coupon.code}`}
        className="border-brand/50 bg-brand-soft hover:border-brand group flex items-center justify-between rounded-lg border border-dashed px-4 py-2.5 transition-colors"
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

      <a
        href={coupon.affiliateUrl}
        target="_blank"
        rel={AFFILIATE_LINK_REL}
        className={buttonClasses("confirm", "sm", "w-full")}
      >
        Usar na {coupon.store.name}
        <ExternalLink className="size-3.5" aria-hidden />
      </a>
    </Card>
  );
}
