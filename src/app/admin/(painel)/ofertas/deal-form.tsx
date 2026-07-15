"use client";

import { useActionState, useState } from "react";

import type { AdminFormState } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { InputField, SelectField, TextareaField } from "@/components/ui/field";

export interface DealFormOption {
  value: string;
  label: string;
}

export interface DealFormDefaults {
  dealId?: string;
  title?: string;
  description?: string;
  storeId?: string;
  categorySlug?: string;
  price?: string;
  oldPrice?: string;
  affiliateUrl?: string;
  imageUrl?: string;
  /** YYYY-MM-DD (formato do <input type="date">). */
  expiresAt?: string;
}

export interface DealFormProps {
  action: (state: AdminFormState, formData: FormData) => Promise<AdminFormState>;
  submitLabel: string;
  stores: DealFormOption[];
  categories: DealFormOption[];
  defaults?: DealFormDefaults;
}

/** Aceita "1.234,56" e "1234.56" — espelho leve do parse do servidor. */
function toNumber(raw: string): number | null {
  const normalized = raw.includes(",") ? raw.replaceAll(".", "").replace(",", ".") : raw;
  const value = Number(normalized);
  return Number.isFinite(value) && value > 0 ? value : null;
}

/**
 * Formulário de oferta manual (criar/editar). O botão "Buscar dados do link"
 * usa a rota interna de preview OG (mesmo mecanismo do WhatsApp) para
 * pré-preencher título, descrição e imagem a partir do link de afiliado.
 */
export function DealForm({ action, submitLabel, stores, categories, defaults }: DealFormProps) {
  const [state, formAction, pending] = useActionState<AdminFormState, FormData>(action, {});
  const [affiliateUrl, setAffiliateUrl] = useState(defaults?.affiliateUrl ?? "");
  const [title, setTitle] = useState(defaults?.title ?? "");
  const [description, setDescription] = useState(defaults?.description ?? "");
  const [imageUrl, setImageUrl] = useState(defaults?.imageUrl ?? "");
  const [price, setPrice] = useState(defaults?.price ?? "");
  const [oldPrice, setOldPrice] = useState(defaults?.oldPrice ?? "");
  const [preview, setPreview] = useState<{ loading: boolean; error: string | null }>({
    loading: false,
    error: null,
  });

  const priceValue = toNumber(price);
  const oldPriceValue = toNumber(oldPrice);
  const discountPct =
    priceValue !== null && oldPriceValue !== null && oldPriceValue > priceValue
      ? Math.round((1 - priceValue / oldPriceValue) * 100)
      : null;

  async function fetchPreview() {
    setPreview({ loading: true, error: null });
    try {
      const response = await fetch("/api/admin/og-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: affiliateUrl }),
      });
      const data = (await response.json()) as {
        title?: string | null;
        description?: string | null;
        imageUrl?: string | null;
        error?: string;
      };
      if (!response.ok) throw new Error(data.error ?? "falha no preview");
      if (data.title && !title) setTitle(data.title);
      if (data.description && !description) setDescription(data.description);
      if (data.imageUrl) setImageUrl(data.imageUrl);
      if (!data.imageUrl) {
        setPreview({
          loading: false,
          error: "A página não expõe imagem (og:image) — cole a URL da imagem manualmente.",
        });
        return;
      }
      setPreview({ loading: false, error: null });
    } catch (error) {
      setPreview({
        loading: false,
        error: `Não deu para ler o link (${error instanceof Error ? error.message : "erro"}). Preencha manualmente.`,
      });
    }
  }

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-4">
      {defaults?.dealId && <input type="hidden" name="dealId" value={defaults.dealId} />}

      <div className="flex items-end gap-2">
        <div className="flex-1">
          <InputField
            label="Link de afiliado"
            name="affiliateUrl"
            type="url"
            placeholder="https://…"
            value={affiliateUrl}
            onChange={(event) => setAffiliateUrl(event.target.value)}
            required
          />
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={fetchPreview}
          disabled={!affiliateUrl || preview.loading}
        >
          {preview.loading ? "Buscando…" : "Buscar dados do link"}
        </Button>
      </div>
      {preview.error && <p className="text-muted-foreground text-xs">{preview.error}</p>}

      <InputField
        label="Título"
        name="title"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        required
      />
      <TextareaField
        label="Descrição"
        name="description"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
      />

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
        <SelectField
          label="Categoria"
          name="categorySlug"
          defaultValue={defaults?.categorySlug ?? ""}
          required
        >
          <option value="" disabled>
            Escolha a categoria…
          </option>
          {categories.map((category) => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </SelectField>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <InputField
          label="Preço atual (R$)"
          name="price"
          inputMode="decimal"
          placeholder="249,90"
          value={price}
          onChange={(event) => setPrice(event.target.value)}
          required
        />
        <InputField
          label="Preço antigo (R$)"
          name="oldPrice"
          inputMode="decimal"
          placeholder="399,90"
          hint="Opcional — vira o riscado."
          value={oldPrice}
          onChange={(event) => setOldPrice(event.target.value)}
        />
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Desconto</span>
          <output className="border-border bg-surface text-brand flex h-[38px] items-center rounded-md border px-3 text-sm font-semibold">
            {discountPct !== null ? `-${discountPct}%` : "—"}
          </output>
          <p className="text-muted-foreground text-xs">Calculado automaticamente.</p>
        </div>
      </div>

      <InputField
        label="Validade da oferta"
        name="expiresAt"
        type="date"
        defaultValue={defaults?.expiresAt}
        hint="Opcional — a oferta some do site após esse dia."
      />

      <InputField
        label="URL da imagem"
        name="imageUrl"
        type="url"
        placeholder="https://…"
        value={imageUrl}
        onChange={(event) => setImageUrl(event.target.value)}
        required
      />
      {imageUrl && (
        // Preview simples; hotlink de domínio arbitrário não passa pelo next/image.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt="Preview da imagem do produto"
          className="border-border h-40 w-40 rounded-lg border object-cover"
        />
      )}

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
