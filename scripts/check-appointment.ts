import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAppointment() {
  const id = '9e6474a8-d2d5-47c4-82fa-10b58d6d3211';

  console.log(`🔍 Checking appointment ${id}...\n`);

  // Check without deletedAt filter
  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: {
      customer: { select: { firstName: true, lastName: true } },
      barber: { select: { firstName: true, lastName: true } },
      service: { select: { name: true } },
      store: { select: { name: true } },
    },
  });

  if (!appointment) {
    console.log('❌ Appointment NOT FOUND in database');
  } else {
    console.log('✅ Appointment found:');
    console.log(`   ID: ${appointment.id}`);
    console.log(`   Status: ${appointment.status}`);
    console.log(`   Customer: ${appointment.customer.firstName} ${appointment.customer.lastName}`);
    console.log(`   Barber: ${appointment.barber.firstName} ${appointment.barber.lastName}`);
    console.log(`   Service: ${appointment.service.name}`);
    console.log(`   Store: ${appointment.store.name}`);
    console.log(`   Start: ${appointment.startTime}`);
    console.log(`   Deleted At: ${appointment.deletedAt || 'NULL (not deleted)'}`);

    if (appointment.deletedAt) {
      console.log('\n⚠️  PROBLEM: This appointment is SOFT-DELETED!');
      console.log('   The API getById filters out soft-deleted records.');
    }
  }

  await prisma.$disconnect();
}

checkAppointment().catch(console.error);
