import type { HTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Realce verde sutil ao passar o mouse (motivo "energia"). */
  glowOnHover?: boolean;
}

/** Superfície elevada padrão para agrupar conteúdo. */
export function Card({ glowOnHover = false, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "border-border bg-surface rounded-lg border",
        glowOnHover &&
          "hover:border-brand/40 transition-[border-color,box-shadow] " +
            "hover:shadow-[0_0_24px_-8px_var(--color-brand-glow)]",
        className,
      )}
      {...props}
    />
  );
}
