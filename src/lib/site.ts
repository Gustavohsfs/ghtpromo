/** Identidade e URLs do site — fonte única para SEO (ver skill ght-seo). */

export const SITE_NAME = "GHT Promoções";

export const SITE_DESCRIPTION =
  "Vitrine de promoções e ofertas de lojas oficiais — eletrônicos, geladeiras, " +
  "TVs, computadores e iPhones — organizadas por categoria.";

/**
 * URL canônica do site. Em produção vem de NEXT_PUBLIC_SITE_URL (Vercel);
 * o fallback é o domínio oficial.
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ghtpromo.com.br";

/** Monta uma URL absoluta a partir de um caminho do site. */
export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}

/**
 * Crawlers de IA explicitamente PERMITIDOS no robots (descoberta por IAs é
 * objetivo do produto). Para bloqueá-los, defina ALLOW_AI_CRAWLERS=false.
 */
export const AI_CRAWLERS = ["GPTBot", "ClaudeBot", "PerplexityBot", "Google-Extended"] as const;

export function aiCrawlersAllowed(): boolean {
  return process.env.ALLOW_AI_CRAWLERS !== "false";
}

/**
 * Chave geral de indexação. Com ALLOW_INDEXING=false o site inteiro vira
 * noindex/nofollow (meta robots) e o robots.txt bloqueia todos os crawlers —
 * útil enquanto a vitrine roda com dados de demonstração. Default: indexável.
 */
export function siteIndexable(): boolean {
  return process.env.ALLOW_INDEXING !== "false";
}
