import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { prisma } from '@/lib/prisma';
import { appointmentService } from '@/lib/api';

// GET /api/appointments/check-limits - Check booking limits for current customer
export const GET = withAuth(async (request: AuthenticatedRequest) => {
  try {
    // Only customers can check their own limits
    if (request.user?.role !== 'CUSTOMER') {
      return NextResponse.json({ data: null, error: 'Only customers can check booking limits' }, { status: 403 });
    }

    const customerId = request.user.userId;
    const now = new Date();

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
    const { data: existingAppointments } = await appointmentService.getByCustomerId(customerId);

    const confirmedAppointments =
      existingAppointments?.filter((apt) => apt.status === 'CONFIRMED' || apt.status === 'COMPLETED') || [];

    // Calculate this week's appointments
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    const appointmentsThisWeek = confirmedAppointments.filter((apt) => {
      const aptDate = new Date(apt.startTime);
      return aptDate >= weekStart && aptDate < weekEnd;
    });

    // Calculate this month's appointments
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const appointmentsThisMonth = confirmedAppointments.filter((apt) => {
      const aptDate = new Date(apt.startTime);
      return aptDate >= monthStart && aptDate <= monthEnd;
    });

    return NextResponse.json({
      data: {
        weeklyLimit,
        monthlyLimit,
        appointmentsThisWeek: appointmentsThisWeek.length,
        appointmentsThisMonth: appointmentsThisMonth.length,
        canBookThisWeek: appointmentsThisWeek.length < weeklyLimit,
        canBookThisMonth: appointmentsThisMonth.length < monthlyLimit,
        canBook: appointmentsThisWeek.length < weeklyLimit && appointmentsThisMonth.length < monthlyLimit,
      },
      error: null,
    });
  } catch (error) {
    console.error('Error checking booking limits:', error);
    return NextResponse.json({ data: null, error: 'Failed to check booking limits' }, { status: 500 });
  }
});
