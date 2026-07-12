const brlFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

/** Formata um preço em reais (sem centavos — vitrine usa valores cheios). */
export function formatBRL(value: number): string {
  return brlFormatter.format(value);
}
