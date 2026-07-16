"use client";

import { useActionState, useState, useTransition } from "react";

import {
  deleteAdminAction,
  resetAdminPasswordAction,
  type AdminFormState,
} from "@/app/admin/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { InputField } from "@/components/ui/field";

export interface AdminRowProps {
  admin: { id: string; email: string; role: string; createdAtLabel: string };
  /** O owner logado não pode se apagar. */
  isSelf: boolean;
}

/** Linha da lista de admins com redefinir senha e apagar (só owner vê). */
export function AdminRow({ admin, isSelf }: AdminRowProps) {
  const [resetOpen, setResetOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, startDelete] = useTransition();
  const [state, formAction, pending] = useActionState<AdminFormState, FormData>(
    resetAdminPasswordAction,
    {},
  );

  return (
    <li className="flex flex-col gap-3 px-4 py-3 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="flex items-center gap-2">
          {admin.email}
          {admin.role === "owner" && <Badge>owner</Badge>}
          {isSelf && <span className="text-muted-foreground text-xs">(você)</span>}
        </span>
        <span className="flex items-center gap-2">
          <span className="text-muted-foreground text-xs">desde {admin.createdAtLabel}</span>
          <Button variant="outline" size="sm" onClick={() => setResetOpen((value) => !value)}>
            Redefinir senha
          </Button>
          {!isSelf && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setConfirmDelete(true)}
              disabled={deleting}
            >
              {deleting ? "Apagando…" : "Apagar"}
            </Button>
          )}
        </span>
      </div>

      {resetOpen && (
        <form action={formAction} className="flex max-w-md items-end gap-2">
          <input type="hidden" name="adminId" value={admin.id} />
          <div className="flex-1">
            <InputField
              label={`Nova senha para ${admin.email}`}
              name="password"
              type="password"
              autoComplete="new-password"
              required
            />
          </div>
          <Button type="submit" size="sm" disabled={pending}>
            {pending ? "Salvando…" : "Salvar"}
          </Button>
        </form>
      )}
      {resetOpen && state.error && (
        <p role="alert" className="text-destructive text-xs">
          {state.error}
        </p>
      )}
      {resetOpen && state.success && (
        <p role="status" className="text-brand text-xs">
          {state.success}
        </p>
      )}

      <ConfirmDialog
        open={confirmDelete}
        title="Apagar admin?"
        confirmLabel="Apagar admin"
        cancelLabel="Cancelar"
        onConfirm={() => {
          setConfirmDelete(false);
          startDelete(() => deleteAdminAction(admin.id));
        }}
        onCancel={() => setConfirmDelete(false)}
      >
        {admin.email} perde o acesso ao painel imediatamente.
      </ConfirmDialog>
    </li>
  );
}
