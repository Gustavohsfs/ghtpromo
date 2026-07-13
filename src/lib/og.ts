/**
 * Paleta e dimensões das OG images (ImageResponse/Satori não lê CSS vars).
 * ESPELHO dos tokens de src/app/globals.css — manter em sincronia.
 */
export const OG_SIZE = { width: 1200, height: 630 };

export const OG_COLORS = {
  background: "#05080A",
  surface: "#0A0F0D",
  border: "#1A2620",
  foreground: "#E8F5EE",
  muted: "#93A89D",
  brand: "#2EE88A",
} as const;
