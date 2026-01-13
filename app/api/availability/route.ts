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

    // CHECK BOOKING LIMITS FOR CUSTOMER
    let customerBookingLimits: Map<string, { canBookWeek: boolean; canBookMonth: boolean }> | null = null;
    if (request.user?.role === 'CUSTOMER') {
      const customerId = request.user.userId;

      // Get booking limits from settings
      const weeklyLimitSetting = await prisma.settings.findUnique({
        where: { key: 'booking_limit_per_week' },
      });
      const monthlyLimitSetting = await prisma.settings.findUnique({
        where: { key: 'booking_limit_per_month' },
      });

      const weeklyLimit = weeklyLimitSetting ? parseInt(weeklyLimitSetting.value) : 1;
      const monthlyLimit = monthlyLimitSetting ? parseInt(monthlyLimitSetting.value) : 2;

      // Get customer's existing appointments
      const customerAppointments = await prisma.appointment.findMany({
        where: {
          customerId,
          status: { in: ['CONFIRMED', 'COMPLETED'] },
        },
      });

      // Build a map of dates with booking availability
      customerBookingLimits = new Map();

      const tempDate = new Date(startDate);
      while (tempDate <= endDate) {
        const dateStr = tempDate.toISOString().split('T')[0];

        // Check weekly limit
        const weekStart = new Date(tempDate);
        weekStart.setDate(tempDate.getDate() - tempDate.getDay());
        weekStart.setHours(0, 0, 0, 0);

        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 7);

        const appointmentsThisWeek = customerAppointments.filter((apt) => {
          const aptDate = new Date(apt.startTime);
          return aptDate >= weekStart && aptDate < weekEnd;
        });

        const canBookWeek = appointmentsThisWeek.length < weeklyLimit;

        // Check monthly limit
        const monthStart = new Date(tempDate.getFullYear(), tempDate.getMonth(), 1);
        const monthEnd = new Date(tempDate.getFullYear(), tempDate.getMonth() + 1, 0, 23, 59, 59);

        const appointmentsThisMonth = customerAppointments.filter((apt) => {
          const aptDate = new Date(apt.startTime);
          return aptDate >= monthStart && aptDate <= monthEnd;
        });

        const canBookMonth = appointmentsThisMonth.length < monthlyLimit;

        customerBookingLimits.set(dateStr, { canBookWeek, canBookMonth });

        tempDate.setDate(tempDate.getDate() + 1);
      }
    }

    // Get store hours
    const storeHours = await prisma.storeHour.findMany({
      where: { storeId },
    });

    // Get barber hours if specific barber is selected
    let barberHours = null;
    if (barberId && barberId !== 'any') {
      barberHours = await prisma.barberWeeklyHour.findMany({
        where: {
          barberId,
          storeId, // Filter by store to get only hours for this specific store
        },
      });
    }

    // Get barber time-off periods if specific barber is selected
    let barberTimeOff = null;
    if (barberId && barberId !== 'any') {
      barberTimeOff = await prisma.barberTimeOff.findMany({
        where: {
          barberId,
          OR: [
            {
              startDate: { lte: endDate },
              endDate: { gte: startDate },
            },
          ],
        },
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

    // Smart slot generation: only show slots in actually available time windows
    const slots: AvailabilitySlot[] = [];
    const SLOT_INTERVAL_MINUTES = 15;

    // Helper: convert time to minutes since midnight
    const timeToMinutes = (date: Date) => date.getHours() * 60 + date.getMinutes();

    // Helper: format minutes to HH:MM
    const minutesToTime = (minutes: number) => {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    };

    const now = new Date();

    // Iterate through each day in the range
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      const dateStr = currentDate.toISOString().split('T')[0];

      // Check customer booking limits
      if (customerBookingLimits) {
        const limits = customerBookingLimits.get(dateStr);
        if (limits && (!limits.canBookWeek || !limits.canBookMonth)) {
          // Customer has reached limits for this date - skip
          currentDate.setDate(currentDate.getDate() + 1);
          continue;
        }
      }

      // Get all store hours for this day (can have multiple blocks: morning/afternoon)
      const dayStoreHours = storeHours.filter((h) => h.dayOfWeek === dayOfWeek);
      if (dayStoreHours.length === 0) {
        // Store closed - no slots
        currentDate.setDate(currentDate.getDate() + 1);
        continue;
      }

      // Get barber hours for this day if specific barber selected
      const dayBarberHours = barberHours ? barberHours.filter((h) => h.dayOfWeek === dayOfWeek) : null;
      if (barberHours && (!dayBarberHours || dayBarberHours.length === 0)) {
        // Barber not working this day - no slots
        currentDate.setDate(currentDate.getDate() + 1);
        continue;
      }

      // Merge store and barber hours to get actual working blocks
      const workingBlocks: Array<{ start: number; end: number }> = [];

      for (const storeHour of dayStoreHours) {
        const storeStart = timeToMinutes(new Date(storeHour.openTime));
        const storeEnd = timeToMinutes(new Date(storeHour.closeTime));

        if (dayBarberHours) {
          // If barber is selected, find overlapping barber hours
          for (const barberHour of dayBarberHours) {
            const barberStart = timeToMinutes(new Date(barberHour.startTime));
            const barberEnd = timeToMinutes(new Date(barberHour.endTime));

            // Calculate overlap
            const blockStart = Math.max(storeStart, barberStart);
            const blockEnd = Math.min(storeEnd, barberEnd);

            if (blockStart < blockEnd) {
              workingBlocks.push({ start: blockStart, end: blockEnd });
            }
          }
        } else {
          // No barber selected, use store hours
          workingBlocks.push({ start: storeStart, end: storeEnd });
        }
      }

      // Build list of busy periods from existing appointments
      const busyPeriods: Array<{ start: number; end: number }> = existingAppointments
        .filter((apt) => {
          const aptDate = new Date(apt.startTime).toISOString().split('T')[0];
          return aptDate === dateStr;
        })
        .map((apt) => ({
          start: timeToMinutes(new Date(apt.startTime)),
          end: timeToMinutes(new Date(apt.endTime)),
        }))
        .sort((a, b) => a.start - b.start);

      // Add barber time-off periods as busy slots
      if (barberTimeOff) {
        for (const timeOff of barberTimeOff) {
          const timeOffStart = new Date(timeOff.startDate);
          const timeOffEnd = new Date(timeOff.endDate);
          const dayStart = new Date(currentDate);
          dayStart.setHours(0, 0, 0, 0);
          const dayEnd = new Date(currentDate);
          dayEnd.setHours(23, 59, 59, 999);

          // If time-off overlaps with this day
          if (timeOffStart <= dayEnd && timeOffEnd >= dayStart) {
            // Add entire day as busy (simplified - could be more granular)
            busyPeriods.push({ start: 0, end: 24 * 60 });
          }
        }
      }

      busyPeriods.sort((a, b) => a.start - b.start);

      // Process each working block separately
      for (const workBlock of workingBlocks) {
        // Find free windows within this working block
        const freeWindows: Array<{ start: number; end: number }> = [];
        let currentStart = workBlock.start;

        for (const busy of busyPeriods) {
          // Only consider busy periods that overlap with this working block
          if (busy.end <= workBlock.start || busy.start >= workBlock.end) {
            continue; // No overlap
          }

          // If there's a gap before this busy period
          if (currentStart < busy.start) {
            freeWindows.push({
              start: currentStart,
              end: Math.min(busy.start, workBlock.end),
            });
          }
          currentStart = Math.max(currentStart, busy.end);
        }

        // Add final window if there's time after last busy period
        if (currentStart < workBlock.end) {
          freeWindows.push({ start: currentStart, end: workBlock.end });
        }

        // Generate slots in each free window
        for (const window of freeWindows) {
          const windowDuration = window.end - window.start;

          // Only generate slots if window is big enough for the service
          if (windowDuration >= service.durationMinutes) {
            // Allow slots to exceed closing time by max 30 minutes
            const MAX_OVERTIME_MINUTES = 30;
            const lastPossibleStart = window.end + MAX_OVERTIME_MINUTES - service.durationMinutes;

            for (
              let slotMinutes = window.start;
              slotMinutes <= lastPossibleStart;
              slotMinutes += SLOT_INTERVAL_MINUTES
            ) {
              const slotTime = minutesToTime(slotMinutes);
              const slotStart = new Date(currentDate);
              const [hours, minutes] = slotTime.split(':').map(Number);
              slotStart.setHours(hours, minutes, 0, 0);

              // Verify service doesn't exceed closing time + 30 min
              const slotEndMinutes = slotMinutes + service.durationMinutes;
              if (slotEndMinutes > workBlock.end + MAX_OVERTIME_MINUTES) {
                continue; // Skip this slot, would exceed max overtime
              }

              // Check if slot is in the past
              const isPast = slotStart < now;

              slots.push({
                date: dateStr,
                time: slotTime,
                available: !isPast,
              });
            }
          }
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
