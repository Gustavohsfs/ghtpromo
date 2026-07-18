import { formatBRL } from "@/lib/format";

/** Dados serializáveis de uma oferta para montar a mensagem do WhatsApp. */
export interface WhatsAppDealInfo {
  title: string;
  /** URL absoluta da página de detalhe no NOSSO site (preview OG gera a imagem). */
  url: string;
  price: number;
  oldPrice: number | null;
  discountPct: number | null;
  paymentInfo: string | null;
  couponCode: string | null;
  description: string | null;
}

const DESCRIPTION_MAX_LENGTH = 200;

/**
 * Convite do grupo GHT Promo no WhatsApp. O link vale até um admin do grupo
 * redefini-lo ("Redefinir link" no app) — se isso acontecer, atualize aqui.
 */
export const GROUP_INVITE_URL = "https://chat.whatsapp.com/K3ycGhZGQmrEG9Qal52yNo";

function truncate(text: string): string {
  if (text.length <= DESCRIPTION_MAX_LENGTH) return text;
  return `${text.slice(0, DESCRIPTION_MAX_LENGTH).trimEnd()}…`;
}

/**
 * Mensagem de promoção para grupo do WhatsApp (formatação `*negrito*` e
 * `~riscado~`). Linhas sem dado são omitidas; a mensagem opcional entra antes
 * do convite fixo do grupo, que fecha toda mensagem.
 */
export function buildWhatsAppMessage(deal: WhatsAppDealInfo, customMessage = ""): string {
  const priceLines: string[] = [];
  if (deal.oldPrice) priceLines.push(`~De ${formatBRL(deal.oldPrice)}~`);
  const discount = deal.discountPct ? ` (${deal.discountPct}% OFF)` : "";
  priceLines.push(`💰 *Por ${formatBRL(deal.price)}*${discount}`);
  if (deal.paymentInfo) priceLines.push(`💳 ${deal.paymentInfo}`);
  if (deal.couponCode) priceLines.push(`🎟️ Cupom: *${deal.couponCode}*`);

  const blocks = [`🔥 *${deal.title}*`, priceLines.join("\n")];
  if (deal.description) blocks.push(truncate(deal.description));
  blocks.push(`👉 ${deal.url}`);
  const custom = customMessage.trim();
  if (custom) blocks.push(custom);
  blocks.push(`👥 Convide a família e os amigos para o grupo: ${GROUP_INVITE_URL}`);

  return blocks.join("\n\n");
}
