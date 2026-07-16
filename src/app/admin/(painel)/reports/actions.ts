"use server";

import { revalidatePath } from "next/cache";

import { requireSessionAdmin } from "@/server/admin-auth";
import { getPrismaClient } from "@/server/prisma";

/** Alterna um report entre aberto e resolvido. */
export async function toggleReportStatusAction(reportId: string): Promise<void> {
  await requireSessionAdmin();
  const prisma = getPrismaClient();
  const report = await prisma.report.findUnique({ where: { id: reportId } });
  if (!report) return;
  await prisma.report.update({
    where: { id: reportId },
    data: { status: report.status === "aberto" ? "resolvido" : "aberto" },
  });
  revalidatePath("/admin/reports");
}

export async function deleteReportAction(reportId: string): Promise<void> {
  await requireSessionAdmin();
  await getPrismaClient()
    .report.delete({ where: { id: reportId } })
    .catch(() => undefined);
  revalidatePath("/admin/reports");
}
