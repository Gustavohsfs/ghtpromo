"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

import { deleteReportAction, toggleReportStatusAction } from "./actions";

/** Ações da linha de report: resolver/reabrir e apagar (com confirmação). */
export function ReportRowActions({ reportId, status }: { reportId: string; status: string }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={status === "aberto" ? "confirm" : "outline"}
        size="sm"
        disabled={pending}
        onClick={() => startTransition(() => toggleReportStatusAction(reportId))}
      >
        {status === "aberto" ? "Marcar resolvido" : "Reabrir"}
      </Button>
      <Button
        variant="destructive"
        size="sm"
        disabled={pending}
        onClick={() => setConfirmDelete(true)}
      >
        Apagar
      </Button>

      <ConfirmDialog
        open={confirmDelete}
        title="Apagar report?"
        confirmLabel="Apagar"
        cancelLabel="Cancelar"
        onConfirm={() => {
          setConfirmDelete(false);
          startTransition(() => deleteReportAction(reportId));
        }}
        onCancel={() => setConfirmDelete(false)}
      >
        O report some do histórico e não dá para desfazer.
      </ConfirmDialog>
    </div>
  );
}
