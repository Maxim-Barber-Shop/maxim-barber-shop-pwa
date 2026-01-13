import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { userService } from '@/lib/api';

// GET /api/barbers - Get all barbers (accessible to all authenticated users)
export const GET = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const searchParams = request.nextUrl.searchParams;
    const storeId = searchParams.get('storeId') || undefined;
    const excludeAdmin = searchParams.get('excludeAdmin') === 'true';

    const { data, error } = await userService.getBarbers(storeId, excludeAdmin);

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
