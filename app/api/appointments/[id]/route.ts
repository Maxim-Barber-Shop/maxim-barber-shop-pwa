import { NextRequest, NextResponse } from 'next/server';
import { appointmentService, blacklistService } from '@/lib/api';
import { authenticateRequest } from '@/lib/auth/middleware';

// GET /api/appointments/:id - Get appointment by ID
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Authenticate request
  const auth = authenticateRequest(request);
  if (!auth.authenticated) {
    return auth.error;
  }

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
  // Authenticate request
  const auth = authenticateRequest(request);
  if (!auth.authenticated) {
    return auth.error;
  }
  try {
    const { id } = await params;
    const body = await request.json();

    // Get current appointment to check previous status
    const currentAppointment = await appointmentService.getById(id);
    if (currentAppointment.error || !currentAppointment.data) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    // Convert dateTime string to Date if present
    if (body.dateTime) {
      body.dateTime = new Date(body.dateTime);
    }

    const { data, error } = await appointmentService.update(id, body);

    if (error) {
      return NextResponse.json({ error }, { status: error === 'Record not found' ? 404 : 500 });
    }

    // If status changed to NO_SHOW, add customer to blacklist
    if (body.status === 'NO_SHOW' && currentAppointment.data.status !== 'NO_SHOW' && data) {
      try {
        await blacklistService.create({
          customerId: data.customerId,
          appointmentId: id,
          reason: 'NO_SHOW',
          notes: "Cliente non si è presentato all'appuntamento",
        });
      } catch (blacklistError) {
        console.error('Error adding to blacklist:', blacklistError);
        // Continue even if blacklist fails
      }
    }

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/appointments/:id - Delete appointment
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Authenticate request
  const auth = authenticateRequest(request);
  if (!auth.authenticated) {
    return auth.error;
  }
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
