import type { Metadata } from "next";

/**
 * Camada raiz do /admin: rota oculta — noindex/nofollow via metadata (sem
 * entrada no robots.txt de propósito, para não anunciar a rota) e sem a
 * shell pública da vitrine.
 */
export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-8">{children}</div>;
}
