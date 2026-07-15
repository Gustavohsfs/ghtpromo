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
          // Oferta manual = imagem hotlink de domínio arbitrário; pular o
          // otimizador evita liberar remotePatterns para a internet toda.
          unoptimized={deal.source === "manual"}
        />
        {/* Selo da loja de destino (wordmark) — canto superior esquerdo */}
        <span
          className="absolute top-2 left-2 inline-flex overflow-hidden rounded-lg shadow-md"
          title={`Oferta na ${store.name}`}
        >
          <Image src={store.iconUrl} alt="" width={80} height={24} className="h-6 w-20" />
          <span className="sr-only">Oferta na {store.name}</span>
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <TitleTag className="line-clamp-2 min-h-10 text-sm font-medium" title={product.title}>
          {product.title}
        </TitleTag>

        {product.description !== null && (
          <p className="text-muted-foreground line-clamp-2 text-xs">{product.description}</p>
        )}

        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="text-foreground text-lg font-bold">{formatBRL(deal.price)}</span>
          {deal.oldPrice !== null && (
            <s className="text-muted-foreground text-xs">{formatBRL(deal.oldPrice)}</s>
          )}
          {deal.discountPct !== null && <Badge>-{deal.discountPct}%</Badge>}
        </div>

        <div className="mt-auto">
          <DealLinkButton deal={deal} />
        </div>
      </div>
    </Card>
  );
}
