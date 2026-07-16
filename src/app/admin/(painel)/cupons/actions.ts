"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { AdminFormState } from "@/app/admin/actions";
import { requireSessionAdmin } from "@/server/admin-auth";
import { parseCouponForm } from "@/server/coupon-form";
import { getPrismaClient } from "@/server/prisma";

/** CRUD de cupons (/admin/cupons); mutações revalidam a aba /cupons. */

export async function createCouponAction(
  _previous: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  await requireSessionAdmin();
  const parsed = parseCouponForm(formData);
  if (!parsed.ok) return { error: parsed.error };

  await getPrismaClient().coupon.create({ data: parsed.data });
  revalidatePath("/cupons");
  revalidatePath("/cupons/[loja]", "page");
  redirect("/admin/cupons");
}

export async function updateCouponAction(
  _previous: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  await requireSessionAdmin();
  const couponId = String(formData.get("couponId") ?? "");
  const parsed = parseCouponForm(formData);
  if (!parsed.ok) return { error: parsed.error };

  const prisma = getPrismaClient();
  if (!(await prisma.coupon.findUnique({ where: { id: couponId } }))) {
    return { error: "Cupom não encontrado." };
  }
  await prisma.coupon.update({ where: { id: couponId }, data: parsed.data });
  revalidatePath("/cupons");
  revalidatePath("/cupons/[loja]", "page");
  redirect("/admin/cupons");
}

export async function deleteCouponAction(couponId: string): Promise<void> {
  await requireSessionAdmin();
  await getPrismaClient()
    .coupon.delete({ where: { id: couponId } })
    .catch(() => undefined);
  revalidatePath("/cupons");
  revalidatePath("/cupons/[loja]", "page");
  revalidatePath("/admin/cupons");
}
