"use client";

import { useActionState } from "react";

import type { AdminFormState } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { InputField, SelectField } from "@/components/ui/field";

export interface CouponFormProps {
  action: (state: AdminFormState, formData: FormData) => Promise<AdminFormState>;
  submitLabel: string;
  stores: { value: string; label: string }[];
  defaults?: {
    couponId?: string;
    storeId?: string;
    code?: string;
    description?: string;
    affiliateUrl?: string;
    /** YYYY-MM-DD. */
    expiresAt?: string;
  };
}

/** Formulário de cupom (criar/editar) do painel admin. */
export function CouponForm({ action, submitLabel, stores, defaults }: CouponFormProps) {
  const [state, formAction, pending] = useActionState<AdminFormState, FormData>(action, {});

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-4">
      {defaults?.couponId && <input type="hidden" name="couponId" value={defaults.couponId} />}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <SelectField label="Loja" name="storeId" defaultValue={defaults?.storeId ?? ""} required>
          <option value="" disabled>
            Escolha a loja…
          </option>
          {stores.map((store) => (
            <option key={store.value} value={store.value}>
              {store.label}
            </option>
          ))}
        </SelectField>
        <InputField
          label="Código"
          name="code"
          placeholder="GHT10"
          defaultValue={defaults?.code}
          hint="Salvo em maiúsculas."
          required
        />
      </div>

      <InputField
        label="Benefício"
        name="description"
        placeholder="10% OFF em periféricos (máx. R$ 30)"
        defaultValue={defaults?.description}
        required
      />

      <InputField
        label="Link para usar o cupom"
        name="affiliateUrl"
        type="url"
        placeholder="https://…"
        defaultValue={defaults?.affiliateUrl}
        hint="Link de afiliado quando houver."
        required
      />

      <InputField
        label="Validade"
        name="expiresAt"
        type="date"
        defaultValue={defaults?.expiresAt}
        hint="Opcional — o cupom some da aba após esse dia."
      />

      {state.error && (
        <p role="alert" className="text-destructive text-sm">
          {state.error}
        </p>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? "Salvando…" : submitLabel}
      </Button>
    </form>
  );
}
