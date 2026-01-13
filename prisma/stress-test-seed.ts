import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting stress test seed...');

  // Clear existing data
  console.log('🗑️  Clearing existing data...');
  await prisma.appointment.deleteMany();
  await prisma.barberTimeOff.deleteMany();
  await prisma.barberWeeklyHour.deleteMany();
  await prisma.service.deleteMany();
  await prisma.storeHour.deleteMany();
  await prisma.user.deleteMany({ where: { role: { in: ['CUSTOMER', 'BARBER'] } } });
  await prisma.store.deleteMany();
  await prisma.settings.deleteMany();

  // Keep admin
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { phone: '+39 333 0000000' },
    update: {},
    create: {
      firstName: 'Admin',
      lastName: 'User',
      phone: '+39 333 0000000',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });
  console.log('✅ Admin created');

  // Create 3 stores
  console.log('🏪 Creating 3 stores...');
  const storeData = [
    { name: 'Sede Pescara Centro', address: 'Via Roma 123, Pescara' },
    { name: 'Sede Ortona Mare', address: 'Corso Matteotti 45, Ortona' },
    { name: 'Sede Chieti Nord', address: 'Via Nazionale 78, Chieti' },
  ];

  const stores = await Promise.all(
    storeData.map((store) =>
      prisma.store.create({
        data: store,
      }),
    ),
  );
  console.log(`✅ Created ${stores.length} stores`);

  // Create 5 barbers (sequentially to avoid connection pool issues)
  console.log('💈 Creating 5 barbers...');
  const barberNames = [
    { firstName: 'Marco', lastName: 'Rossi' },
    { firstName: 'Luca', lastName: 'Bianchi' },
    { firstName: 'Giovanni', lastName: 'Verdi' },
    { firstName: 'Andrea', lastName: 'Neri' },
    { firstName: 'Paolo', lastName: 'Gialli' },
  ];

  const barbers = [];
  for (let index = 0; index < barberNames.length; index++) {
    const name = barberNames[index];
    const barber = await prisma.user.create({
      data: {
        firstName: name.firstName,
        lastName: name.lastName,
        phone: `+39 333 111${index.toString().padStart(4, '0')}`,
        password: hashedPassword,
        role: 'BARBER',
      },
    });

    // Assign barber to all stores with weekly hours
    for (const store of stores) {
      // Monday morning
      await prisma.barberWeeklyHour.create({
        data: {
          barberId: barber.id,
          storeId: store.id,
          dayOfWeek: 1,
          startTime: new Date('2024-01-01T09:00:00Z'),
          endTime: new Date('2024-01-01T13:00:00Z'),
        },
      });

      // Monday afternoon
      await prisma.barberWeeklyHour.create({
        data: {
          barberId: barber.id,
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
            barberId: barber.id,
            storeId: store.id,
            dayOfWeek: day,
            startTime: new Date('2024-01-01T09:00:00Z'),
            endTime: new Date('2024-01-01T13:00:00Z'),
          },
        });

        await prisma.barberWeeklyHour.create({
          data: {
            barberId: barber.id,
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
          barberId: barber.id,
          storeId: store.id,
          dayOfWeek: 6,
          startTime: new Date('2024-01-01T09:00:00Z'),
          endTime: new Date('2024-01-01T13:00:00Z'),
        },
      });
    }

    barbers.push(barber);
    console.log(`  ✅ Created barber ${index + 1}/${barberNames.length}: ${name.firstName} ${name.lastName}`);
  }
  console.log(`✅ Created ${barbers.length} barbers with availability`);

  // Add weekly hours for Admin to make them selectable as a barber
  console.log('👑 Configuring Admin as barber...');

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
  }

  // Add admin to barbers array so they get services too
  barbers.push(admin);
  console.log(`✅ Admin configured as barber`);

  // Create services for each barber at each store
  console.log('✂️  Creating services...');
  const serviceTemplates = [
    { name: 'Taglio Classico', duration: 30, basePrice: 20 },
    { name: 'Barba', duration: 20, basePrice: 15 },
    { name: 'Taglio + Barba', duration: 45, basePrice: 32 },
    { name: 'Taglio Moderno', duration: 40, basePrice: 25 },
  ];

  const services = [];
  for (const barber of barbers) {
    for (const store of stores) {
      for (const template of serviceTemplates) {
        const priceVariation = Math.floor(Math.random() * 5) - 2; // -2 to +2
        const service = await prisma.service.create({
          data: {
            name: template.name,
            durationMinutes: template.duration,
            price: template.basePrice + priceVariation,
            barberId: barber.id,
            storeId: store.id,
          },
        });
        services.push(service);
      }
    }
  }
  console.log(`✅ Created ${services.length} services`);

  // Create 500 customers
  console.log('👥 Creating 500 customers...');
  const customers = [];
  const batchSize = 50;

  for (let batch = 0; batch < 10; batch++) {
    const customerBatch = [];
    for (let i = 0; i < batchSize; i++) {
      const index = batch * batchSize + i;
      customerBatch.push({
        firstName: `Cliente${index}`,
        lastName: `Test${index}`,
        phone: `+39 340 ${index.toString().padStart(7, '0')}`,
        password: hashedPassword,
        role: 'CUSTOMER',
      });
    }

    const createdCustomers = await prisma.user.createManyAndReturn({
      data: customerBatch,
    });
    customers.push(...createdCustomers);
    console.log(`  ✅ Batch ${batch + 1}/10 completed (${customers.length}/500 customers)`);
  }
  console.log(`✅ Created ${customers.length} customers`);

  // Create settings
  await prisma.settings.createMany({
    data: [
      {
        key: 'booking_limit_per_week',
        value: '3',
        description: 'Numero massimo di appuntamenti prenotabili per settimana',
      },
      {
        key: 'booking_limit_per_month',
        value: '10',
        description: 'Numero massimo di appuntamenti prenotabili per mese',
      },
    ],
  });
  console.log('✅ Settings created');

  // Create 10000 appointments
  console.log('📅 Creating 10000 appointments...');
  const statuses = ['CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'];
  const appointmentBatchSize = 500;
  const totalAppointments = 10000;
  const numBatches = Math.ceil(totalAppointments / appointmentBatchSize);

  let totalCreated = 0;

  for (let batch = 0; batch < numBatches; batch++) {
    const appointmentBatch = [];
    const currentBatchSize = Math.min(appointmentBatchSize, totalAppointments - totalCreated);

    for (let i = 0; i < currentBatchSize; i++) {
      // Random date in the last 3 months or next 2 months
      const daysOffset = Math.floor(Math.random() * 150) - 90; // -90 to +60 days
      const appointmentDate = new Date();
      appointmentDate.setDate(appointmentDate.getDate() + daysOffset);

      // Random hour between 9 and 17
      const hour = 9 + Math.floor(Math.random() * 9);
      const minute = Math.random() > 0.5 ? 0 : 30;
      appointmentDate.setHours(hour, minute, 0, 0);

      const customer = customers[Math.floor(Math.random() * customers.length)];
      const service = services[Math.floor(Math.random() * services.length)];

      // Get the barber and store from the service
      const barber = barbers.find((b) => b.id === service.barberId);
      const store = stores.find((s) => s.id === service.storeId);

      if (!barber || !store) continue;

      const startTime = new Date(appointmentDate);
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + service.durationMinutes);

      // More completed/confirmed in the past, more confirmed in the future
      let status;
      if (daysOffset < 0) {
        // Past appointment
        const rand = Math.random();
        if (rand < 0.7) status = 'COMPLETED';
        else if (rand < 0.85) status = 'CONFIRMED';
        else if (rand < 0.95) status = 'CANCELLED';
        else status = 'NO_SHOW';
      } else {
        // Future appointment
        const rand = Math.random();
        if (rand < 0.9) status = 'CONFIRMED';
        else status = 'CANCELLED';
      }

      appointmentBatch.push({
        customerId: customer.id,
        barberId: barber.id,
        serviceId: service.id,
        storeId: store.id,
        startTime,
        endTime,
        status,
      });
    }

    await prisma.appointment.createMany({
      data: appointmentBatch,
    });

    totalCreated += currentBatchSize;
    console.log(`  ✅ Batch ${batch + 1}/${numBatches} completed (${totalCreated}/${totalAppointments} appointments)`);
  }

  console.log(`✅ Created ${totalCreated} appointments`);

  console.log('\n🎉 Stress test seed completed!');
  console.log('\n📊 Summary:');
  console.log(`   - Admin: 1`);
  console.log(`   - Stores: ${stores.length}`);
  console.log(`   - Barbers: ${barbers.length}`);
  console.log(`   - Services: ${services.length}`);
  console.log(`   - Customers: ${customers.length}`);
  console.log(`   - Appointments: ${totalCreated}`);
}

main()
  .catch((e) => {
    console.error('❌ Error during stress test seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
