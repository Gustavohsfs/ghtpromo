import Link from "next/link";

import { cn } from "@/lib/cn";

export interface LogoProps {
  className?: string;
}

/** Logotipo textual: "ght" claro + "promo" em verde de energia. */
export function Logo({ className }: LogoProps) {
  return (
    <Link
      href="/"
      className={cn(
        "text-lg font-bold tracking-tight",
        "focus-visible:outline-ring focus-visible:outline-2 focus-visible:outline-offset-2",
        className,
      )}
    >
      <span className="text-foreground">ght</span>
      <span className="text-brand">promo</span>
    </Link>
  );
}
