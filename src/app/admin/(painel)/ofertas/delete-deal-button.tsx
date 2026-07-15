"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

import { deleteDealAction } from "./actions";

/** Apagar oferta manual com confirmação (verde confirma, vermelho cancela). */
export function DeleteDealButton({ dealId, dealTitle }: { dealId: string; dealTitle: string }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <>
      <Button variant="destructive" size="sm" onClick={() => setOpen(true)} disabled={pending}>
        {pending ? "Apagando…" : "Apagar"}
      </Button>
      <ConfirmDialog
        open={open}
        title="Apagar oferta?"
        confirmLabel="Apagar oferta"
        cancelLabel="Cancelar"
        onConfirm={() => {
          setOpen(false);
          startTransition(() => deleteDealAction(dealId));
        }}
        onCancel={() => setOpen(false)}
      >
        “{dealTitle}” sai do site na hora e não dá para desfazer.
      </ConfirmDialog>
    </>
  );
}
