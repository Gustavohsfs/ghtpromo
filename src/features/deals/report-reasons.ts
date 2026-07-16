/** Motivos de report de oferta — compartilhados entre o modal público,
 *  a Server Action que valida e a tela /admin/reports. */
export const REPORT_REASONS = [
  { id: "preco-incorreto", label: "Preço incorreto" },
  { id: "oferta-inexistente", label: "Oferta inexistente / link quebrado" },
  { id: "problema-produto", label: "Problema com o produto" },
  { id: "outro", label: "Outro" },
] as const;

export type ReportReasonId = (typeof REPORT_REASONS)[number]["id"];

export function reportReasonLabel(id: string): string {
  return REPORT_REASONS.find((reason) => reason.id === id)?.label ?? id;
}

/** Tamanho máximo do texto livre de detalhes. */
export const REPORT_DETAILS_MAX_LENGTH = 500;
