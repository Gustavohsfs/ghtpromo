import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatBRL } from "@/lib/format";

import { DealLinkButton } from "./deal-link-button";
import type { Deal } from "./types";

export interface ProductCardProps {
  deal: Deal;
  /**
   * Nível do heading do título, conforme a hierarquia da página:
   * h3 sob seções com h2 (home), h2 quando o card está direto sob o h1
   * (categoria/busca).
   */
  titleAs?: "h2" | "h3";
}

/**
 * Card de produto no formato e-commerce (ver skill ght-product-card):
 * imagem, título, preço em destaque + antigo riscado + selo de desconto,
 * ícone circular da loja e botão "Ver oferta" via buildAffiliateUrl().
 */
export function ProductCard({ deal, titleAs: TitleTag = "h3" }: ProductCardProps) {
  const { product, store } = deal;

  return (
    <Card glowOnHover className="flex flex-col overflow-hidden">
      <div className="border-border relative aspect-square border-b">
        <Image
          src={product.imageUrl}
          alt={product.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover"
        />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <TitleTag className="line-clamp-2 min-h-10 text-sm font-medium" title={product.title}>
          {product.title}
        </TitleTag>

        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="text-foreground text-lg font-bold">{formatBRL(deal.price)}</span>
          <s className="text-muted-foreground text-xs">{formatBRL(deal.oldPrice)}</s>
          <Badge>-{deal.discountPct}%</Badge>
        </div>

        <div className="mt-auto flex items-center justify-between gap-2">
          <span className="flex items-center" title={`Oferta na ${store.name}`}>
            <Image
              src={store.iconUrl}
              alt=""
              width={28}
              height={28}
              className="border-border rounded-full border"
            />
            <span className="sr-only">Oferta na {store.name}</span>
          </span>
          <DealLinkButton deal={deal} />
        </div>
      </div>
    </Card>
  );
}
