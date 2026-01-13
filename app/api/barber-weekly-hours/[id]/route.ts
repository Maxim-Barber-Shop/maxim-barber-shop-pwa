import { NextRequest, NextResponse } from 'next/server';
import { barberWeeklyHourService } from '@/lib/api';
import { verifyToken } from '@/lib/auth/jwt';

// GET /api/barber-weekly-hours/:id - Get weekly hour by ID
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

    const { data, error } = await barberWeeklyHourService.getById(id);

    if (error) {
      return NextResponse.json({ data: null, error }, { status: error === 'Record not found' ? 404 : 500 });
    }

    // Check if user is accessing their own hours or is ADMIN
    if (user.role === 'BARBER' && data?.barberId !== user.userId) {
      return NextResponse.json({ data: null, error: 'Accesso negato' }, { status: 403 });
    }

    return NextResponse.json({ data, error: null });
  } catch {
    return NextResponse.json({ data: null, error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/barber-weekly-hours/:id - Update weekly hour
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

    // Get existing hour to check ownership
    const existing = await barberWeeklyHourService.getById(id);
    if (existing.error || !existing.data) {
      return NextResponse.json({ data: null, error: 'Record not found' }, { status: 404 });
    }

    // Check if user is updating their own hours or is ADMIN
    if (user.role === 'BARBER' && existing.data.barberId !== user.userId) {
      return NextResponse.json({ data: null, error: 'Accesso negato' }, { status: 403 });
    }

    const body = await request.json();

    // Convert dates if present
    if (body.startTime) {
      body.startTime = new Date(body.startTime);
    }
    if (body.endTime) {
      body.endTime = new Date(body.endTime);
    }

    const { data, error } = await barberWeeklyHourService.update(id, body);

    if (error) {
      return NextResponse.json({ data: null, error }, { status: 500 });
    }

    return NextResponse.json({ data, error: null });
  } catch {
    return NextResponse.json({ data: null, error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/barber-weekly-hours/:id - Delete weekly hour
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

    // Get existing hour to check ownership
    const existing = await barberWeeklyHourService.getById(id);
    if (existing.error || !existing.data) {
      return NextResponse.json({ data: null, error: 'Record not found' }, { status: 404 });
    }

    // Check if user is deleting their own hours or is ADMIN
    if (user.role === 'BARBER' && existing.data.barberId !== user.userId) {
      return NextResponse.json({ data: null, error: 'Accesso negato' }, { status: 403 });
    }

    const { error } = await barberWeeklyHourService.delete(id);

    if (error) {
      return NextResponse.json({ data: null, error }, { status: 500 });
    }

    return NextResponse.json({ message: 'Weekly hour deleted successfully' });
  } catch {
    return NextResponse.json({ data: null, error: 'Internal server error' }, { status: 500 });
  }
}
