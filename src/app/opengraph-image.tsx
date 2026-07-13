import { ImageResponse } from "next/og";

import { OG_COLORS, OG_SIZE } from "@/lib/og";
import { SITE_NAME } from "@/lib/site";

export const alt = `${SITE_NAME} — as melhores ofertas num só lugar`;
export const size = OG_SIZE;
export const contentType = "image/png";

/** OG image raiz: logo ghtpromo sobre fundo escuro com linhas de energia. */
export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
        backgroundColor: OG_COLORS.background,
      }}
    >
      {/* linhas de energia nas bordas */}
      <div
        style={{
          position: "absolute",
          left: 64,
          top: 0,
          bottom: 0,
          width: 3,
          background: `linear-gradient(180deg, transparent, ${OG_COLORS.brand}, transparent)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          right: 64,
          top: 0,
          bottom: 0,
          width: 3,
          background: `linear-gradient(180deg, transparent, ${OG_COLORS.brand}, transparent)`,
        }}
      />

      <div style={{ display: "flex", fontSize: 110, fontWeight: 700 }}>
        <span style={{ color: OG_COLORS.foreground }}>ght</span>
        <span style={{ color: OG_COLORS.brand }}>promo</span>
      </div>
      <div style={{ display: "flex", fontSize: 34, color: OG_COLORS.muted }}>
        as melhores ofertas num só lugar
      </div>
    </div>,
    size,
  );
}
