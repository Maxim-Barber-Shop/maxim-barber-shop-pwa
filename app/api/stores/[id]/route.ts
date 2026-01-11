import { NextRequest, NextResponse } from 'next/server';
import { storeService } from '@/lib/api';

// GET /api/stores/:id - Get store by ID
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const withHours = searchParams.get('withHours') === 'true';

    if (withHours) {
      const { data, error } = await storeService.getWithHours(id);
      if (error) {
        return NextResponse.json({ error }, { status: error === 'Store not found' ? 404 : 500 });
      }
      return NextResponse.json({ data });
    }

    const { data, error } = await storeService.getById(id);

    if (error) {
      return NextResponse.json({ error }, { status: error === 'Record not found' ? 404 : 500 });
    }

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/stores/:id - Update store
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { data, error } = await storeService.update(id, body);

    if (error) {
      return NextResponse.json({ error }, { status: error === 'Record not found' ? 404 : 500 });
    }

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/stores/:id - Delete store
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { error } = await storeService.delete(id);

    if (error) {
      return NextResponse.json({ error }, { status: error === 'Record not found' ? 404 : 500 });
    }

    return NextResponse.json({ message: 'Store deleted successfully' });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
