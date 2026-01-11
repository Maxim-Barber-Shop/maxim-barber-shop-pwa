import { NextRequest, NextResponse } from 'next/server';
import { appointmentService } from '@/lib/api';

// GET /api/appointments/:id - Get appointment by ID
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { data, error } = await appointmentService.getById(id);

    if (error) {
      return NextResponse.json({ error }, { status: error === 'Record not found' ? 404 : 500 });
    }

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/appointments/:id - Update appointment
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Convert dateTime string to Date if present
    if (body.dateTime) {
      body.dateTime = new Date(body.dateTime);
    }

    const { data, error } = await appointmentService.update(id, body);

    if (error) {
      return NextResponse.json({ error }, { status: error === 'Record not found' ? 404 : 500 });
    }

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/appointments/:id - Delete appointment
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { error } = await appointmentService.delete(id);

    if (error) {
      return NextResponse.json({ error }, { status: error === 'Record not found' ? 404 : 500 });
    }

    return NextResponse.json({ message: 'Appointment deleted successfully' });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
