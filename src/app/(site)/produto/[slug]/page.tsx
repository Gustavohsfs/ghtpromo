import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CalendarDays, TicketPercent, Wallet } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { getDealsRepository } from "@/data/repository";
import { DealLinkButton } from "@/features/deals/deal-link-button";
import { buildProductPath, extractDealId } from "@/features/deals/product-path";
import { ReportDialog } from "@/features/deals/report-dialog";
import { ShareButton } from "@/features/deals/share-button";
import { formatBRL } from "@/lib/format";
import { JsonLd, productJsonLd } from "@/lib/jsonld";
import { absoluteUrl } from "@/lib/site";

import { reportDealAction } from "./actions";

async function findDeal(slug: string) {
  const dealId = extractDealId(slug);
  if (!dealId) return null;
  return getDealsRepository().getDealById(dealId);
}

export async function generateMetadata(props: PageProps<"/produto/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const deal = await findDeal(slug);
  if (!deal) return {};
  const path = buildProductPath({ id: deal.id, title: deal.product.title });

  return {
    title: `${deal.product.title} por ${formatBRL(deal.price)}`,
    description:
      deal.product.description ??
      `${deal.product.title} em oferta na ${deal.store.name} por ${formatBRL(deal.price)}.`,
    alternates: { canonical: path },
    openGraph: {
      title: deal.product.title,
      description: deal.product.description ?? undefined,
      url: path,
      images: [{ url: deal.product.imageUrl }],
    },
  };
}

/** Página de detalhe da oferta — imagem à esquerda, dados e ações à direita. */
export default async function ProductPage(props: PageProps<"/produto/[slug]">) {
  const { slug } = await props.params;
  const deal = await findDeal(slug);
  if (!deal) notFound();
  const { product, store } = deal;

  const shareUrl = absoluteUrl(`/p/${deal.shortCode}`);
  const postedAt = deal.createdAt.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <article className="mx-auto flex max-w-5xl flex-col gap-8">
      <JsonLd data={{ "@context": "https://schema.org", ...productJsonLd(deal) }} />

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Imagem — contain sobre fundo branco: nunca corta o produto */}
        <div className="border-border relative aspect-square overflow-hidden rounded-xl border bg-white p-4">
          <Image
            src={product.imageUrl}
            alt={product.title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-contain p-4"
            priority
            unoptimized={deal.source === "manual"}
          />
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <Image
              src={store.iconUrl}
              alt={`Loja ${store.name}`}
              width={80}
              height={24}
              className="h-6 w-20 rounded-md"
            />
            <Link
              href={`/categorias/${product.categorySlug}`}
              className="text-muted-foreground hover:text-brand text-xs tracking-wide uppercase transition-colors"
            >
              {product.categorySlug}
            </Link>
          </div>

          <h1 className="text-2xl font-bold tracking-tight">{product.title}</h1>

          <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
            <CalendarDays className="size-3.5" aria-hidden />
            Postado em {postedAt}
          </p>

          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-brand text-4xl font-bold">{formatBRL(deal.price)}</span>
            {deal.oldPrice !== null && (
              <s className="text-muted-foreground text-lg">{formatBRL(deal.oldPrice)}</s>
            )}
            {deal.discountPct !== null && <Badge>-{deal.discountPct}%</Badge>}
          </div>

          {deal.paymentInfo && (
            <p className="text-foreground flex items-center gap-2 text-sm">
              <Wallet className="text-brand size-4" aria-hidden />
              {deal.paymentInfo}
            </p>
          )}

          {deal.couponCode && (
            <p className="border-brand/40 bg-brand-soft flex items-center gap-2 rounded-lg border border-dashed px-3 py-2 text-sm">
              <TicketPercent className="text-brand size-4" aria-hidden />
              Use o cupom <code className="text-brand font-bold">{deal.couponCode}</code>
            </p>
          )}

          <div className="max-w-xs">
            <DealLinkButton deal={deal} />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <ShareButton url={shareUrl} title={`${product.title} por ${formatBRL(deal.price)}`} />
            <ReportDialog dealId={deal.id} action={reportDealAction} />
          </div>

          <p className="text-muted-foreground border-border border-t pt-4 text-xs leading-relaxed">
            O GHT Promoções divulga ofertas de lojas oficiais. Preço e estoque podem divergir por
            atualizações da loja após a publicação; confirme sempre na página final antes de
            comprar.
          </p>
        </div>
      </div>

      {product.description && (
        <section aria-labelledby="sobre-produto" className="flex flex-col gap-3">
          <div className="energy-line" aria-hidden />
          <h2 id="sobre-produto" className="text-lg font-semibold">
            Sobre o produto
          </h2>
          <p className="text-muted-foreground max-w-3xl text-sm leading-relaxed">
            {product.description}
          </p>
        </section>
      )}
    </article>
  );
}
