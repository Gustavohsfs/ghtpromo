import { ImageResponse } from "next/og";

import { getDealsRepository } from "@/data/repository";
import { OG_COLORS, OG_SIZE } from "@/lib/og";
import { SITE_NAME } from "@/lib/site";

export const alt = `Categoria em promoção no ${SITE_NAME}`;
export const size = OG_SIZE;
export const contentType = "image/png";

interface OgImageProps {
  params: Promise<{ slug: string }>;
}

/** OG image por categoria: nome em destaque com a identidade do site. */
export default async function OpenGraphImage({ params }: OgImageProps) {
  const { slug } = await params;
  const category = await getDealsRepository().getCategoryBySlug(slug);
  const title = category?.name ?? "Promoções";

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 28,
        backgroundColor: OG_COLORS.background,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 100,
          height: 3,
          background: `linear-gradient(90deg, transparent, ${OG_COLORS.brand}, transparent)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 100,
          height: 3,
          background: `linear-gradient(90deg, transparent, ${OG_COLORS.brand}, transparent)`,
        }}
      />

      <div style={{ display: "flex", fontSize: 40, fontWeight: 700 }}>
        <span style={{ color: OG_COLORS.foreground }}>ght</span>
        <span style={{ color: OG_COLORS.brand }}>promo</span>
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 96,
          fontWeight: 700,
          color: OG_COLORS.foreground,
          textAlign: "center",
        }}
      >
        {title}
      </div>
      <div style={{ display: "flex", fontSize: 32, color: OG_COLORS.muted }}>
        em promoção nas lojas oficiais
      </div>
    </div>,
    size,
  );
}
