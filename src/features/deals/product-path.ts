/**
 * URL da página de detalhe: `/produto/<slug-do-título>--<dealId>`. O slug é
 * só cosmético/SEO — o lookup usa apenas o dealId após o separador `--`
 * (ids nunca contêm dois hífens seguidos: cuid é alfanumérico e os do feed
 * são `deal-kabum-<n>`).
 */

const SEPARATOR = "--";
const MAX_SLUG_LENGTH = 80;

function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, MAX_SLUG_LENGTH)
    .replace(/-+$/, "");
}

export function buildProductPath(deal: { id: string; title: string }): string {
  return `/produto/${slugify(deal.title)}${SEPARATOR}${deal.id}`;
}

/** dealId do segmento de URL; null quando o formato não confere. */
export function extractDealId(slug: string): string | null {
  const index = slug.lastIndexOf(SEPARATOR);
  if (index <= 0) return null;
  const id = slug.slice(index + SEPARATOR.length);
  return id || null;
}
