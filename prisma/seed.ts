import { PrismaClient, UserRole, AppointmentStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing data
  await prisma.appointment.deleteMany();
  await prisma.barberTimeOff.deleteMany();
  await prisma.barberWeeklyHour.deleteMany();
  await prisma.barberService.deleteMany();
  await prisma.storeHour.deleteMany();
  await prisma.store.deleteMany();
  await prisma.service.deleteMany();
  await prisma.user.deleteMany();

  console.log('🗑️  Cleared existing data');

  // Create Services
  const taglio = await prisma.service.create({
    data: {
      name: 'Taglio',
      durationMinutes: 30,
      price: 15.0,
    },
  });

  const taglioBarba = await prisma.service.create({
    data: {
      name: 'Taglio + Barba',
      durationMinutes: 45,
      price: 25.0,
    },
  });

  const barba = await prisma.service.create({
    data: {
      name: 'Barba',
      durationMinutes: 20,
      price: 12.0,
    },
  });

  console.log('✅ Created 3 services');

  // Create Barber (Maxim)
  const maxim = await prisma.user.create({
    data: {
      firstName: 'Maxim',
      lastName: 'Barber',
      phone: '+39 333 1234567',
      role: UserRole.BARBER,
    },
  });

  console.log('✅ Created barber: Maxim');

  // Create Customer (Davide Palombaro)
  const davide = await prisma.user.create({
    data: {
      firstName: 'Davide',
      lastName: 'Palombaro',
      phone: '+39 333 7654321',
      role: UserRole.CUSTOMER,
    },
  });

  console.log('✅ Created customer: Davide Palombaro');

  // Link services to barber
  await prisma.barberService.createMany({
    data: [
      { barberId: maxim.id, serviceId: taglio.id },
      { barberId: maxim.id, serviceId: taglioBarba.id },
      { barberId: maxim.id, serviceId: barba.id },
    ],
  });

  console.log('✅ Linked services to Maxim');

  // Create Stores
  const pescara = await prisma.store.create({
    data: {
      name: 'Maxim Barber Shop - Pescara',
      address: 'Via Roma 123, 65121 Pescara PE',
    },
  });

  const ortona = await prisma.store.create({
    data: {
      name: 'Maxim Barber Shop - Ortona',
      address: 'Corso Matteotti 45, 66026 Ortona CH',
    },
  });

  console.log('✅ Created 2 stores: Pescara and Ortona');

  // Create Store Hours (Monday to Saturday, 9:00 - 19:00)
  const storeHours = [];
  for (let dayOfWeek = 1; dayOfWeek <= 6; dayOfWeek++) {
    // Monday = 1, Saturday = 6
    const openTime = new Date();
    openTime.setHours(9, 0, 0, 0);

    const closeTime = new Date();
    closeTime.setHours(19, 0, 0, 0);

    storeHours.push(
      { storeId: pescara.id, dayOfWeek, openTime, closeTime },
      { storeId: ortona.id, dayOfWeek, openTime, closeTime },
    );
  }

  await prisma.storeHour.createMany({ data: storeHours });
  console.log('✅ Created store hours (Mon-Sat, 9:00-19:00)');

  // Create Barber Weekly Hours (Monday to Saturday, 9:00 - 18:00)
  const barberHours = [];
  for (let dayOfWeek = 1; dayOfWeek <= 6; dayOfWeek++) {
    const startTime = new Date();
    startTime.setHours(9, 0, 0, 0);

    const endTime = new Date();
    endTime.setHours(18, 0, 0, 0);

    barberHours.push({ barberId: maxim.id, dayOfWeek, startTime, endTime });
  }

  await prisma.barberWeeklyHour.createMany({ data: barberHours });
  console.log('✅ Created barber weekly hours for Maxim');

  // Create an Appointment (tomorrow at 10:00)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);

  const appointmentEnd = new Date(tomorrow);
  appointmentEnd.setMinutes(appointmentEnd.getMinutes() + taglio.durationMinutes);

  await prisma.appointment.create({
    data: {
      customerId: davide.id,
      barberId: maxim.id,
      serviceId: taglio.id,
      storeId: pescara.id,
      status: AppointmentStatus.CONFIRMED,
      startTime: tomorrow,
      endTime: appointmentEnd,
    },
  });

  console.log('✅ Created 1 appointment (Davide @ Pescara, tomorrow 10:00)');

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   - Services: 3 (Taglio, Taglio + Barba, Barba)`);
  console.log(`   - Barber: Maxim`);
  console.log(`   - Customer: Davide Palombaro`);
  console.log(`   - Stores: 2 (Pescara, Ortona)`);
  console.log(`   - Appointment: 1`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
