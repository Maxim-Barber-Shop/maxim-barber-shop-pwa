import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, JwtPayload } from './jwt';
import { UserRole } from '@prisma/client';

export interface AuthenticatedRequest extends NextRequest {
  user?: JwtPayload;
}

export function withAuth(handler: (req: AuthenticatedRequest) => Promise<Response>) {
  return async (req: NextRequest) => {
    const authHeader = req.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ data: null, error: 'Non autorizzato' }, { status: 401 });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json({ data: null, error: 'Token non valido' }, { status: 401 });
    }

    // Add user to request
    const authenticatedReq = req as AuthenticatedRequest;
    authenticatedReq.user = payload;

    return handler(authenticatedReq);
  };
}

export function withRole(allowedRoles: UserRole[], handler: (req: AuthenticatedRequest) => Promise<Response>) {
  return withAuth(async (req: AuthenticatedRequest) => {
    // Allow ADMIN to access BARBER routes
    const isAuthorized =
      req.user &&
      (allowedRoles.includes(req.user.role) ||
        (allowedRoles.includes('BARBER' as UserRole) && req.user.role === 'ADMIN'));

    if (!isAuthorized) {
      return NextResponse.json({ data: null, error: 'Accesso negato' }, { status: 403 });
    }

    return handler(req);
  });
}

// Helper function to authenticate a request (for routes with params)
export function authenticateRequest(
  req: NextRequest,
): { authenticated: true; user: JwtPayload } | { authenticated: false; error: NextResponse } {
  const authHeader = req.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      authenticated: false,
      error: NextResponse.json({ data: null, error: 'Non autorizzato' }, { status: 401 }),
    };
  }

  const token = authHeader.substring(7);
  const payload = verifyToken(token);

  if (!payload) {
    return {
      authenticated: false,
      error: NextResponse.json({ data: null, error: 'Token non valido' }, { status: 401 }),
    };
  }

  return { authenticated: true, user: payload };
}
