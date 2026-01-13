/*
  Warnings:

  - Added the required column `storeId` to the `BarberWeeklyHour` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable: Add column as nullable first
ALTER TABLE "BarberWeeklyHour" ADD COLUMN "storeId" TEXT;

-- Set default storeId for existing records (using the first available store)
UPDATE "BarberWeeklyHour"
SET "storeId" = (SELECT id FROM "Store" LIMIT 1)
WHERE "storeId" IS NULL;

-- Make the column NOT NULL
ALTER TABLE "BarberWeeklyHour" ALTER COLUMN "storeId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "BarberWeeklyHour" ADD CONSTRAINT "BarberWeeklyHour_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
