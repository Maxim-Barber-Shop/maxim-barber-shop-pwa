import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixMigration() {
  try {
    console.log('🔧 Fixing migration state...\n');

    // Check which constraints exist
    const constraints = await prisma.$queryRaw`
      SELECT constraint_name
      FROM information_schema.table_constraints
      WHERE table_name = 'BarberService'
      AND constraint_type = 'FOREIGN KEY'
    `;

    console.log('Existing constraints on BarberService:', constraints);

    // Drop constraints that exist
    for (const constraint of constraints as any[]) {
      console.log(`Dropping constraint: ${constraint.constraint_name}`);
      await prisma.$executeRawUnsafe(`ALTER TABLE "BarberService" DROP CONSTRAINT "${constraint.constraint_name}"`);
    }

    // Drop the table
    console.log('Dropping BarberService table...');
    await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "BarberService"`);

    // Alter Service table
    console.log('Altering Service table...');
    await prisma.$executeRawUnsafe(`ALTER TABLE "Service" DROP COLUMN IF EXISTS "basePrice"`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "Service" ADD COLUMN IF NOT EXISTS "barberId" TEXT`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "Service" ADD COLUMN IF NOT EXISTS "price" DOUBLE PRECISION`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "Service" ADD COLUMN IF NOT EXISTS "storeId" TEXT`);

    // Add foreign keys
    console.log('Adding foreign keys...');
    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints
          WHERE constraint_name = 'Service_barberId_fkey'
        ) THEN
          ALTER TABLE "Service" ADD CONSTRAINT "Service_barberId_fkey"
          FOREIGN KEY ("barberId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;
      END $$;
    `);

    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints
          WHERE constraint_name = 'Service_storeId_fkey'
        ) THEN
          ALTER TABLE "Service" ADD CONSTRAINT "Service_storeId_fkey"
          FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;
      END $$;
    `);

    console.log('\n✅ Migration fixed!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixMigration();
