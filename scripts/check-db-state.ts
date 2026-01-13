import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDbState() {
  try {
    // Check if BarberService table exists
    const result = await prisma.$queryRaw`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name = 'BarberService'
    `;

    console.log('BarberService table exists:', result);

    // Check Service table structure
    const serviceColumns = await prisma.$queryRaw`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'Service'
      ORDER BY ordinal_position
    `;

    console.log('\nService table columns:', serviceColumns);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDbState();
