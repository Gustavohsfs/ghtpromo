import type { Deal } from "@/features/deals/types";

/**
 * Atributo rel obrigatório em todo link de oferta: `sponsored` (link de
 * afiliado, correto para SEO) + `noopener` (segurança em nova aba).
 */
export const AFFILIATE_LINK_REL = "sponsored noopener";

/**
 * Ponto ÚNICO de montagem do link de oferta — todo botão "Ver oferta" passa
 * por aqui. Hoje devolve a URL fictícia do mock; quando os links reais
 * chegarem, a troca acontece SÓ neste arquivo:
 *
 * TODO(links reais): ler o mapeamento de data/private/affiliates.ts
 * (gitignorado — ver data/private/affiliates.example.ts) e/ou compor a URL
 * com a tag de afiliado por loja vinda de env.
 */
export function buildAffiliateUrl(deal: Deal): string {
  return deal.affiliateUrl;
}
