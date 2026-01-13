import { NextResponse } from 'next/server';
import { barberTimeOffService } from '@/lib/api';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { prisma } from '@/lib/prisma';

// GET /api/barber-time-off - Get time off for a barber (or all if ADMIN)
export const GET = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const searchParams = request.nextUrl.searchParams;
    let barberId = searchParams.get('barberId');
    const upcoming = searchParams.get('upcoming') === 'true';

    // If user is BARBER, force barberId to be their own userId
    if (request.user?.role === 'BARBER') {
      barberId = request.user.userId;
    }

    // If ADMIN and no barberId specified, get all
    if (request.user?.role === 'ADMIN' && !barberId) {
      const { data, error } = await barberTimeOffService.getAll();

      if (error) {
        return NextResponse.json({ data: null, error }, { status: 500 });
      }

      return NextResponse.json({ data, error: null });
    }

    if (!barberId) {
      return NextResponse.json({ data: null, error: 'barberId is required' }, { status: 400 });
    }

    let data, error;

    if (upcoming) {
      ({ data, error } = await barberTimeOffService.getUpcomingTimeOff(barberId));
    } else {
      ({ data, error } = await barberTimeOffService.getByBarberId(barberId));
    }

    if (error) {
      return NextResponse.json({ data: null, error }, { status: 500 });
    }

    return NextResponse.json({ data, error: null });
  } catch {
    return NextResponse.json({ data: null, error: 'Internal server error' }, { status: 500 });
  }
});

// POST /api/barber-time-off - Create time off
export const POST = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const body = await request.json();
    // eslint-disable-next-line prefer-const
    let { barberId, startDate, endDate, reason } = body;

    // If user is BARBER, force barberId to be their own userId
    if (request.user?.role === 'BARBER') {
      barberId = request.user.userId;
    }

    if (!barberId || !startDate || !endDate) {
      return NextResponse.json({ data: null, error: 'barberId, startDate, and endDate are required' }, { status: 400 });
    }

    // Only BARBER (own time off) or ADMIN can create
    if (request.user?.role === 'BARBER' && barberId !== request.user.userId) {
      return NextResponse.json({ data: null, error: 'Accesso negato' }, { status: 403 });
    }

    const { data, error } = await barberTimeOffService.create({
      barberId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason: reason || null,
    });

    if (error) {
      return NextResponse.json({ data: null, error }, { status: 500 });
    }

    // Cancel all CONFIRMED appointments for this barber during the time-off period
    try {
      await prisma.appointment.updateMany({
        where: {
          barberId,
          status: 'CONFIRMED',
          startTime: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        },
        data: {
          status: 'CANCELLED',
        },
      });
    } catch (cancelError) {
      console.error('Error cancelling appointments during time-off:', cancelError);
      // Continue even if cancellation fails - time-off was created
    }

    return NextResponse.json({ data, error: null }, { status: 201 });
  } catch {
    return NextResponse.json({ data: null, error: 'Internal server error' }, { status: 500 });
  }
});
