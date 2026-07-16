/** Validação do formulário de cupom do admin (pura, testável). */

export interface ParsedCouponForm {
  storeId: string;
  code: string;
  description: string;
  affiliateUrl: string;
  expiresAt: Date | null;
}

export type CouponFormResult = { ok: true; data: ParsedCouponForm } | { ok: false; error: string };

const CODE_MAX_LENGTH = 30;

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function parseCouponForm(formData: FormData): CouponFormResult {
  const text = (name: string) => String(formData.get(name) ?? "").trim();

  const storeId = text("storeId");
  if (!storeId) return { ok: false, error: "Escolha a loja." };

  const code = text("code").toUpperCase();
  if (!code) return { ok: false, error: "Informe o código do cupom." };
  if (code.length > CODE_MAX_LENGTH) {
    return { ok: false, error: `Código muito longo (máx. ${CODE_MAX_LENGTH} caracteres).` };
  }

  const description = text("description");
  if (!description) return { ok: false, error: "Descreva o benefício do cupom." };

  const affiliateUrl = text("affiliateUrl");
  if (!isHttpUrl(affiliateUrl)) {
    return { ok: false, error: "Link inválido (precisa ser http/https)." };
  }

  const expiresAtRaw = text("expiresAt");
  let expiresAt: Date | null = null;
  if (expiresAtRaw) {
    // Fim do dia no horário de Brasília — <input type="date"> envia YYYY-MM-DD.
    expiresAt = new Date(`${expiresAtRaw}T23:59:59-03:00`);
    if (Number.isNaN(expiresAt.getTime())) return { ok: false, error: "Validade inválida." };
  }

  return { ok: true, data: { storeId, code, description, affiliateUrl, expiresAt } };
}
