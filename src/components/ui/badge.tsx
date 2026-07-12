import type { HTMLAttributes } from "react";

import { cn } from "@/lib/cn";

type BadgeVariant = "brand" | "neutral" | "outline";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  brand: "bg-brand-soft text-brand",
  neutral: "bg-surface-raised text-muted-foreground",
  outline: "border border-border text-muted-foreground",
};

/** Selo pequeno (ex.: % de desconto, "dados de demonstração"). */
export function Badge({ variant = "brand", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}
