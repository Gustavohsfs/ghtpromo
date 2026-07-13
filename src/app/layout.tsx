import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { Shell } from "@/components/layout/shell";
import { Splash } from "@/components/splash/splash";
import { getDealsRepository } from "@/data/repository";
import { buildCategoryNavItems } from "@/features/categories/nav";
import { DemoDataBadge } from "@/features/deals/demo-data-badge";
import { JsonLd, organizationJsonLd, webSiteJsonLd } from "@/lib/jsonld";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL, siteIndexable } from "@/lib/site";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — as melhores ofertas num só lugar`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: SITE_NAME,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
  },
  // Chave geral de indexação (ALLOW_INDEXING=false enquanto houver só mocks).
  robots: siteIndexable() ? undefined : { index: false, follow: false },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const categories = await getDealsRepository().getCategories();
  const navItems = buildCategoryNavItems(categories);

  return (
    <html lang="pt-BR" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      {/* suppressHydrationWarning: extensões de navegador injetam atributos
          no <body> antes da hidratação (ex.: bis_register), gerando falso
          aviso de mismatch. Suprime SÓ atributos deste elemento. */}
      <body className="flex min-h-full flex-col" suppressHydrationWarning>
        <JsonLd data={organizationJsonLd()} />
        <JsonLd data={webSiteJsonLd()} />
        <Splash />
        <Shell navItems={navItems}>{children}</Shell>
        <DemoDataBadge />
        {/* Web Vitals reais em produção (no-op em dev; requer projeto na Vercel) */}
        <SpeedInsights />
      </body>
    </html>
  );
}
