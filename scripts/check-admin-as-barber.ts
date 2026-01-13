import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAdmin() {
  console.log('🔍 Checking Admin configuration as barber...\n');

  // Find admin
  const admin = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
  });

  if (!admin) {
    console.log('❌ No ADMIN user found');
    return;
  }

  console.log(`✅ Admin found: ${admin.firstName} ${admin.lastName} (${admin.phone})`);
  console.log(`   ID: ${admin.id}\n`);

  // Check weekly hours
  const weeklyHours = await prisma.barberWeeklyHour.findMany({
    where: { barberId: admin.id },
    include: { store: true },
  });

  console.log(`📅 Weekly hours: ${weeklyHours.length}`);
  if (weeklyHours.length > 0) {
    const storeGroups = weeklyHours.reduce(
      (acc, hour) => {
        if (!acc[hour.store.name]) acc[hour.store.name] = 0;
        acc[hour.store.name]++;
        return acc;
      },
      {} as Record<string, number>,
    );

    Object.entries(storeGroups).forEach(([store, count]) => {
      console.log(`   - ${store}: ${count} time slots`);
    });
  } else {
    console.log('   ⚠️  NO weekly hours configured!');
  }

  // Check services
  const services = await prisma.service.findMany({
    where: { barberId: admin.id },
    include: { store: true },
  });

  console.log(`\n✂️  Services: ${services.length}`);
  if (services.length > 0) {
    const storeGroups = services.reduce(
      (acc, service) => {
        if (!acc[service.store.name]) acc[service.store.name] = 0;
        acc[service.store.name]++;
        return acc;
      },
      {} as Record<string, number>,
    );

    Object.entries(storeGroups).forEach(([store, count]) => {
      console.log(`   - ${store}: ${count} services`);
    });
  } else {
    console.log('   ⚠️  NO services configured!');
  }

  // Test getBarbers for each store
  console.log('\n🔎 Testing getBarbers API for each store:\n');

  const stores = await prisma.store.findMany();

  for (const store of stores) {
    const barbers = await prisma.user.findMany({
      where: {
        role: { in: ['BARBER', 'ADMIN'] },
        deletedAt: null,
        barberWeeklyHours: {
          some: { storeId: store.id },
        },
      },
      orderBy: { firstName: 'asc' },
    });

    console.log(`   ${store.name} (${store.id}):`);
    console.log(`   → ${barbers.length} barbers found`);

    const adminInList = barbers.find((b) => b.id === admin.id);
    if (adminInList) {
      console.log(`   ✅ Admin IS in the list`);
    } else {
      console.log(`   ❌ Admin NOT in the list`);
    }
    console.log('');
  }

  await prisma.$disconnect();
}

checkAdmin().catch(console.error);
