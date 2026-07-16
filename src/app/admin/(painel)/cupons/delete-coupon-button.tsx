"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

import { deleteCouponAction } from "./actions";

/** Apagar cupom com confirmação (verde confirma, vermelho cancela). */
export function DeleteCouponButton({
  couponId,
  couponCode,
}: {
  couponId: string;
  couponCode: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <>
      <Button variant="destructive" size="sm" onClick={() => setOpen(true)} disabled={pending}>
        {pending ? "Apagando…" : "Apagar"}
      </Button>
      <ConfirmDialog
        open={open}
        title="Apagar cupom?"
        confirmLabel="Apagar cupom"
        cancelLabel="Cancelar"
        onConfirm={() => {
          setOpen(false);
          startTransition(() => deleteCouponAction(couponId));
        }}
        onCancel={() => setOpen(false)}
      >
        O cupom “{couponCode}” sai da aba pública na hora.
      </ConfirmDialog>
    </>
  );
}
