import { requireOwnerAdmin } from "@/server/admin-auth";
import { getPrismaClient } from "@/server/prisma";

import { AdminRow } from "./admin-row";
import { CreateAdminForm } from "./create-admin-form";

/** Gestão de admins — EXCLUSIVA do owner (demais são redirecionados). */
export default async function AdminAdminsPage() {
  const owner = await requireOwnerAdmin();
  const admins = await getPrismaClient().admin.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, email: true, role: true, createdAt: true },
  });

  return (
    <section className="flex flex-col gap-8">
      <div>
        <h1 className="mb-1 text-xl font-semibold">Admins</h1>
        <p className="text-muted-foreground mb-4 text-sm">
          Gestão exclusiva do owner: cadastrar, redefinir senha e apagar admins.
        </p>
        <ul className="border-border divide-border bg-surface divide-y rounded-xl border">
          {admins.map((admin) => (
            <AdminRow
              key={admin.id}
              admin={{
                id: admin.id,
                email: admin.email,
                role: admin.role,
                createdAtLabel: admin.createdAt.toLocaleDateString("pt-BR"),
              }}
              isSelf={admin.id === owner.id}
            />
          ))}
        </ul>
      </div>

      <div className="max-w-sm">
        <h2 className="mb-4 text-lg font-semibold">Cadastrar novo admin</h2>
        <CreateAdminForm />
      </div>
    </section>
  );
}
