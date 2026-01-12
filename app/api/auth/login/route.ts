import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/api/services/auth.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, password } = body;

    // Validate required fields
    if (!phone || !password) {
      return NextResponse.json({ error: 'Numero di telefono e password sono obbligatori' }, { status: 400 });
    }

    const { data, error } = await authService.login({
      phone,
      password,
    });

    if (error) {
      return NextResponse.json({ error }, { status: 401 });
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}
