-- AlterTable
ALTER TABLE "User" ADD COLUMN     "verificationToken" TEXT,
ALTER COLUMN "active" SET DEFAULT false;

-- CreateIndex
CREATE INDEX "StockMovement_productId_idx" ON "StockMovement"("productId");

-- CreateIndex
CREATE INDEX "StockMovement_movementType_idx" ON "StockMovement"("movementType");

-- CreateIndex
CREATE INDEX "StockMovement_sourceWarehouseId_idx" ON "StockMovement"("sourceWarehouseId");

-- CreateIndex
CREATE INDEX "StockMovement_destinationWarehouseId_idx" ON "StockMovement"("destinationWarehouseId");

-- CreateIndex
CREATE INDEX "StockMovement_createdAt_idx" ON "StockMovement"("createdAt");
