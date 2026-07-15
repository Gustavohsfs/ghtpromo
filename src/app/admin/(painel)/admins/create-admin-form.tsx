"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { InputField } from "@/components/ui/field";

import { createAdminAction, type AdminFormState } from "../../actions";

export function CreateAdminForm() {
  const [state, formAction, pending] = useActionState<AdminFormState, FormData>(
    createAdminAction,
    {},
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <InputField label="E-mail" name="email" type="email" autoComplete="off" required />
      <InputField
        label="Senha inicial"
        name="password"
        type="password"
        autoComplete="new-password"
        hint="Mínimo de 8 caracteres — peça para trocar no primeiro acesso."
        required
      />
      {state.error && (
        <p role="alert" className="text-destructive text-sm">
          {state.error}
        </p>
      )}
      {state.success && (
        <p role="status" className="text-brand text-sm">
          {state.success}
        </p>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? "Cadastrando…" : "Cadastrar admin"}
      </Button>
    </form>
  );
}
