-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "imageUrl" TEXT;
ALTER TABLE "Category" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Category" ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Category" ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "Category_active_idx" ON "Category"("active");
CREATE INDEX "Category_featured_idx" ON "Category"("featured");
CREATE INDEX "Category_order_idx" ON "Category"("order");
