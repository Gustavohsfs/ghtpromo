"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { InputField } from "@/components/ui/field";

import { loginAction, type AdminFormState } from "./actions";

export function LoginForm() {
  const [state, formAction, pending] = useActionState<AdminFormState, FormData>(loginAction, {});

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <InputField
        label="E-mail"
        name="email"
        type="email"
        autoComplete="username"
        required
        autoFocus
      />
      <InputField
        label="Senha"
        name="password"
        type="password"
        autoComplete="current-password"
        required
      />
      {state.error && (
        <p role="alert" className="text-destructive text-sm">
          {state.error}
        </p>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? "Entrando…" : "Entrar"}
      </Button>
    </form>
  );
}
