import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { Shell } from "@/components/layout/shell";
import { Splash } from "@/components/splash/splash";
import { getDealsRepository } from "@/data/repository";
import { buildCategoryNavItems } from "@/features/categories/nav";
import { DemoDataBadge } from "@/features/deals/demo-data-badge";

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
  title: "GHT Promoções",
  description: "Vitrine de promoções e ofertas de lojas oficiais, organizadas por categoria.",
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
      <body className="flex min-h-full flex-col">
        <Splash />
        <Shell navItems={navItems}>{children}</Shell>
        <DemoDataBadge />
      </body>
    </html>
  );
}
