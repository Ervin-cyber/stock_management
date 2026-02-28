/*
  Warnings:

  - Made the column `location` on table `Warehouse` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Warehouse" ALTER COLUMN "location" SET NOT NULL;
