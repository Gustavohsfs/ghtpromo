import { Shell } from "@/components/layout/shell";
import { Splash } from "@/components/splash/splash";
import { getDealsRepository } from "@/data/repository";
import { buildCategoryNavItems } from "@/features/categories/nav";
import { DemoDataBadge } from "@/features/deals/demo-data-badge";
import { JsonLd, organizationJsonLd, webSiteJsonLd } from "@/lib/jsonld";

/** Shell pública da vitrine (sidebar de categorias, header, splash, JSON-LD). */
export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const repository = getDealsRepository();
  const [categories, stores] = await Promise.all([
    repository.getCategories(),
    repository.getStores(),
  ]);
  const navItems = buildCategoryNavItems(categories);

  return (
    <>
      <JsonLd data={organizationJsonLd()} />
      <JsonLd data={webSiteJsonLd()} />
      <Splash />
      <Shell
        navItems={navItems}
        stores={stores.map((store) => ({ id: store.id, name: store.name }))}
      >
        {children}
      </Shell>
      <DemoDataBadge />
    </>
  );
}
