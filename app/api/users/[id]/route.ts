import { NextRequest, NextResponse } from 'next/server';
import { userService } from '@/lib/api';

// GET /api/users/:id - Get user by ID
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
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
    const { id } = await params;
    const body = await request.json();

    const { data, error } = await userService.update(id, body);

    if (error) {
      return NextResponse.json({ error }, { status: error === 'Record not found' ? 404 : 500 });
    }

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/users/:id - Delete user
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
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
