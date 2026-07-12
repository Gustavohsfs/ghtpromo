import { Badge } from "@/components/ui/badge";
import { isMockDataSource } from "@/data/repository";

/**
 * Selo discreto indicando que a vitrine roda sobre dados fictícios.
 * Some sozinho quando DATA_SOURCE deixar de ser mock — para removê-lo de vez,
 * basta tirar este componente do layout raiz.
 */
export function DemoDataBadge() {
  if (!isMockDataSource()) return null;

  return (
    <div className="fixed right-3 bottom-3 z-40">
      <Badge variant="neutral" className="border-border border opacity-80">
        dados de demonstração
      </Badge>
    </div>
  );
}
