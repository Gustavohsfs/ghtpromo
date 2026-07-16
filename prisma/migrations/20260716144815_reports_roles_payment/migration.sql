-- AlterTable
ALTER TABLE "admins" ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'admin';

-- AlterTable
ALTER TABLE "deals" ADD COLUMN     "coupon_code" TEXT,
ADD COLUMN     "payment_info" TEXT;

-- CreateTable
CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "deal_id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "details" TEXT,
    "status" TEXT NOT NULL DEFAULT 'aberto',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "reports_status_idx" ON "reports"("status");

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "deals"("id") ON DELETE CASCADE ON UPDATE CASCADE;
