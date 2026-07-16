"use client";

import { useActionState, useState } from "react";

import { Flag } from "lucide-react";

import type { ReportFormState } from "@/app/(site)/produto/[slug]/actions";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

import { REPORT_DETAILS_MAX_LENGTH, REPORT_REASONS } from "./report-reasons";

export interface ReportDialogProps {
  dealId: string;
  action: (state: ReportFormState, formData: FormData) => Promise<ReportFormState>;
}

/**
 * "Reportar oferta": modal com motivos fechados + detalhes opcionais. O
 * envio grava um Report para avaliação do time (tela /admin/reports).
 */
export function ReportDialog({ dealId, action }: ReportDialogProps) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<ReportFormState, FormData>(action, {});

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Flag className="size-4" aria-hidden />
        Reportar
      </Button>

      <Modal open={open} onClose={() => setOpen(false)} title="Reportar esta oferta">
        {state.success ? (
          <div className="flex flex-col gap-4">
            <p role="status" className="text-brand text-sm">
              {state.success}
            </p>
            <div className="flex justify-end">
              <Button size="sm" onClick={() => setOpen(false)}>
                Fechar
              </Button>
            </div>
          </div>
        ) : (
          <form action={formAction} className="flex flex-col gap-4">
            <input type="hidden" name="dealId" value={dealId} />
            <fieldset className="flex flex-col gap-2">
              <legend className="text-muted-foreground mb-2 text-sm">
                O que está errado com esta oferta?
              </legend>
              {REPORT_REASONS.map((reason) => (
                <label key={reason.id} className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="reason"
                    value={reason.id}
                    required
                    className="accent-brand size-3.5"
                  />
                  {reason.label}
                </label>
              ))}
            </fieldset>
            <label className="flex flex-col gap-1.5 text-sm font-medium">
              Detalhes (opcional)
              <textarea
                name="details"
                maxLength={REPORT_DETAILS_MAX_LENGTH}
                rows={3}
                placeholder="Conte o que você viu…"
                className="border-border bg-surface placeholder:text-muted-foreground w-full rounded-md border px-3 py-2 text-sm font-normal"
              />
            </label>
            {state.error && (
              <p role="alert" className="text-destructive text-sm">
                {state.error}
              </p>
            )}
            <div className="flex justify-end gap-3">
              <Button variant="destructive" size="sm" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" size="sm" disabled={pending}>
                {pending ? "Enviando…" : "Enviar report"}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}
