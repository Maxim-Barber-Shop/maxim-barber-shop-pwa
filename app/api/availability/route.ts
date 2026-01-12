import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { prisma } from '@/lib/prisma';

interface AvailabilitySlot {
  date: string;
  time: string;
  available: boolean;
}

export const GET = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId');
    const serviceId = searchParams.get('serviceId');
    const barberId = searchParams.get('barberId');
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    if (!storeId || !serviceId || !startDateParam || !endDateParam) {
      return NextResponse.json({ data: null, error: 'Missing required parameters' }, { status: 400 });
    }

    const startDate = new Date(startDateParam);
    const endDate = new Date(endDateParam);

    // Get service duration
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      return NextResponse.json({ data: null, error: 'Service not found' }, { status: 404 });
    }

    // Get store hours
    const storeHours = await prisma.storeHour.findMany({
      where: { storeId },
    });

    // Get barber hours if specific barber is selected
    let barberHours = null;
    if (barberId && barberId !== 'any') {
      barberHours = await prisma.barberWeeklyHour.findMany({
        where: { barberId },
      });
    }

    // Get existing appointments in the date range
    const existingAppointments = await prisma.appointment.findMany({
      where: {
        storeId,
        startTime: { gte: startDate },
        endTime: { lte: endDate },
        status: { in: ['CONFIRMED'] },
        ...(barberId && barberId !== 'any' ? { barberId } : {}),
      },
    });

    // Generate time slots
    const slots: AvailabilitySlot[] = [];
    const timeSlots = [
      '09:00',
      '09:30',
      '10:00',
      '10:30',
      '11:00',
      '11:30',
      '14:00',
      '14:30',
      '15:00',
      '15:30',
      '16:00',
      '16:30',
      '17:00',
      '17:30',
      '18:00',
    ];

    // Iterate through each day in the range
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      const dateStr = currentDate.toISOString().split('T')[0];

      // Check if store is open on this day
      const storeHour = storeHours.find((h) => h.dayOfWeek === dayOfWeek);
      if (!storeHour) {
        // Store closed on this day
        timeSlots.forEach((time) => {
          slots.push({ date: dateStr, time, available: false });
        });
      } else {
        // Check each time slot
        for (const time of timeSlots) {
          const [hours, minutes] = time.split(':').map(Number);
          const slotStart = new Date(currentDate);
          slotStart.setHours(hours, minutes, 0, 0);

          const slotEnd = new Date(slotStart);
          slotEnd.setMinutes(slotEnd.getMinutes() + service.durationMinutes);

          // Check if slot is within store hours
          const storeOpen = new Date(storeHour.openTime);
          const storeClose = new Date(storeHour.closeTime);
          const slotTime = hours * 60 + minutes;
          const openTime = storeOpen.getHours() * 60 + storeOpen.getMinutes();
          const closeTime = storeClose.getHours() * 60 + storeClose.getMinutes();

          let available = slotTime >= openTime && slotTime + service.durationMinutes <= closeTime;

          // Check if barber is available (if specific barber selected)
          if (available && barberHours) {
            const barberHour = barberHours.find((h) => h.dayOfWeek === dayOfWeek);
            if (!barberHour) {
              available = false;
            } else {
              const barberStart = new Date(barberHour.startTime);
              const barberEnd = new Date(barberHour.endTime);
              const barberStartTime = barberStart.getHours() * 60 + barberStart.getMinutes();
              const barberEndTime = barberEnd.getHours() * 60 + barberEnd.getMinutes();

              available = slotTime >= barberStartTime && slotTime + service.durationMinutes <= barberEndTime;
            }
          }

          // Check for conflicts with existing appointments
          if (available) {
            const hasConflict = existingAppointments.some((appointment) => {
              const appointmentStart = new Date(appointment.startTime);
              const appointmentEnd = new Date(appointment.endTime);

              // Check if there's any overlap
              return slotStart < appointmentEnd && slotEnd > appointmentStart;
            });

            if (hasConflict) {
              available = false;
            }
          }

          slots.push({ date: dateStr, time, available });
        }
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return NextResponse.json({ data: slots, error: null });
  } catch (error) {
    console.error('Error fetching availability:', error);
    return NextResponse.json({ data: null, error: 'Failed to fetch availability' }, { status: 500 });
  }
});
