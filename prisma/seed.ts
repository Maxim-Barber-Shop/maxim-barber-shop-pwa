import { PrismaClient, UserRole, ServiceCategory } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  console.log('🧹 Cleaning existing data...');
  await prisma.blacklist.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.barberTimeOff.deleteMany();
  await prisma.barberWeeklyHour.deleteMany();
  // StoreHour not needed - availability is derived from BarberWeeklyHour
  await prisma.service.deleteMany();
  await prisma.settings.deleteMany();
  await prisma.user.deleteMany();
  await prisma.store.deleteMany();

  console.log('✅ Cleared existing data');

  // Create Stores
  console.log('🏪 Creating stores...');
  const pescara = await prisma.store.create({
    data: {
      name: 'Maxim Barber - Pescara',
      address: 'Via Piave 56, Pescara',
    },
  });

  const ortona = await prisma.store.create({
    data: {
      name: 'Maxim Barber - Ortona',
      address: 'Via Sapienza 18, Ortona',
    },
  });

  console.log('✅ Created 2 stores');

  // Create Users
  console.log('👤 Creating users...');
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Maxim - Admin (also works as barber)
  const maxim = await prisma.user.create({
    data: {
      firstName: 'Maxim',
      lastName: 'Admin',
      phone: '+393312920752',
      password: hashedPassword,
      role: UserRole.ADMIN,
    },
  });

  // Luca Guaiana - Barber
  const luca = await prisma.user.create({
    data: {
      firstName: 'Luca',
      lastName: 'Guaiana',
      phone: '+393332222222',
      password: hashedPassword,
      role: UserRole.BARBER,
    },
  });

  // Angelo Saltarella - Barber
  const angelo = await prisma.user.create({
    data: {
      firstName: 'Angelo',
      lastName: 'Saltarella',
      phone: '+393333333333',
      password: hashedPassword,
      role: UserRole.BARBER,
    },
  });

  // Sample Customer
  await prisma.user.create({
    data: {
      firstName: 'Davide',
      lastName: 'Palombaro',
      phone: '+393334444444',
      password: hashedPassword,
      role: UserRole.CUSTOMER,
    },
  });

  console.log('✅ Created 4 users (1 admin/barber, 2 barbers, 1 customer)');

  // Create Barber Weekly Hours
  console.log('⏰ Creating barber weekly hours...');

  const barberWeeklyHours = [
    // ============ PESCARA ============

    // Maxim @ Pescara - Martedì, Mercoledì, Giovedì: 10:00-12:00
    ...[2, 3, 4].map((day) => ({
      barberId: maxim.id,
      storeId: pescara.id,
      dayOfWeek: day,
      startTime: new Date('2024-01-01T10:00:00Z'),
      endTime: new Date('2024-01-01T12:00:00Z'),
    })),
    // Maxim @ Pescara - Venerdì, Sabato: 10:00-19:00
    ...[5, 6].map((day) => ({
      barberId: maxim.id,
      storeId: pescara.id,
      dayOfWeek: day,
      startTime: new Date('2024-01-01T10:00:00Z'),
      endTime: new Date('2024-01-01T19:00:00Z'),
    })),

    // Luca @ Pescara - Mercoledì, Giovedì: 15:00-21:30
    ...[3, 4].map((day) => ({
      barberId: luca.id,
      storeId: pescara.id,
      dayOfWeek: day,
      startTime: new Date('2024-01-01T15:00:00Z'),
      endTime: new Date('2024-01-01T21:30:00Z'),
    })),

    // ============ ORTONA ============

    // Maxim @ Ortona - Martedì, Mercoledì, Giovedì: 14:00-22:00 (slot 22:00 bloccato, quindi end at 22:00)
    ...[2, 3, 4].map((day) => ({
      barberId: maxim.id,
      storeId: ortona.id,
      dayOfWeek: day,
      startTime: new Date('2024-01-01T14:00:00Z'),
      endTime: new Date('2024-01-01T22:00:00Z'),
    })),

    // Luca @ Ortona - Venerdì: 15:00-20:00
    {
      barberId: luca.id,
      storeId: ortona.id,
      dayOfWeek: 5,
      startTime: new Date('2024-01-01T15:00:00Z'),
      endTime: new Date('2024-01-01T20:00:00Z'),
    },
    // Luca @ Ortona - Sabato: 9:00-20:00
    {
      barberId: luca.id,
      storeId: ortona.id,
      dayOfWeek: 6,
      startTime: new Date('2024-01-01T09:00:00Z'),
      endTime: new Date('2024-01-01T20:00:00Z'),
    },

    // Angelo @ Ortona - Martedì a Sabato: 9:30-12:30 (mattina)
    ...[2, 3, 4, 5, 6].map((day) => ({
      barberId: angelo.id,
      storeId: ortona.id,
      dayOfWeek: day,
      startTime: new Date('2024-01-01T09:30:00Z'),
      endTime: new Date('2024-01-01T12:30:00Z'),
    })),
    // Angelo @ Ortona - Martedì a Sabato: 14:00-19:00 (pomeriggio)
    ...[2, 3, 4, 5, 6].map((day) => ({
      barberId: angelo.id,
      storeId: ortona.id,
      dayOfWeek: day,
      startTime: new Date('2024-01-01T14:00:00Z'),
      endTime: new Date('2024-01-01T19:00:00Z'),
    })),
  ];

  await prisma.barberWeeklyHour.createMany({ data: barberWeeklyHours });
  console.log('✅ Created barber weekly hours');

  // Create Services
  console.log('✂️ Creating services...');
  await prisma.service.createMany({
    data: [
      // ============ MAXIM - PESCARA ============
      {
        name: 'Taglio Capelli',
        description: 'Taglio classico o moderno con consulenza stilistica, shampoo e styling finale',
        durationMinutes: 30,
        price: 23,
        category: ServiceCategory.CAPELLI,
        barberId: maxim.id,
        storeId: pescara.id,
      },
      {
        name: 'Barba',
        description: 'Rasatura e definizione barba con panno caldo, olio pre-rasatura e balsamo finale',
        durationMinutes: 30,
        price: 15,
        category: ServiceCategory.BARBA,
        barberId: maxim.id,
        storeId: pescara.id,
      },
      {
        name: 'Combo Taglio + Barba',
        description: 'Trattamento completo: taglio capelli con styling e cura barba con prodotti premium',
        durationMinutes: 60,
        price: 38,
        discountedPrice: 35,
        category: ServiceCategory.COMBO,
        barberId: maxim.id,
        storeId: pescara.id,
      },

      // ============ MAXIM - ORTONA ============
      {
        name: 'Taglio Capelli',
        description: 'Taglio classico o moderno con consulenza stilistica, shampoo e styling finale',
        durationMinutes: 30,
        price: 20,
        category: ServiceCategory.CAPELLI,
        barberId: maxim.id,
        storeId: ortona.id,
      },
      {
        name: 'Barba',
        description: 'Rasatura e definizione barba con panno caldo, olio pre-rasatura e balsamo finale',
        durationMinutes: 30,
        price: 15,
        category: ServiceCategory.BARBA,
        barberId: maxim.id,
        storeId: ortona.id,
      },
      {
        name: 'Combo Taglio + Barba',
        description: 'Trattamento completo: taglio capelli con styling e cura barba con prodotti premium',
        durationMinutes: 60,
        price: 35,
        discountedPrice: 30,
        category: ServiceCategory.COMBO,
        barberId: maxim.id,
        storeId: ortona.id,
      },

      // ============ LUCA - PESCARA ============
      {
        name: 'Taglio Capelli',
        description: 'Taglio classico o moderno con consulenza stilistica, shampoo e styling finale',
        durationMinutes: 30,
        price: 20,
        category: ServiceCategory.CAPELLI,
        barberId: luca.id,
        storeId: pescara.id,
      },
      {
        name: 'Barba',
        description: 'Rasatura e definizione barba con panno caldo, olio pre-rasatura e balsamo finale',
        durationMinutes: 30,
        price: 15,
        category: ServiceCategory.BARBA,
        barberId: luca.id,
        storeId: pescara.id,
      },
      {
        name: 'Combo Taglio + Barba',
        description: 'Trattamento completo: taglio capelli con styling e cura barba con prodotti premium',
        durationMinutes: 60,
        price: 35,
        category: ServiceCategory.COMBO,
        barberId: luca.id,
        storeId: pescara.id,
      },

      // ============ LUCA - ORTONA ============
      {
        name: 'Taglio Capelli',
        description: 'Taglio classico o moderno con consulenza stilistica, shampoo e styling finale',
        durationMinutes: 30,
        price: 17,
        category: ServiceCategory.CAPELLI,
        barberId: luca.id,
        storeId: ortona.id,
      },
      {
        name: 'Barba',
        description: 'Rasatura e definizione barba con panno caldo, olio pre-rasatura e balsamo finale',
        durationMinutes: 30,
        price: 13,
        category: ServiceCategory.BARBA,
        barberId: luca.id,
        storeId: ortona.id,
      },

      // ============ ANGELO - ORTONA ============
      {
        name: 'Taglio Capelli',
        description: 'Taglio classico o moderno con consulenza stilistica, shampoo e styling finale',
        durationMinutes: 30,
        price: 20,
        category: ServiceCategory.CAPELLI,
        barberId: angelo.id,
        storeId: ortona.id,
      },
      {
        name: 'Barba',
        description: 'Rasatura e definizione barba con panno caldo, olio pre-rasatura e balsamo finale',
        durationMinutes: 30,
        price: 15,
        category: ServiceCategory.BARBA,
        barberId: angelo.id,
        storeId: ortona.id,
      },
      {
        name: 'Combo Taglio + Barba',
        description: 'Trattamento completo: taglio capelli con styling e cura barba con prodotti premium',
        durationMinutes: 60,
        price: 35,
        discountedPrice: 30,
        category: ServiceCategory.COMBO,
        barberId: angelo.id,
        storeId: ortona.id,
      },
    ],
  });

  console.log('✅ Created 14 services');

  // Create Settings
  console.log('⚙️ Creating default settings...');
  await prisma.settings.createMany({
    data: [
      {
        key: 'booking_limit_per_week',
        value: '2',
        description: 'Numero massimo di appuntamenti prenotabili a settimana per cliente',
      },
      {
        key: 'booking_limit_per_month',
        value: '4',
        description: 'Numero massimo di appuntamenti prenotabili al mese per cliente',
      },
    ],
  });
  console.log('✅ Created default settings');

  console.log('\n🎉 Database seeded successfully!');
  console.log('\n📋 Summary:');
  console.log('   Stores: 2 (Pescara Via Piave 56, Ortona Via Sapienza 18)');
  console.log('   Users: 4 (1 admin/barber, 2 barbers, 1 customer)');
  console.log('   Services: 14');
  console.log('   Settings: 2 (booking limits)');
  console.log('\n🔑 Login credentials (password: password123):');
  console.log('   Admin/Barber: Maxim Admin - +393312920752');
  console.log('   Barber: Luca Guaiana - +393332222222');
  console.log('   Barber: Angelo Saltarella - +393333333333');
  console.log('   Customer: Davide Palombaro - +393334444444');
  console.log('\n📅 Orari:');
  console.log('   PESCARA:');
  console.log('     Maxim: Mar-Gio 10-12, Ven-Sab 10-19');
  console.log('     Luca: Mer-Gio 15-21:30');
  console.log('   ORTONA:');
  console.log('     Maxim: Mar-Gio 14-22 (slot 22 bloccato)');
  console.log('     Luca: Ven 15-20, Sab 9-20');
  console.log('     Angelo: Mar-Sab 9:30-12:30 e 14-19');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
