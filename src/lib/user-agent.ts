/**
 * Padrões de crawlers/prévias que não devem contar clique no link curto:
 * preview do WhatsApp/Telegram/Slack/Discord, crawlers de busca e afins.
 */
const BOT_PATTERN =
  /bot|crawl|spider|preview|scan|whatsapp|facebookexternalhit|telegram|slack|discord|twitter|linkedin|pinterest/i;

/** true quando o user-agent é de bot — ausência de UA também conta como bot. */
export function isBotUserAgent(userAgent: string | null): boolean {
  if (!userAgent) return true;
  return BOT_PATTERN.test(userAgent);
}
