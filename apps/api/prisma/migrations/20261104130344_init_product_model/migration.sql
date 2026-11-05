-- CreateTable
CREATE TABLE "Product" (
    "id" SERIAL NOT NULL,
    "payloadId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "isbn" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "imageUrl" TEXT,
    "categoryName" TEXT,
    "weight" DECIMAL(10,3),
    "width" INTEGER,
    "height" INTEGER,
    "description" JSONB,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "appliesTax" BOOLEAN NOT NULL DEFAULT false,
    "taxValue" DECIMAL(5,2),
    "appliesShipping" BOOLEAN NOT NULL DEFAULT false,
    "pages" INTEGER,
    "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isNew" BOOLEAN NOT NULL DEFAULT false,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "inventory" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_payloadId_key" ON "Product"("payloadId");

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- CreateIndex
CREATE INDEX "Product_status_idx" ON "Product"("status");

-- CreateIndex
CREATE INDEX "Product_isNew_idx" ON "Product"("isNew");

-- CreateIndex
CREATE INDEX "Product_createdAt_idx" ON "Product"("createdAt");
