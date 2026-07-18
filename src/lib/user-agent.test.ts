import { describe, expect, it } from "vitest";

import { isBotUserAgent } from "./user-agent";

describe("isBotUserAgent", () => {
  it.each([
    ["WhatsApp preview", "WhatsApp/2.23.20.0"],
    ["Googlebot", "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"],
    ["Facebook", "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)"],
    ["Telegram", "TelegramBot (like TwitterBot)"],
    ["Bing", "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)"],
  ])("identifica %s como bot", (_name, userAgent) => {
    expect(isBotUserAgent(userAgent)).toBe(true);
  });

  it.each([
    [
      "Chrome desktop",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
    ],
    [
      "Safari iPhone",
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
    ],
  ])("não marca navegador real (%s)", (_name, userAgent) => {
    expect(isBotUserAgent(userAgent)).toBe(false);
  });

  it("trata ausência de user-agent como bot (navegador sempre envia)", () => {
    expect(isBotUserAgent(null)).toBe(true);
  });
});
