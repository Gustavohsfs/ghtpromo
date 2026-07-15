"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { InputField } from "@/components/ui/field";

import { changePasswordAction, type AdminFormState } from "../../actions";

export function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState<AdminFormState, FormData>(
    changePasswordAction,
    {},
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <InputField
        label="Senha atual"
        name="current"
        type="password"
        autoComplete="current-password"
        required
      />
      <InputField
        label="Nova senha"
        name="next"
        type="password"
        autoComplete="new-password"
        hint="Mínimo de 8 caracteres."
        required
      />
      <InputField
        label="Confirmar nova senha"
        name="confirm"
        type="password"
        autoComplete="new-password"
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
        {pending ? "Salvando…" : "Alterar senha"}
      </Button>
    </form>
  );
}
