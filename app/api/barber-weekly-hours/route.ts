import { NextResponse } from 'next/server';
import { barberWeeklyHourService } from '@/lib/api';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';

// GET /api/barber-weekly-hours - Get weekly hours for a barber (or all if ADMIN)
export const GET = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const searchParams = request.nextUrl.searchParams;
    let barberId = searchParams.get('barberId');

    // If user is BARBER, force barberId to be their own userId
    if (request.user?.role === 'BARBER') {
      barberId = request.user.userId;
    }

    // If ADMIN and no barberId specified, get all
    if (request.user?.role === 'ADMIN' && !barberId) {
      const { data, error } = await barberWeeklyHourService.getAll();

      if (error) {
        return NextResponse.json({ data: null, error }, { status: 500 });
      }

      return NextResponse.json({ data, error: null });
    }

    if (!barberId) {
      return NextResponse.json({ data: null, error: 'barberId is required' }, { status: 400 });
    }

    const { data, error } = await barberWeeklyHourService.getByBarberId(barberId);

    if (error) {
      return NextResponse.json({ data: null, error }, { status: 500 });
    }

    return NextResponse.json({ data, error: null });
  } catch {
    return NextResponse.json({ data: null, error: 'Internal server error' }, { status: 500 });
  }
});

// POST /api/barber-weekly-hours - Create weekly hour
export const POST = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const body = await request.json();
    // eslint-disable-next-line prefer-const
    let { barberId, storeId, dayOfWeek, startTime, endTime } = body;

    // If user is BARBER, force barberId to be their own userId
    if (request.user?.role === 'BARBER') {
      barberId = request.user.userId;
    }

    if (!barberId || !storeId || dayOfWeek === undefined || !startTime || !endTime) {
      return NextResponse.json(
        { data: null, error: 'barberId, storeId, dayOfWeek, startTime, and endTime are required' },
        { status: 400 },
      );
    }

    // Only BARBER (own hours) or ADMIN can create
    if (request.user?.role === 'BARBER' && barberId !== request.user.userId) {
      return NextResponse.json({ data: null, error: 'Accesso negato' }, { status: 403 });
    }

    const { data, error } = await barberWeeklyHourService.create({
      barberId,
      storeId,
      dayOfWeek,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
    });

    if (error) {
      return NextResponse.json({ data: null, error }, { status: 500 });
    }

    return NextResponse.json({ data, error: null }, { status: 201 });
  } catch {
    return NextResponse.json({ data: null, error: 'Internal server error' }, { status: 500 });
  }
});
