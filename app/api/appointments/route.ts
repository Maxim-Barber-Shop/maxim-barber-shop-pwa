import { NextRequest, NextResponse } from 'next/server';
import { appointmentService } from '@/lib/api';

// GET /api/appointments - Get all appointments
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const customerId = searchParams.get('customerId');
    const barberId = searchParams.get('barberId');
    const storeId = searchParams.get('storeId');
    const status = searchParams.get('status');
    const upcoming = searchParams.get('upcoming') === 'true';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Filter by customerId
    if (customerId) {
      const { data, error } = await appointmentService.getByCustomerId(customerId);
      if (error) {
        return NextResponse.json({ error }, { status: 500 });
      }
      return NextResponse.json({ data });
    }

    // Filter by barberId
    if (barberId) {
      const { data, error } = await appointmentService.getByBarberId(barberId);
      if (error) {
        return NextResponse.json({ error }, { status: 500 });
      }
      return NextResponse.json({ data });
    }

    // Filter by storeId
    if (storeId) {
      const { data, error } = await appointmentService.getByStoreId(storeId);
      if (error) {
        return NextResponse.json({ error }, { status: 500 });
      }
      return NextResponse.json({ data });
    }

    // Filter by status
    if (status) {
      const { data, error } = await appointmentService.getByStatus(
        status as 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW',
      );
      if (error) {
        return NextResponse.json({ error }, { status: 500 });
      }
      return NextResponse.json({ data });
    }

    // Filter upcoming
    if (upcoming) {
      const { data, error } = await appointmentService.getUpcoming();
      if (error) {
        return NextResponse.json({ error }, { status: 500 });
      }
      return NextResponse.json({ data });
    }

    // Filter by date range
    if (startDate && endDate) {
      const { data, error } = await appointmentService.getByDateRange(
        new Date(startDate),
        new Date(endDate),
        storeId || undefined,
      );
      if (error) {
        return NextResponse.json({ error }, { status: 500 });
      }
      return NextResponse.json({ data });
    }

    // Default: get all
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : undefined;
    const pageSize = searchParams.get('pageSize') ? parseInt(searchParams.get('pageSize')!) : undefined;
    const sortColumn = searchParams.get('sortBy') || 'startTime';
    const sortOrder = searchParams.get('order') || 'asc';

    const pagination = page && pageSize ? { page, pageSize } : undefined;
    const sort = { column: sortColumn, ascending: sortOrder === 'asc' };

    const { data, error } = await appointmentService.getAll(pagination, sort);

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/appointments - Create a new appointment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId, barberId, serviceId, storeId, startTime, endTime, status } = body;

    if (!customerId || !barberId || !serviceId || !storeId || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'customerId, barberId, serviceId, storeId, startTime, and endTime are required' },
        { status: 400 },
      );
    }

    const { data, error } = await appointmentService.create({
      customerId,
      barberId,
      serviceId,
      storeId,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      status: status || 'PENDING',
    });

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
