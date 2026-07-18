-- Colunas do link curto: código estável + contador de cliques.
ALTER TABLE "deals" ADD COLUMN "click_count" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "deals" ADD COLUMN "short_code" TEXT;

-- Backfill das ofertas existentes: código determinístico derivado do id
-- (md5 truncado — alfanumérico hex, único entre poucos milhares de linhas).
UPDATE "deals" SET "short_code" = substr(md5("id"), 1, 7);

ALTER TABLE "deals" ALTER COLUMN "short_code" SET NOT NULL;
CREATE UNIQUE INDEX "deals_short_code_key" ON "deals"("short_code");
