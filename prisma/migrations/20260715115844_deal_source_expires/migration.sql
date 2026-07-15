-- AlterTable
ALTER TABLE "deals" ADD COLUMN     "expires_at" TIMESTAMP(3),
ADD COLUMN     "source" TEXT NOT NULL DEFAULT 'awin';

-- CreateIndex
CREATE INDEX "deals_source_idx" ON "deals"("source");
