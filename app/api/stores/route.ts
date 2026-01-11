import { NextRequest, NextResponse } from 'next/server';
import { storeService } from '@/lib/api';

// GET /api/stores - Get all stores
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const city = searchParams.get('city');
    const withHours = searchParams.get('withHours') === 'true';

    // Filter by city
    if (city) {
      const { data, error } = await storeService.searchByCity(city);
      if (error) {
        return NextResponse.json({ error }, { status: 500 });
      }
      return NextResponse.json({ data });
    }

    // Get all with hours
    if (withHours) {
      const { data, error } = await storeService.getAllWithHours();
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

    const { data, error } = await storeService.getAll(pagination, sort);

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/stores - Create a new store
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, address } = body;

    if (!name || !address) {
      return NextResponse.json({ error: 'name and address are required' }, { status: 400 });
    }

    const { data, error } = await storeService.create({ name, address });

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
