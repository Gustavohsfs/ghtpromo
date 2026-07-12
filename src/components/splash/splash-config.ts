/** Configuração da splash de abertura (ver skill ght-splash). */
export const SPLASH_CONFIG = {
  /** Desliga a splash por completo. */
  enabled: true,
  /** Mostra apenas uma vez por sessão do navegador. */
  oncePerSession: true,
  /** Chave usada no sessionStorage. */
  sessionKey: "ghtpromo:splash-seen",
  /** Duração de um ciclo do pulso (spec: ~2.5–4s). */
  pulseDurationMs: 3200,
  /** Quantos ciclos do pulso antes do fade-out (spec: 1–2). */
  cycles: 1,
  /** Duração da versão estática (prefers-reduced-motion). */
  staticDurationMs: 1600,
  /** Duração do fade-out de saída. */
  fadeOutMs: 600,
} as const;
