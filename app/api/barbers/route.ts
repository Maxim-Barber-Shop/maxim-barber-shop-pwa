import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { userService } from '@/lib/api';

// GET /api/barbers - Get all barbers (accessible to all authenticated users)
export const GET = withAuth(async () => {
  try {
    const { data, error } = await userService.getBarbers();

    if (error) {
      return NextResponse.json({ data: null, error }, { status: 500 });
    }

    // Remove sensitive information before sending
    const barbersWithoutPassword = data?.map((barber) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...barberWithoutPassword } = barber;
      return barberWithoutPassword;
    });

    return NextResponse.json({ data: barbersWithoutPassword, error: null });
  } catch {
    return NextResponse.json({ data: null, error: 'Internal server error' }, { status: 500 });
  }
});
