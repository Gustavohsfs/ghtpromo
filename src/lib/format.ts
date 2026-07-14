const brlFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

/** Formata um preço em reais com centavos (padrão e-commerce). */
export function formatBRL(value: number): string {
  return brlFormatter.format(value);
}
