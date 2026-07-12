import styles from "./splash.module.css";

/**
 * Geometria da abertura (ver skill ght-splash), num viewBox 400×600:
 * duas linhas espelhadas sobem verticais das bordas inferiores, dobram
 * ~40° para dentro numa curva arredondada, tangenciam o círculo central
 * (logotipo "ghtpromo") e voltam a subir verticalmente acima dele.
 *
 * `pathLength={100}` normaliza o comprimento para a animação do pulso
 * (stroke-dasharray/dashoffset em % — ver splash.module.css).
 */
const LEFT_PATH = "M 62 600 V 488 Q 62 462 78 442 L 128 378 Q 140 362 140 340 V 96";
const RIGHT_PATH = "M 338 600 V 488 Q 338 462 322 442 L 272 378 Q 260 362 260 340 V 96";

export function EnergyLines() {
  return (
    <svg viewBox="0 0 400 600" className={styles.svg} aria-hidden focusable="false">
      {/* Trilhos: traço verde tênue permanente */}
      <path d={LEFT_PATH} className={styles.trail} pathLength={100} />
      <path d={RIGHT_PATH} className={styles.trail} pathLength={100} />

      {/* Pulsos: segmento luminoso que sobe simultâneo nas duas linhas */}
      <path d={LEFT_PATH} className={styles.pulse} pathLength={100} />
      <path d={RIGHT_PATH} className={styles.pulse} pathLength={100} />

      {/* Círculo central com o logotipo; ganha glow quando o pulso chega */}
      <circle cx={200} cy={300} r={60} className={styles.circle} />
      <text x={200} y={300} textAnchor="middle" dominantBaseline="central" className={styles.logo}>
        <tspan className={styles.logoGht}>ght</tspan>
        <tspan className={styles.logoPromo}>promo</tspan>
      </text>
    </svg>
  );
}
