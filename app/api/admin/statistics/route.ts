import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { prisma } from '@/lib/prisma';

export const GET = withAuth(async (request: AuthenticatedRequest) => {
  try {
    // Only ADMIN can access
    if (request.user?.role !== 'ADMIN') {
      return NextResponse.json({ data: null, error: 'Accesso negato' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const storeId = searchParams.get('storeId');

    if (!startDate || !endDate) {
      return NextResponse.json({ data: null, error: 'startDate and endDate are required' }, { status: 400 });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Build where clause
    const where: {
      startTime: { gte: Date; lte: Date };
      storeId?: string;
    } = {
      startTime: {
        gte: start,
        lte: end,
      },
    };

    if (storeId) {
      where.storeId = storeId;
    }

    // Get all appointments in the period
    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
            price: true,
            durationMinutes: true,
          },
        },
        barber: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        store: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Calculate global statistics
    const totalAppointments = appointments.length;
    const completedAppointments = appointments.filter((apt) => apt.status === 'COMPLETED').length;
    const cancelledAppointments = appointments.filter((apt) => apt.status === 'CANCELLED').length;
    const noShowAppointments = appointments.filter((apt) => apt.status === 'NO_SHOW').length;
    const confirmedAppointments = appointments.filter((apt) => apt.status === 'CONFIRMED').length;

    const totalRevenue = appointments
      .filter((apt) => apt.status === 'COMPLETED')
      .reduce((sum, apt) => sum + apt.service.price, 0);

    const averageRevenuePerAppointment = completedAppointments > 0 ? totalRevenue / completedAppointments : 0;

    // Revenue by barber
    const revenueByBarber = appointments.reduce(
      (acc, apt) => {
        const barberId = apt.barber.id;
        const barberName = `${apt.barber.firstName} ${apt.barber.lastName}`;
        if (!acc[barberId]) {
          acc[barberId] = {
            barberId,
            barberName,
            revenue: 0,
            totalAppointments: 0,
            completedAppointments: 0,
            appointments: 0,
          };
        }
        acc[barberId].totalAppointments += 1;
        if (apt.status === 'COMPLETED') {
          acc[barberId].revenue += apt.service.price;
          acc[barberId].completedAppointments += 1;
          acc[barberId].appointments += 1; // for backwards compatibility
        }
        return acc;
      },
      {} as Record<
        string,
        {
          barberId: string;
          barberName: string;
          revenue: number;
          totalAppointments: number;
          completedAppointments: number;
          appointments: number;
        }
      >,
    );

    // Revenue by store
    const revenueByStore = appointments
      .filter((apt) => apt.status === 'COMPLETED')
      .reduce(
        (acc, apt) => {
          const storeId = apt.store.id;
          const storeName = apt.store.name;
          if (!acc[storeId]) {
            acc[storeId] = { storeId, storeName, revenue: 0, appointments: 0 };
          }
          acc[storeId].revenue += apt.service.price;
          acc[storeId].appointments += 1;
          return acc;
        },
        {} as Record<string, { storeId: string; storeName: string; revenue: number; appointments: number }>,
      );

    // Map appointments for list view
    const appointmentsList = appointments
      .map((apt) => ({
        id: apt.id,
        startTime: apt.startTime,
        endTime: apt.endTime,
        status: apt.status,
        customer: apt.customer,
        barber: apt.barber,
        service: apt.service,
        store: apt.store,
      }))
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime());

    const statistics = {
      totalAppointments,
      completedAppointments,
      cancelledAppointments,
      noShowAppointments,
      confirmedAppointments,
      totalRevenue,
      averageRevenuePerAppointment,
      revenueByBarber: Object.values(revenueByBarber).sort((a, b) => b.revenue - a.revenue),
      revenueByStore: Object.values(revenueByStore).sort((a, b) => b.revenue - a.revenue),
      appointments: appointmentsList,
    };

    return NextResponse.json({ data: statistics, error: null });
  } catch (error) {
    console.error('Error fetching admin statistics:', error);
    return NextResponse.json({ data: null, error: 'Failed to fetch statistics' }, { status: 500 });
  }
});
