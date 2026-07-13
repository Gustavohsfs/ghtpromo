import Link from "next/link";

import { buttonClasses } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center gap-4 py-24 text-center">
      <p className="text-brand text-5xl font-bold">404</p>
      <h1 className="text-xl font-semibold">Página não encontrada</h1>
      <p className="text-muted-foreground max-w-sm text-sm">
        O endereço pode ter mudado ou a oferta saiu do ar. Volte para a vitrine e continue
        garimpando.
      </p>
      <Link href="/" className={buttonClasses("confirm", "md")}>
        Voltar ao início
      </Link>
    </div>
  );
}
