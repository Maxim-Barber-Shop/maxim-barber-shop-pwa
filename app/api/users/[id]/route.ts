import { NextRequest, NextResponse } from 'next/server';
import { userService } from '@/lib/api';
import { verifyToken } from '@/lib/auth/jwt';

// GET /api/users/:id - Get user by ID
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ data: null, error: 'Non autorizzato' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ data: null, error: 'Token non valido' }, { status: 401 });
    }

    const { id } = await params;

    // Check if user is accessing their own profile or is ADMIN/BARBER
    if (user.userId !== id && !['ADMIN', 'BARBER'].includes(user.role)) {
      return NextResponse.json({ data: null, error: 'Accesso negato' }, { status: 403 });
    }

    const { data, error } = await userService.getById(id);

    if (error) {
      return NextResponse.json({ error }, { status: error === 'Record not found' ? 404 : 500 });
    }

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/users/:id - Update user
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ data: null, error: 'Non autorizzato' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ data: null, error: 'Token non valido' }, { status: 401 });
    }

    const { id } = await params;

    // Check if user is updating their own profile or is ADMIN
    if (user.userId !== id && user.role !== 'ADMIN') {
      return NextResponse.json({ data: null, error: 'Accesso negato' }, { status: 403 });
    }

    const body = await request.json();

    const { data, error } = await userService.update(id, body);

    if (error) {
      return NextResponse.json({ error }, { status: error === 'Record not found' ? 404 : 500 });
    }

    // Remove password from response
    if (data) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userWithoutPassword } = data;
      return NextResponse.json({ data: userWithoutPassword });
    }

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/users/:id - Delete user (ADMIN only)
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ data: null, error: 'Non autorizzato' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ data: null, error: 'Token non valido' }, { status: 401 });
    }

    // Only ADMIN can delete users
    if (user.role !== 'ADMIN') {
      return NextResponse.json({ data: null, error: 'Accesso negato' }, { status: 403 });
    }

    const { id } = await params;
    const { error } = await userService.delete(id);

    if (error) {
      return NextResponse.json({ error }, { status: error === 'Record not found' ? 404 : 500 });
    }

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
