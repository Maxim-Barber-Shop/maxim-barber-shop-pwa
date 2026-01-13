import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding appointments...');

  // Get existing data
  const customers = await prisma.user.findMany({
    where: { role: 'CUSTOMER' },
  });

  const barbers = await prisma.user.findMany({
    where: { role: 'BARBER' },
  });

  const services = await prisma.service.findMany();
  const stores = await prisma.store.findMany();

  console.log(
    `Found ${customers.length} customers, ${barbers.length} barbers, ${services.length} services, ${stores.length} stores`,
  );

  if (customers.length === 0 || barbers.length === 0 || services.length === 0 || stores.length === 0) {
    console.error(
      '❌ Devi avere almeno un cliente, un barbiere, un servizio e una sede prima di generare appuntamenti',
    );
    process.exit(1);
  }

  // Generate appointments for the last 90 days
  const now = new Date();
  const appointments = [];

  // Generate 50 random appointments
  for (let i = 0; i < 50; i++) {
    const customer = customers[Math.floor(Math.random() * customers.length)];
    const barber = barbers[Math.floor(Math.random() * barbers.length)];
    const service = services[Math.floor(Math.random() * services.length)];
    const store = stores[Math.floor(Math.random() * stores.length)];

    // Random date in the last 90 days
    const daysAgo = Math.floor(Math.random() * 90);
    const startTime = new Date(now);
    startTime.setDate(now.getDate() - daysAgo);
    startTime.setHours(9 + Math.floor(Math.random() * 9), 0, 0, 0); // Between 9 AM and 6 PM

    const endTime = new Date(startTime);
    endTime.setMinutes(startTime.getMinutes() + service.durationMinutes);

    // More completed appointments, fewer cancelled/no-show
    let status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
    const rand = Math.random();
    if (rand < 0.6) {
      status = 'COMPLETED';
    } else if (rand < 0.75) {
      status = 'CONFIRMED';
    } else if (rand < 0.9) {
      status = 'CANCELLED';
    } else {
      status = 'NO_SHOW';
    }

    appointments.push({
      customerId: customer.id,
      barberId: barber.id,
      serviceId: service.id,
      storeId: store.id,
      status,
      startTime,
      endTime,
    });
  }

  // Insert appointments
  await prisma.appointment.createMany({
    data: appointments,
  });

  const stats = {
    total: appointments.length,
    completed: appointments.filter((a) => a.status === 'COMPLETED').length,
    confirmed: appointments.filter((a) => a.status === 'CONFIRMED').length,
    cancelled: appointments.filter((a) => a.status === 'CANCELLED').length,
    noShow: appointments.filter((a) => a.status === 'NO_SHOW').length,
  };

  console.log('✅ Appuntamenti creati:');
  console.log(`   Total: ${stats.total}`);
  console.log(`   Completed: ${stats.completed}`);
  console.log(`   Confirmed: ${stats.confirmed}`);
  console.log(`   Cancelled: ${stats.cancelled}`);
  console.log(`   No Show: ${stats.noShow}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
