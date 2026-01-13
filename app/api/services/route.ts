import { NextResponse } from 'next/server';
import { serviceService } from '@/lib/api';
import { withAuth, withRole, AuthenticatedRequest } from '@/lib/auth/middleware';

// GET /api/services - Get all services
export const GET = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const searchParams = request.nextUrl.searchParams;
    const barberId = searchParams.get('barberId');
    const category = searchParams.get('category');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const maxDuration = searchParams.get('maxDuration');

    // Filter by barber (optionally also by category)
    if (barberId) {
      const { data, error } = await serviceService.getByBarber(barberId, category || undefined);
      if (error) {
        return NextResponse.json({ error }, { status: 500 });
      }
      return NextResponse.json({ data });
    }

    // Filter by category only
    if (category) {
      const { data, error } = await serviceService.getByCategory(category);
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
});

// POST /api/services - Create a new service (ADMIN only)
export const POST = withRole(['ADMIN'], async (request: AuthenticatedRequest) => {
  try {
    const body = await request.json();
    const { name, description, durationMinutes, price, discountedPrice, category, barberId, storeId } = body;

    if (!name || !durationMinutes || price === undefined || !barberId || !storeId) {
      return NextResponse.json(
        { error: 'name, durationMinutes, price, barberId, and storeId are required' },
        { status: 400 },
      );
    }

    const { data, error } = await serviceService.create({
      name,
      description: description || null,
      durationMinutes: parseInt(durationMinutes),
      price: parseFloat(price),
      discountedPrice: discountedPrice ? parseFloat(discountedPrice) : null,
      category: category || 'CAPELLI',
      barberId,
      storeId,
    });

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
