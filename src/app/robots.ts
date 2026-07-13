import type { MetadataRoute } from "next";

import { absoluteUrl, AI_CRAWLERS, aiCrawlersAllowed } from "@/lib/site";

/**
 * Robots: site 100% público e indexável. Crawlers de IA (GPTBot, ClaudeBot,
 * PerplexityBot, Google-Extended) são PERMITIDOS por padrão — descoberta por
 * IAs é objetivo do produto. Para bloqueá-los: ALLOW_AI_CRAWLERS=false.
 */
export default function robots(): MetadataRoute.Robots {
  const aiRules = AI_CRAWLERS.map((userAgent) => ({
    userAgent,
    [aiCrawlersAllowed() ? "allow" : "disallow"]: "/",
  }));

  return {
    rules: [{ userAgent: "*", allow: "/", disallow: "/busca" }, ...aiRules],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
