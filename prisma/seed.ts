import { PrismaClient, UserRole, AppointmentStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  console.log('🧹 Cleaning existing data...');
  await prisma.appointment.deleteMany();
  await prisma.barberTimeOff.deleteMany();
  await prisma.barberWeeklyHour.deleteMany();
  await prisma.barberService.deleteMany();
  await prisma.storeHour.deleteMany();
  await prisma.user.deleteMany();
  await prisma.service.deleteMany();
  await prisma.store.deleteMany();

  console.log('✅ Cleared existing data');

  // Create Stores
  console.log('🏪 Creating stores...');
  const pescara = await prisma.store.create({
    data: {
      name: 'Maxim Barber - Pescara Centro',
      address: 'Via Roma 123, 65121 Pescara PE',
    },
  });

  const ortona = await prisma.store.create({
    data: {
      name: 'Maxim Barber - Ortona',
      address: 'Corso Matteotti 45, 66026 Ortona CH',
    },
  });

  console.log('✅ Created 2 stores');

  // Create Store Hours (Monday to Saturday)
  console.log('📅 Creating store hours...');
  const storeHours = [];
  for (let dayOfWeek = 1; dayOfWeek <= 6; dayOfWeek++) {
    // Monday to Friday: 9:00-13:00, 14:00-19:00
    if (dayOfWeek <= 5) {
      const morningOpen = new Date('2024-01-01T09:00:00Z');
      const morningClose = new Date('2024-01-01T13:00:00Z');
      const afternoonOpen = new Date('2024-01-01T14:00:00Z');
      const afternoonClose = new Date('2024-01-01T19:00:00Z');

      storeHours.push(
        { storeId: pescara.id, dayOfWeek, openTime: morningOpen, closeTime: morningClose },
        { storeId: pescara.id, dayOfWeek, openTime: afternoonOpen, closeTime: afternoonClose },
        { storeId: ortona.id, dayOfWeek, openTime: morningOpen, closeTime: morningClose },
        { storeId: ortona.id, dayOfWeek, openTime: afternoonOpen, closeTime: afternoonClose },
      );
    } else {
      // Saturday: 9:00-18:00
      const openTime = new Date('2024-01-01T09:00:00Z');
      const closeTime = new Date('2024-01-01T18:00:00Z');
      storeHours.push(
        { storeId: pescara.id, dayOfWeek, openTime, closeTime },
        { storeId: ortona.id, dayOfWeek, openTime, closeTime },
      );
    }
  }

  await prisma.storeHour.createMany({ data: storeHours });
  console.log('✅ Created store hours');

  // Create Services
  console.log('✂️ Creating services...');
  const taglioClassico = await prisma.service.create({
    data: {
      name: 'Taglio Classico',
      durationMinutes: 30,
      price: 20,
    },
  });

  const barba = await prisma.service.create({
    data: {
      name: 'Barba',
      durationMinutes: 20,
      price: 15,
    },
  });

  const taglioBarba = await prisma.service.create({
    data: {
      name: 'Taglio + Barba',
      durationMinutes: 45,
      price: 30,
    },
  });

  const taglioModerno = await prisma.service.create({
    data: {
      name: 'Taglio Moderno',
      durationMinutes: 40,
      price: 25,
    },
  });

  console.log('✅ Created 4 services');

  // Create Users
  console.log('👤 Creating users...');
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Admin
  await prisma.user.create({
    data: {
      firstName: 'Admin',
      lastName: 'Maxim',
      phone: '+39 3331111111',
      password: hashedPassword,
      role: UserRole.ADMIN,
    },
  });

  // Barbers
  const maxim = await prisma.user.create({
    data: {
      firstName: 'Maxim',
      lastName: 'Rossi',
      phone: '+39 3332222222',
      password: hashedPassword,
      role: UserRole.BARBER,
    },
  });

  const luca = await prisma.user.create({
    data: {
      firstName: 'Luca',
      lastName: 'Bianchi',
      phone: '+39 3333333333',
      password: hashedPassword,
      role: UserRole.BARBER,
    },
  });

  const marco = await prisma.user.create({
    data: {
      firstName: 'Marco',
      lastName: 'Verdi',
      phone: '+39 3334444444',
      password: hashedPassword,
      role: UserRole.BARBER,
    },
  });

  // Customers
  const davide = await prisma.user.create({
    data: {
      firstName: 'Davide',
      lastName: 'Palombaro',
      phone: '+39 3335555555',
      password: hashedPassword,
      role: UserRole.CUSTOMER,
    },
  });

  const giovanni = await prisma.user.create({
    data: {
      firstName: 'Giovanni',
      lastName: 'Esposito',
      phone: '+39 3336666666',
      password: hashedPassword,
      role: UserRole.CUSTOMER,
    },
  });

  await prisma.user.create({
    data: {
      firstName: 'Paolo',
      lastName: 'Ferrari',
      phone: '+39 3337777777',
      password: hashedPassword,
      role: UserRole.CUSTOMER,
    },
  });

  console.log('✅ Created 7 users (1 admin, 3 barbers, 3 customers)');

  // Create Barber Services (which services each barber can perform)
  console.log('🔗 Creating barber-service relationships...');
  await prisma.barberService.createMany({
    data: [
      // Maxim can do all services
      { barberId: maxim.id, serviceId: taglioClassico.id },
      { barberId: maxim.id, serviceId: barba.id },
      { barberId: maxim.id, serviceId: taglioBarba.id },
      { barberId: maxim.id, serviceId: taglioModerno.id },
      // Luca can do all services
      { barberId: luca.id, serviceId: taglioClassico.id },
      { barberId: luca.id, serviceId: barba.id },
      { barberId: luca.id, serviceId: taglioBarba.id },
      { barberId: luca.id, serviceId: taglioModerno.id },
      // Marco specializes in cuts
      { barberId: marco.id, serviceId: taglioClassico.id },
      { barberId: marco.id, serviceId: taglioModerno.id },
      { barberId: marco.id, serviceId: taglioBarba.id },
    ],
  });

  console.log('✅ Linked services to barbers');

  // Create Barber Weekly Hours
  console.log('⏰ Creating barber weekly hours...');
  const barberWeeklyHours = [
    // Maxim works Monday to Friday 9:00-19:00
    ...[1, 2, 3, 4, 5].map((day) => ({
      barberId: maxim.id,
      dayOfWeek: day,
      startTime: new Date('2024-01-01T09:00:00Z'),
      endTime: new Date('2024-01-01T19:00:00Z'),
    })),
    // Maxim works Saturday 9:00-18:00
    {
      barberId: maxim.id,
      dayOfWeek: 6,
      startTime: new Date('2024-01-01T09:00:00Z'),
      endTime: new Date('2024-01-01T18:00:00Z'),
    },
    // Luca works Tuesday to Saturday 9:00-19:00
    ...[2, 3, 4, 5, 6].map((day) => ({
      barberId: luca.id,
      dayOfWeek: day,
      startTime: new Date('2024-01-01T09:00:00Z'),
      endTime: new Date('2024-01-01T19:00:00Z'),
    })),
    // Marco works Monday, Wednesday, Friday 14:00-19:00
    ...[1, 3, 5].map((day) => ({
      barberId: marco.id,
      dayOfWeek: day,
      startTime: new Date('2024-01-01T14:00:00Z'),
      endTime: new Date('2024-01-01T19:00:00Z'),
    })),
  ];

  await prisma.barberWeeklyHour.createMany({ data: barberWeeklyHours });
  console.log('✅ Created barber weekly hours');

  // Create sample appointments
  console.log('📅 Creating sample appointments...');
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);

  const appointment1Start = new Date(tomorrow);
  const appointment1End = new Date(tomorrow);
  appointment1End.setMinutes(appointment1End.getMinutes() + 30);

  await prisma.appointment.create({
    data: {
      customerId: davide.id,
      barberId: maxim.id,
      serviceId: taglioClassico.id,
      storeId: pescara.id,
      startTime: appointment1Start,
      endTime: appointment1End,
      status: AppointmentStatus.CONFIRMED,
    },
  });

  const appointment2Start = new Date(tomorrow);
  appointment2Start.setHours(15, 0, 0, 0);
  const appointment2End = new Date(appointment2Start);
  appointment2End.setMinutes(appointment2End.getMinutes() + 45);

  await prisma.appointment.create({
    data: {
      customerId: giovanni.id,
      barberId: luca.id,
      serviceId: taglioBarba.id,
      storeId: ortona.id,
      startTime: appointment2Start,
      endTime: appointment2End,
      status: AppointmentStatus.CONFIRMED,
    },
  });

  console.log('✅ Created 2 sample appointments');

  console.log('\n🎉 Database seeded successfully!');
  console.log('\n📋 Summary:');
  console.log('   Stores: 2 (Pescara, Ortona)');
  console.log('   Services: 4');
  console.log('   Users: 7 (1 admin, 3 barbers, 3 customers)');
  console.log('   Appointments: 2');
  console.log('\n🔑 Login credentials (all users):');
  console.log('   Password: password123');
  console.log('\n   Admin: +393331111111');
  console.log('   Barbers:');
  console.log('     - Maxim Rossi: +393332222222');
  console.log('     - Luca Bianchi: +393333333333');
  console.log('     - Marco Verdi: +393334444444');
  console.log('   Customers:');
  console.log('     - Davide Palombaro: +393335555555');
  console.log('     - Giovanni Esposito: +393336666666');
  console.log('     - Paolo Ferrari: +393337777777');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
