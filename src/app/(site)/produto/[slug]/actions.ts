"use server";

import { REPORT_DETAILS_MAX_LENGTH, REPORT_REASONS } from "@/features/deals/report-reasons";
import { getPrismaClient } from "@/server/prisma";

export interface ReportFormState {
  error?: string;
  success?: string;
}

/**
 * Report público de oferta (sem login): valida motivo na lista fechada,
 * limita o texto livre e confere se a oferta existe antes de gravar.
 * Avaliação fica na tela /admin/reports.
 */
export async function reportDealAction(
  _previous: ReportFormState,
  formData: FormData,
): Promise<ReportFormState> {
  const dealId = String(formData.get("dealId") ?? "");
  const reason = String(formData.get("reason") ?? "");
  const details = String(formData.get("details") ?? "").trim();

  if (!REPORT_REASONS.some((candidate) => candidate.id === reason)) {
    return { error: "Escolha um motivo." };
  }
  if (details.length > REPORT_DETAILS_MAX_LENGTH) {
    return { error: `Detalhes muito longos (máx. ${REPORT_DETAILS_MAX_LENGTH} caracteres).` };
  }

  const prisma = getPrismaClient();
  const deal = await prisma.deal.findUnique({ where: { id: dealId }, select: { id: true } });
  if (!deal) return { error: "Oferta não encontrada." };

  await prisma.report.create({
    data: { dealId: deal.id, reason, details: details || null },
  });
  return { success: "Recebido! Nosso time vai avaliar a oferta. Obrigado por avisar. 💚" };
}
