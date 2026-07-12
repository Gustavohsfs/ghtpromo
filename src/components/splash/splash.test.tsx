import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SPLASH_CONFIG } from "./splash-config";
import { Splash } from "./splash";

function getOverlay(container: HTMLElement) {
  return container.querySelector("[data-phase]");
}

/** Avança o requestAnimationFrame em que a splash decide sua fase. */
function settleInitialFrame() {
  act(() => {
    vi.advanceTimersByTime(20);
  });
}

describe("Splash", () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("aparece no primeiro load e marca a sessão como vista", () => {
    const { container } = render(<Splash />);
    settleInitialFrame();

    const overlay = getOverlay(container);
    expect(overlay).toBeInTheDocument();
    expect(overlay).toHaveAttribute("data-phase", "playing");
    expect(sessionStorage.getItem(SPLASH_CONFIG.sessionKey)).not.toBeNull();
  });

  it("não reaparece na mesma sessão", () => {
    sessionStorage.setItem(SPLASH_CONFIG.sessionKey, "1");
    const { container } = render(<Splash />);
    settleInitialFrame();
    expect(getOverlay(container)).not.toBeInTheDocument();
  });

  it("faz fade-out após os ciclos e desmonta", () => {
    const { container } = render(<Splash />);
    settleInitialFrame();

    act(() => {
      vi.advanceTimersByTime(SPLASH_CONFIG.pulseDurationMs * SPLASH_CONFIG.cycles);
    });
    expect(getOverlay(container)).toHaveAttribute("data-phase", "leaving");

    act(() => {
      vi.advanceTimersByTime(SPLASH_CONFIG.fadeOutMs);
    });
    expect(getOverlay(container)).not.toBeInTheDocument();
  });

  it("usa a versão estática com prefers-reduced-motion", () => {
    const matchMediaSpy = vi
      .spyOn(window, "matchMedia")
      .mockImplementation((query: string) => ({ matches: true, media: query }) as MediaQueryList);

    const { container } = render(<Splash />);
    settleInitialFrame();
    expect(getOverlay(container)).toHaveAttribute("data-phase", "static");

    matchMediaSpy.mockRestore();
  });
});
