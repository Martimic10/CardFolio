-- AlterTable
ALTER TABLE "Card" ADD COLUMN     "brand" TEXT;

-- CreateIndex
CREATE INDEX "Card_brand_idx" ON "Card"("brand");
