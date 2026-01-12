import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/api/services/auth.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, phone, password } = body;

    // Validate required fields
    if (!firstName || !lastName || !phone || !password) {
      return NextResponse.json({ error: 'Tutti i campi sono obbligatori' }, { status: 400 });
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json({ error: 'La password deve essere di almeno 6 caratteri' }, { status: 400 });
    }

    const { data, error } = await authService.register({
      firstName,
      lastName,
      phone,
      password,
    });

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('Register API error:', error);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}
