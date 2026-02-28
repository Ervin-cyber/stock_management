-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "StockMovement" ADD COLUMN     "description" TEXT,
ADD COLUMN     "reference" TEXT;
