import { NextRequest, NextResponse } from 'next/server';
import { serviceService } from '@/lib/api';

// GET /api/services/:id - Get service by ID
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { data, error } = await serviceService.getById(id);

    if (error) {
      return NextResponse.json({ error }, { status: error === 'Record not found' ? 404 : 500 });
    }

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/services/:id - Update service
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Convert numeric fields if present
    if (body.durationMinutes) body.durationMinutes = parseInt(body.durationMinutes);
    if (body.price) body.price = parseFloat(body.price);
    if (body.discountedPrice !== undefined) {
      body.discountedPrice = body.discountedPrice ? parseFloat(body.discountedPrice) : null;
    }

    const { data, error } = await serviceService.update(id, body);

    if (error) {
      return NextResponse.json({ error }, { status: error === 'Record not found' ? 404 : 500 });
    }

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/services/:id - Delete service
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { error } = await serviceService.delete(id);

    if (error) {
      return NextResponse.json({ error }, { status: error === 'Record not found' ? 404 : 500 });
    }

    return NextResponse.json({ message: 'Service deleted successfully' });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
