/**
 * Validação do formulário de oferta manual do painel admin. Puro (testável):
 * FormData → dados prontos para o banco ou mensagem de erro em pt-BR.
 */

export interface ParsedDealForm {
  title: string;
  description: string | null;
  storeId: string;
  categorySlug: string;
  price: number;
  oldPrice: number | null;
  /** Derivado de price/oldPrice — nunca digitado à mão. */
  discountPct: number | null;
  affiliateUrl: string;
  imageUrl: string;
  expiresAt: Date | null;
}

export type DealFormResult = { ok: true; data: ParsedDealForm } | { ok: false; error: string };

/** Aceita "1.234,56" (BR) e "1234.56" (US). Inválido → null. */
function parsePrice(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const normalized = trimmed.includes(",")
    ? trimmed.replaceAll(".", "").replace(",", ".")
    : trimmed;
  const value = Number(normalized);
  return Number.isFinite(value) && value > 0 ? Math.round(value * 100) / 100 : null;
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function parseDealForm(formData: FormData): DealFormResult {
  const text = (name: string) => String(formData.get(name) ?? "").trim();

  const title = text("title");
  if (!title) return { ok: false, error: "Informe o título do produto." };

  const storeId = text("storeId");
  if (!storeId) return { ok: false, error: "Escolha a loja." };

  const categorySlug = text("categorySlug");
  if (!categorySlug) return { ok: false, error: "Escolha a categoria." };

  const price = parsePrice(text("price"));
  if (price === null) return { ok: false, error: "Preço atual inválido." };

  const oldPriceRaw = text("oldPrice");
  let oldPrice: number | null = null;
  if (oldPriceRaw) {
    oldPrice = parsePrice(oldPriceRaw);
    if (oldPrice === null) return { ok: false, error: "Preço antigo inválido." };
    if (oldPrice <= price) {
      return { ok: false, error: "O preço antigo precisa ser maior que o atual." };
    }
  }

  const affiliateUrl = text("affiliateUrl");
  if (!isHttpUrl(affiliateUrl)) {
    return { ok: false, error: "Link de afiliado inválido (precisa ser http/https)." };
  }

  const imageUrl = text("imageUrl");
  if (!isHttpUrl(imageUrl)) {
    return {
      ok: false,
      error: "URL da imagem inválida (use o preview ou cole um link http/https).",
    };
  }

  const expiresAtRaw = text("expiresAt");
  let expiresAt: Date | null = null;
  if (expiresAtRaw) {
    // Fim do dia no horário de Brasília — <input type="date"> envia YYYY-MM-DD.
    expiresAt = new Date(`${expiresAtRaw}T23:59:59-03:00`);
    if (Number.isNaN(expiresAt.getTime())) return { ok: false, error: "Validade inválida." };
  }

  return {
    ok: true,
    data: {
      title,
      description: text("description") || null,
      storeId,
      categorySlug,
      price,
      oldPrice,
      discountPct: oldPrice === null ? null : Math.round((1 - price / oldPrice) * 100),
      affiliateUrl,
      imageUrl,
      expiresAt,
    },
  };
}
