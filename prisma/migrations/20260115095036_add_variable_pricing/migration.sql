-- AlterTable Service: rename price to basePrice
ALTER TABLE "Service" RENAME COLUMN "price" TO "basePrice";

-- AlterTable BarberService: Add new columns
-- First, add storeId with a temporary default (we'll populate it properly)
ALTER TABLE "BarberService" ADD COLUMN "storeId" TEXT;
ALTER TABLE "BarberService" ADD COLUMN "price" DOUBLE PRECISION;

-- Populate storeId for existing BarberService records
-- We'll use the first store for each barber's existing services
UPDATE "BarberService" bs
SET "storeId" = (
  SELECT bwh."storeId"
  FROM "BarberWeeklyHour" bwh
  WHERE bwh."barberId" = bs."barberId"
  LIMIT 1
);

-- For any BarberService that still doesn't have a storeId (barbers without weekly hours),
-- use the first available store
UPDATE "BarberService"
SET "storeId" = (SELECT id FROM "Store" LIMIT 1)
WHERE "storeId" IS NULL;

-- Now make storeId NOT NULL
ALTER TABLE "BarberService" ALTER COLUMN "storeId" SET NOT NULL;

-- Drop the old primary key constraint
ALTER TABLE "BarberService" DROP CONSTRAINT "BarberService_pkey";

-- Add the new composite primary key
ALTER TABLE "BarberService" ADD CONSTRAINT "BarberService_pkey" PRIMARY KEY ("barberId", "serviceId", "storeId");

-- Add foreign key constraint for Store
ALTER TABLE "BarberService" ADD CONSTRAINT "BarberService_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Update existing foreign keys to add CASCADE
ALTER TABLE "BarberService" DROP CONSTRAINT "BarberService_barberId_fkey";
ALTER TABLE "BarberService" DROP CONSTRAINT "BarberService_serviceId_fkey";

ALTER TABLE "BarberService" ADD CONSTRAINT "BarberService_barberId_fkey" FOREIGN KEY ("barberId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BarberService" ADD CONSTRAINT "BarberService_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;
