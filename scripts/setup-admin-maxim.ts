import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function setupAdminMaxim() {
  console.log('🔧 Setting up Admin Maxim as barber...\n');

  const admin = await prisma.user.findFirst({
    where: { phone: '+39 3331111111', role: 'ADMIN' },
  });

  if (!admin) {
    console.log('❌ Admin Maxim not found');
    return;
  }

  console.log(`✅ Found Admin: ${admin.firstName} ${admin.lastName}`);

  const stores = await prisma.store.findMany();
  console.log(`\n📍 Found ${stores.length} stores\n`);

  // Add weekly hours for all stores
  console.log('📅 Adding weekly hours...');
  for (const store of stores) {
    // Monday morning
    await prisma.barberWeeklyHour.create({
      data: {
        barberId: admin.id,
        storeId: store.id,
        dayOfWeek: 1,
        startTime: new Date('2024-01-01T09:00:00Z'),
        endTime: new Date('2024-01-01T13:00:00Z'),
      },
    });

    // Monday afternoon
    await prisma.barberWeeklyHour.create({
      data: {
        barberId: admin.id,
        storeId: store.id,
        dayOfWeek: 1,
        startTime: new Date('2024-01-01T14:00:00Z'),
        endTime: new Date('2024-01-01T18:00:00Z'),
      },
    });

    // Tuesday to Friday
    for (let day = 2; day <= 5; day++) {
      await prisma.barberWeeklyHour.create({
        data: {
          barberId: admin.id,
          storeId: store.id,
          dayOfWeek: day,
          startTime: new Date('2024-01-01T09:00:00Z'),
          endTime: new Date('2024-01-01T13:00:00Z'),
        },
      });

      await prisma.barberWeeklyHour.create({
        data: {
          barberId: admin.id,
          storeId: store.id,
          dayOfWeek: day,
          startTime: new Date('2024-01-01T14:00:00Z'),
          endTime: new Date('2024-01-01T18:00:00Z'),
        },
      });
    }

    // Saturday
    await prisma.barberWeeklyHour.create({
      data: {
        barberId: admin.id,
        storeId: store.id,
        dayOfWeek: 6,
        startTime: new Date('2024-01-01T09:00:00Z'),
        endTime: new Date('2024-01-01T13:00:00Z'),
      },
    });

    console.log(`   ✅ ${store.name}: 11 time slots`);
  }

  // Add services
  console.log('\n✂️  Adding services...');
  const serviceTemplates = [
    { name: 'Taglio Classico', duration: 30, price: 20 },
    { name: 'Barba', duration: 20, price: 15 },
    { name: 'Taglio + Barba', duration: 45, price: 32 },
    { name: 'Taglio Moderno', duration: 40, price: 25 },
  ];

  for (const store of stores) {
    for (const template of serviceTemplates) {
      await prisma.service.create({
        data: {
          name: template.name,
          durationMinutes: template.duration,
          price: template.price,
          barberId: admin.id,
          storeId: store.id,
        },
      });
    }
    console.log(`   ✅ ${store.name}: 4 services`);
  }

  console.log('\n🎉 Admin Maxim is now configured as a barber!');
  console.log(`   - Weekly hours: ${stores.length * 11}`);
  console.log(`   - Services: ${stores.length * 4}`);

  await prisma.$disconnect();
}

setupAdminMaxim().catch(console.error);
