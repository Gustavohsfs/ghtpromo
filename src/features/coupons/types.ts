import type { Store } from "@/features/deals/types";

/** Cupom de desconto exibido na aba /cupons. */
export interface Coupon {
  id: string;
  store: Store;
  /** Código que o usuário copia (ex.: "GHT10"). */
  code: string;
  /** Benefício em uma linha (ex.: "10% OFF em periféricos"). */
  description: string;
  /** Link (afiliado quando houver) para usar o cupom na loja. */
  affiliateUrl: string;
  /** Como e para que o cupom serve (modal "como usar"); null omite. */
  usageInfo: string | null;
  /** Nulo = sem validade. */
  expiresAt: Date | null;
  isMock: boolean;
}
