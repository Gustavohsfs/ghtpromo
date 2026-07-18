import { getDealsRepository } from "@/data/repository";
import { buildProductPath } from "@/features/deals/product-path";
import { absoluteUrl } from "@/lib/site";
import { isBotUserAgent } from "@/lib/user-agent";

/**
 * Link curto de compartilhamento: /p/{code} → 302 para a página do produto.
 * 302 de propósito (301 seria cacheado pelo navegador e cliques repetidos
 * escapariam da contagem). Bots (preview do WhatsApp, crawlers) não contam.
 * Código inexistente ou oferta vencida caem na home. Fora do sitemap e com
 * /p/ em Disallow no robots — a URL canônica é a longa (/produto/...).
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> },
): Promise<Response> {
  const { code } = await params;
  const repository = getDealsRepository();
  const deal = await repository.getDealByShortCode(code);
  if (!deal) return Response.redirect(absoluteUrl("/"), 302);

  if (!isBotUserAgent(request.headers.get("user-agent"))) {
    await repository.registerShortLinkClick(code);
  }
  return Response.redirect(
    absoluteUrl(buildProductPath({ id: deal.id, title: deal.product.title })),
    302,
  );
}
