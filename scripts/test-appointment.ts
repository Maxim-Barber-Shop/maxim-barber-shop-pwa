import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const id = 'a1c7dbd8-8b8d-4612-bc04-416f9f733695';

  console.log(`Checking appointment with ID: ${id}`);

  const appointment = await prisma.appointment.findUnique({
    where: { id },
  });

  if (!appointment) {
    console.log('Appointment NOT FOUND in database');
    const count = await prisma.appointment.count();
    console.log(`Total appointments in database: ${count}`);
  } else {
    console.log('Appointment FOUND:', JSON.stringify(appointment, null, 2));
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
