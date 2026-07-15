import { ChangePasswordForm } from "./change-password-form";

export default function AdminSenhaPage() {
  return (
    <section className="max-w-sm">
      <h1 className="mb-4 text-xl font-semibold">Trocar senha</h1>
      <ChangePasswordForm />
    </section>
  );
}
