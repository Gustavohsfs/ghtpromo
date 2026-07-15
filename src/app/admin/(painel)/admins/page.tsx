import { requireSessionAdmin } from "@/server/admin-auth";
import { getPrismaClient } from "@/server/prisma";

import { CreateAdminForm } from "./create-admin-form";

export default async function AdminAdminsPage() {
  await requireSessionAdmin();
  const admins = await getPrismaClient().admin.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, email: true, createdAt: true },
  });

  return (
    <section className="flex flex-col gap-8">
      <div>
        <h1 className="mb-4 text-xl font-semibold">Admins</h1>
        <ul className="border-border divide-border bg-surface divide-y rounded-xl border">
          {admins.map((admin) => (
            <li key={admin.id} className="flex items-center justify-between px-4 py-3 text-sm">
              <span>{admin.email}</span>
              <span className="text-muted-foreground text-xs">
                desde {admin.createdAt.toLocaleDateString("pt-BR")}
              </span>
            </li>
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
