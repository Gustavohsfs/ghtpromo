/**
 * EXEMPLO de mapeamento de links de afiliado reais (deal.id -> URL).
 *
 * Quando os links chegarem:
 * 1. Copie este arquivo para `data/private/affiliates.ts` (o diretório é
 *    GITIGNORADO — só *.example.ts é commitado).
 * 2. Preencha as URLs reais com sua tag de afiliado.
 * 3. Ligue a leitura em `src/lib/affiliate.ts` (buildAffiliateUrl) — é o
 *    único ponto do app que monta link de oferta.
 *
 * Segredos NUNCA vão para o Git. Alternativa: variáveis de ambiente por loja.
 */
export const AFFILIATE_URLS: Record<string, string> = {
  "echo-dot-5": "https://www.amazon.com.br/dp/B0XXXXXXX?tag=SUATAG-20",
  "samsung-crystal-55": "https://www.magazinevoce.com.br/SUALOJA/p/XXXXXXX",
};
