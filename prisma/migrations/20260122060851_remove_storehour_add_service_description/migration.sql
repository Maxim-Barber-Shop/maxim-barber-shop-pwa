/*
  Warnings:

  - You are about to drop the `StoreHour` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "StoreHour" DROP CONSTRAINT "StoreHour_storeId_fkey";

-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "description" TEXT;

-- DropTable
DROP TABLE "StoreHour";
