import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

type ButtonVariant = "confirm" | "destructive" | "ghost" | "outline";
type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Semântica de cores do projeto: verde = confirmar, vermelho = negar. */
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const baseClasses =
  "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring " +
  "disabled:pointer-events-none disabled:opacity-50";

const variantClasses: Record<ButtonVariant, string> = {
  confirm:
    "bg-brand text-brand-foreground hover:bg-brand-strong " +
    "shadow-[0_0_16px_-4px_var(--color-brand-glow)]",
  destructive: "bg-destructive text-destructive-foreground hover:bg-destructive-strong",
  ghost: "text-foreground hover:bg-surface-raised hover:text-brand",
  outline: "border border-border text-foreground hover:border-brand hover:text-brand",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-6 text-base",
};

/** Botão base do design system. Ver skill ght-design-system. */
export function Button({
  variant = "confirm",
  size = "md",
  type = "button",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
      {...props}
    />
  );
}
