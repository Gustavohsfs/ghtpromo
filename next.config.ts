import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Os placeholders de demonstração são SVGs locais (public/products|stores).
    // CSP restritiva + sandbox neutralizam o risco de SVG via otimizador.
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
