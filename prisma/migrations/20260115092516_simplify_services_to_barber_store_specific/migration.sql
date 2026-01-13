/*
  Warnings:

  - You are about to drop the column `basePrice` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the `BarberService` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `barberId` to the `Service` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `Service` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storeId` to the `Service` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "BarberService" DROP CONSTRAINT "BarberService_barberId_fkey";

-- DropForeignKey
ALTER TABLE "BarberService" DROP CONSTRAINT "BarberService_serviceId_fkey";

-- DropForeignKey
ALTER TABLE "BarberService" DROP CONSTRAINT "BarberService_storeId_fkey";

-- AlterTable
ALTER TABLE "Service" DROP COLUMN "basePrice",
ADD COLUMN     "barberId" TEXT NOT NULL,
ADD COLUMN     "price" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "storeId" TEXT NOT NULL;

-- DropTable
DROP TABLE "BarberService";

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_barberId_fkey" FOREIGN KEY ("barberId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;
