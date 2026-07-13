import type { MetadataRoute } from "next";

import { getDealsRepository } from "@/data/repository";
import { absoluteUrl, SITE_URL } from "@/lib/site";

/** Sitemap: home + todas as categorias (cards apontam para fora do site). */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const categories = await getDealsRepository().getCategories();
  const lastModified = new Date();

  return [
    {
      url: SITE_URL,
      lastModified,
      changeFrequency: "daily",
      priority: 1,
    },
    ...categories.map((category) => ({
      url: absoluteUrl(`/categorias/${category.slug}`),
      lastModified,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
  ];
}
