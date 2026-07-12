"use client";

import { useEffect, useState, type CSSProperties } from "react";

import { EnergyLines } from "./energy-lines";
import { SPLASH_CONFIG } from "./splash-config";
import styles from "./splash.module.css";

type Phase = "pending" | "playing" | "static" | "leaving" | "done";

/**
 * Splash de abertura: 1x por sessão (sessionStorage), com fade-out ao fim.
 * Com prefers-reduced-motion mostra a composição estática, sem pulso.
 * Renderizada no SSR (fase "pending") para não piscar conteúdo antes dela.
 */
export function Splash() {
  const [phase, setPhase] = useState<Phase>(SPLASH_CONFIG.enabled ? "pending" : "done");

  // Decide após a hidratação (no próximo frame, para o pulso iniciar alinhado
  // ao paint): já viu nesta sessão? reduced motion?
  useEffect(() => {
    if (!SPLASH_CONFIG.enabled) return;
    const frame = requestAnimationFrame(() => {
      try {
        if (SPLASH_CONFIG.oncePerSession && sessionStorage.getItem(SPLASH_CONFIG.sessionKey)) {
          setPhase("done");
          return;
        }
        sessionStorage.setItem(SPLASH_CONFIG.sessionKey, String(Date.now()));
      } catch {
        // sessionStorage indisponível (ex.: cookies bloqueados): mostra mesmo assim.
      }
      const reducedMotion =
        window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
      setPhase(reducedMotion ? "static" : "playing");
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  // Agenda o fade-out ao fim dos ciclos (ou da exibição estática).
  useEffect(() => {
    if (phase !== "playing" && phase !== "static") return;
    const visibleMs =
      phase === "playing"
        ? SPLASH_CONFIG.pulseDurationMs * SPLASH_CONFIG.cycles
        : SPLASH_CONFIG.staticDurationMs;
    const timer = setTimeout(() => setPhase("leaving"), visibleMs);
    return () => clearTimeout(timer);
  }, [phase]);

  // Desmonta após o fade-out.
  useEffect(() => {
    if (phase !== "leaving") return;
    const timer = setTimeout(() => setPhase("done"), SPLASH_CONFIG.fadeOutMs);
    return () => clearTimeout(timer);
  }, [phase]);

  if (phase === "done") return null;

  const durations = {
    "--splash-pulse-duration": `${SPLASH_CONFIG.pulseDurationMs}ms`,
    "--splash-cycles": SPLASH_CONFIG.cycles,
    "--splash-fade": `${SPLASH_CONFIG.fadeOutMs}ms`,
  } as CSSProperties;

  return (
    <div className={styles.overlay} data-phase={phase} style={durations} aria-hidden>
      <EnergyLines />
    </div>
  );
}
