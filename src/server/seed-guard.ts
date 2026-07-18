/**
 * Guarda do seed de demonstração. Em 2026-07-18 o seed rodou contra o banco
 * de produção e reinseriu 35 ofertas fictícias na vitrine — esta função
 * existe para isso nunca se repetir: banco com oferta real (feed ou manual)
 * bloqueia o seed, a menos que se passe --force conscientemente.
 */
export function seedBlockReason(
  counts: { awin: number; manual: number },
  force: boolean,
): string | null {
  if (force) return null;
  const real = counts.awin + counts.manual;
  if (real === 0) return null;
  return (
    `banco tem ${real} oferta(s) reais (awin: ${counts.awin}, manual: ${counts.manual}) — ` +
    "parece produção. Seed demo abortado; use --force apenas se tiver certeza."
  );
}
