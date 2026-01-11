import { NextRequest, NextResponse } from 'next/server';
import { userService } from '@/lib/api';

// GET /api/users - Get all users
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const role = searchParams.get('role');
    const search = searchParams.get('search');

    // Filter by role
    if (role) {
      const { data, error } = await userService.getByRole(role as 'CUSTOMER' | 'BARBER' | 'ADMIN');
      if (error) {
        return NextResponse.json({ error }, { status: 500 });
      }
      return NextResponse.json({ data });
    }

    // Search by name
    if (search) {
      const { data, error } = await userService.searchByName(search);
      if (error) {
        return NextResponse.json({ error }, { status: 500 });
      }
      return NextResponse.json({ data });
    }

    // Default: get all
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : undefined;
    const pageSize = searchParams.get('pageSize') ? parseInt(searchParams.get('pageSize')!) : undefined;
    const sortColumn = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('order') || 'desc';

    const pagination = page && pageSize ? { page, pageSize } : undefined;
    const sort = { column: sortColumn, ascending: sortOrder === 'asc' };

    const { data, error } = await userService.getAll(pagination, sort);

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/users - Create a new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, phone, role } = body;

    if (!firstName || !lastName || !phone || !role) {
      return NextResponse.json({ error: 'firstName, lastName, phone, and role are required' }, { status: 400 });
    }

    const { data, error } = await userService.create({ firstName, lastName, phone, role });

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
