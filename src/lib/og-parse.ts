import { htmlToPlainText } from "@/lib/html-text";

/**
 * Extrai metadados Open Graph de um HTML (mesmo mecanismo do preview do
 * WhatsApp): og:title/og:description/og:image, com fallback para
 * twitter:image e <title>. Parse leve por regex — suficiente para <meta>.
 */

export interface OpenGraphData {
  title: string | null;
  description: string | null;
  imageUrl: string | null;
}

/** Valor de <meta property|name="..." content="...">, em qualquer ordem. */
function metaContent(html: string, property: string): string | null {
  const patterns = [
    new RegExp(`<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${property}["']`, "i"),
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return htmlToPlainText(match[1]);
  }
  return null;
}

function isHttpUrl(value: string | null): value is string {
  return value !== null && /^https?:\/\//i.test(value);
}

export function parseOpenGraph(html: string): OpenGraphData {
  const image = metaContent(html, "og:image") ?? metaContent(html, "twitter:image");
  const titleTag = html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1] ?? "";

  return {
    title: metaContent(html, "og:title") ?? htmlToPlainText(titleTag),
    description: metaContent(html, "og:description") ?? metaContent(html, "description"),
    imageUrl: isHttpUrl(image) ? image : null,
  };
}
