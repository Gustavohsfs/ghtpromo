"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { AdminFormState } from "@/app/admin/actions";
import { requireSessionAdmin } from "@/server/admin-auth";
import { parseDealForm } from "@/server/deal-form";
import { getPrismaClient } from "@/server/prisma";

/**
 * CRUD de ofertas manuais (source: "manual"). Toda mutação revalida o site
 * inteiro — a vitrine SSG reflete a mudança na próxima visita, sem deploy.
 * Ofertas do feed Awin não são editáveis por aqui (o cron as sobrescreveria).
 */

function revalidateSite() {
  revalidatePath("/", "layout");
}

export async function createDealAction(
  _previous: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  await requireSessionAdmin();
  const parsed = parseDealForm(formData);
  if (!parsed.ok) return { error: parsed.error };
  const { data } = parsed;

  const prisma = getPrismaClient();
  const product = await prisma.product.create({
    data: {
      title: data.title,
      description: data.description,
      imageUrl: data.imageUrl,
      categorySlug: data.categorySlug,
    },
  });
  await prisma.deal.create({
    data: {
      productId: product.id,
      storeId: data.storeId,
      price: data.price,
      oldPrice: data.oldPrice,
      discountPct: data.discountPct,
      affiliateUrl: data.affiliateUrl,
      expiresAt: data.expiresAt,
      source: "manual",
    },
  });

  revalidateSite();
  redirect("/admin/ofertas");
}

export async function updateDealAction(
  _previous: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  await requireSessionAdmin();
  const dealId = String(formData.get("dealId") ?? "");
  const parsed = parseDealForm(formData);
  if (!parsed.ok) return { error: parsed.error };
  const { data } = parsed;

  const prisma = getPrismaClient();
  const deal = await prisma.deal.findUnique({ where: { id: dealId } });
  if (!deal || deal.source !== "manual") {
    return { error: "Oferta não encontrada ou não é manual." };
  }

  await prisma.product.update({
    where: { id: deal.productId },
    data: {
      title: data.title,
      description: data.description,
      imageUrl: data.imageUrl,
      categorySlug: data.categorySlug,
    },
  });
  await prisma.deal.update({
    where: { id: deal.id },
    data: {
      storeId: data.storeId,
      price: data.price,
      oldPrice: data.oldPrice,
      discountPct: data.discountPct,
      affiliateUrl: data.affiliateUrl,
      expiresAt: data.expiresAt,
    },
  });

  revalidateSite();
  redirect("/admin/ofertas");
}

export async function deleteDealAction(dealId: string): Promise<void> {
  await requireSessionAdmin();
  const prisma = getPrismaClient();
  const deal = await prisma.deal.findUnique({ where: { id: dealId } });
  if (!deal || deal.source !== "manual") return;

  await prisma.deal.delete({ where: { id: deal.id } });
  await prisma.product.deleteMany({
    where: { id: deal.productId, deals: { none: {} } },
  });
  revalidateSite();
}
