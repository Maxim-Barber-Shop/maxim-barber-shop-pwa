import { NextRequest, NextResponse } from 'next/server';
import { serviceService } from '@/lib/api';

// GET /api/services - Get all services
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const barberId = searchParams.get('barberId');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const maxDuration = searchParams.get('maxDuration');

    // Filter by barber
    if (barberId) {
      const { data, error } = await serviceService.getByBarber(barberId);
      if (error) {
        return NextResponse.json({ error }, { status: 500 });
      }
      return NextResponse.json({ data });
    }

    // Filter by price range
    if (minPrice && maxPrice) {
      const { data, error } = await serviceService.getByPriceRange(parseFloat(minPrice), parseFloat(maxPrice));
      if (error) {
        return NextResponse.json({ error }, { status: 500 });
      }
      return NextResponse.json({ data });
    }

    // Filter by max duration
    if (maxDuration) {
      const { data, error } = await serviceService.getByDuration(parseInt(maxDuration));
      if (error) {
        return NextResponse.json({ error }, { status: 500 });
      }
      return NextResponse.json({ data });
    }

    // Default: get all
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : undefined;
    const pageSize = searchParams.get('pageSize') ? parseInt(searchParams.get('pageSize')!) : undefined;
    const sortColumn = searchParams.get('sortBy') || 'name';
    const sortOrder = searchParams.get('order') || 'asc';

    const pagination = page && pageSize ? { page, pageSize } : undefined;
    const sort = { column: sortColumn, ascending: sortOrder === 'asc' };

    const { data, error } = await serviceService.getAll(pagination, sort);

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/services - Create a new service
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, durationMinutes, price } = body;

    if (!name || !durationMinutes || price === undefined) {
      return NextResponse.json({ error: 'name, durationMinutes, and price are required' }, { status: 400 });
    }

    const { data, error } = await serviceService.create({
      name,
      durationMinutes: parseInt(durationMinutes),
      price: parseFloat(price),
    });

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
