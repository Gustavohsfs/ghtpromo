import { Card } from "@/components/ui/card";

/**
 * Home placeholder da Fase 2 — a home real (seções por categoria alimentadas
 * pelo DealsRepository) chega na Fase 5. Ver docs/PLAN.md.
 */
export default function Home() {
  return (
    <section className="mx-auto flex max-w-3xl flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight">
        As melhores promoções, <span className="text-brand">num só lugar</span>
      </h1>
      <p className="text-muted-foreground text-sm">
        Vitrine de ofertas de lojas oficiais organizada por categorias. Navegue pelo menu ao lado —
        o catálogo chega nas próximas fases.
      </p>
      <Card glowOnHover className="p-6">
        <p className="text-muted-foreground text-sm">
          🚧 Em construção: home dinâmica em seções por categoria.
        </p>
      </Card>
    </section>
  );
}
