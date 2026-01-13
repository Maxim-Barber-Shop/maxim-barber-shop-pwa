import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { prisma } from '@/lib/prisma';

export const GET = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    let barberId = searchParams.get('barberId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // If user is BARBER, force barberId to be their own userId
    if (request.user?.role === 'BARBER') {
      barberId = request.user.userId;
    }

    if (!barberId || !startDate || !endDate) {
      return NextResponse.json({ data: null, error: 'barberId, startDate, and endDate are required' }, { status: 400 });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Get all appointments in the period
    const appointments = await prisma.appointment.findMany({
      where: {
        barberId,
        startTime: {
          gte: start,
          lte: end,
        },
      },
      include: {
        service: {
          select: {
            price: true,
          },
        },
      },
    });

    // Calculate statistics
    const totalAppointments = appointments.length;
    const completedAppointments = appointments.filter((apt) => apt.status === 'COMPLETED').length;
    const noShowAppointments = appointments.filter((apt) => apt.status === 'NO_SHOW').length;
    const totalRevenue = appointments
      .filter((apt) => apt.status === 'COMPLETED')
      .reduce((sum, apt) => sum + apt.service.price, 0);

    const statistics = {
      totalAppointments,
      completedAppointments,
      noShowAppointments,
      totalRevenue,
    };

    return NextResponse.json({ data: statistics, error: null });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return NextResponse.json({ data: null, error: 'Failed to fetch statistics' }, { status: 500 });
  }
});
