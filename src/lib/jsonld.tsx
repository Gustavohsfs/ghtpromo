import { buildProductPath } from "@/features/deals/product-path";
import type { Category, Deal } from "@/features/deals/types";

import { buildAffiliateUrl } from "./affiliate";
import { absoluteUrl, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "./site";

/**
 * Dados estruturados schema.org (ver skill ght-seo). Helpers retornam objetos
 * prontos para o componente <JsonLd />; um script por tipo, por página.
 */
type JsonLdObject = Record<string, unknown>;

export function organizationJsonLd(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
  };
}

/** WebSite com SearchAction apontando para a busca interna (/busca?q=). */
export function webSiteJsonLd(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    inLanguage: "pt-BR",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/busca?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/** Product + Offer de uma oferta (preço em BRL, link via buildAffiliateUrl). */
export function productJsonLd(deal: Deal): JsonLdObject {
  return {
    "@type": "Product",
    name: deal.product.title,
    ...(deal.product.description !== null && { description: deal.product.description }),
    image: absoluteUrl(deal.product.imageUrl),
    url: absoluteUrl(buildProductPath({ id: deal.id, title: deal.product.title })),
    offers: {
      "@type": "Offer",
      price: deal.price,
      priceCurrency: "BRL",
      availability: "https://schema.org/InStock",
      url: buildAffiliateUrl(deal),
      seller: {
        "@type": "Organization",
        name: deal.store.name,
      },
    },
  };
}

/** ItemList da página de categoria, com Product/Offer por posição. */
export function itemListJsonLd(category: Category, deals: Deal[]): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: category.name,
    numberOfItems: deals.length,
    itemListElement: deals.map((deal, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: productJsonLd(deal),
    })),
  };
}

/** Trilha Início → categoria. */
export function breadcrumbJsonLd(category: Category): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: category.name,
        item: absoluteUrl(`/categorias/${category.slug}`),
      },
    ],
  };
}

export interface JsonLdProps {
  data: JsonLdObject;
}

/** Emite um <script type="application/ld+json"> com o objeto serializado. */
export function JsonLd({ data }: JsonLdProps) {
  // JSON serializado localmente (sem input de usuário) — seguro para innerHTML.
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}
