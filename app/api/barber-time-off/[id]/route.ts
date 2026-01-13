import { NextRequest, NextResponse } from 'next/server';
import { barberTimeOffService } from '@/lib/api';
import { verifyToken } from '@/lib/auth/jwt';

// GET /api/barber-time-off/:id - Get time off by ID
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

    const { data, error } = await barberTimeOffService.getById(id);

    if (error) {
      return NextResponse.json({ data: null, error }, { status: error === 'Record not found' ? 404 : 500 });
    }

    // Check if user is accessing their own time off or is ADMIN
    if (user.role === 'BARBER' && data?.barberId !== user.userId) {
      return NextResponse.json({ data: null, error: 'Accesso negato' }, { status: 403 });
    }

    return NextResponse.json({ data, error: null });
  } catch {
    return NextResponse.json({ data: null, error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/barber-time-off/:id - Update time off
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

    // Get existing time off to check ownership
    const existing = await barberTimeOffService.getById(id);
    if (existing.error || !existing.data) {
      return NextResponse.json({ data: null, error: 'Record not found' }, { status: 404 });
    }

    // Check if user is updating their own time off or is ADMIN
    if (user.role === 'BARBER' && existing.data.barberId !== user.userId) {
      return NextResponse.json({ data: null, error: 'Accesso negato' }, { status: 403 });
    }

    const body = await request.json();

    // Convert dates if present
    if (body.startDate) {
      body.startDate = new Date(body.startDate);
    }
    if (body.endDate) {
      body.endDate = new Date(body.endDate);
    }

    const { data, error } = await barberTimeOffService.update(id, body);

    if (error) {
      return NextResponse.json({ data: null, error }, { status: 500 });
    }

    return NextResponse.json({ data, error: null });
  } catch {
    return NextResponse.json({ data: null, error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/barber-time-off/:id - Delete time off
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

    const { id } = await params;

    // Get existing time off to check ownership
    const existing = await barberTimeOffService.getById(id);
    if (existing.error || !existing.data) {
      return NextResponse.json({ data: null, error: 'Record not found' }, { status: 404 });
    }

    // Check if user is deleting their own time off or is ADMIN
    if (user.role === 'BARBER' && existing.data.barberId !== user.userId) {
      return NextResponse.json({ data: null, error: 'Accesso negato' }, { status: 403 });
    }

    const { error } = await barberTimeOffService.delete(id);

    if (error) {
      return NextResponse.json({ data: null, error }, { status: 500 });
    }

    return NextResponse.json({ message: 'Time off deleted successfully' });
  } catch {
    return NextResponse.json({ data: null, error: 'Internal server error' }, { status: 500 });
  }
}
