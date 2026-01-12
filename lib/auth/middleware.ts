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
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return NextResponse.json({ data: null, error: 'Accesso negato' }, { status: 403 });
    }

    return handler(req);
  });
}
