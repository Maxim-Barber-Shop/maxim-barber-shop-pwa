'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';

type UserRole = 'CUSTOMER' | 'BARBER' | 'ADMIN';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      // Not logged in, redirect to login
      router.push('/');
    } else if (!isLoading && user) {
      // Allow ADMIN to access BARBER routes
      const hasAccess = allowedRoles.includes(user.role) || (allowedRoles.includes('BARBER') && user.role === 'ADMIN');

      if (!hasAccess) {
        // Logged in but wrong role, redirect to correct dashboard
        if (user.role === 'CUSTOMER') {
          router.push('/customer/dashboard');
        } else if (user.role === 'BARBER') {
          router.push('/barber/dashboard');
        } else if (user.role === 'ADMIN') {
          router.push('/admin/dashboard');
        }
      }
    }
  }, [user, isLoading, allowedRoles, router]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // User not logged in or wrong role
  // Allow ADMIN to access BARBER routes
  const hasAccess =
    user && (allowedRoles.includes(user.role) || (allowedRoles.includes('BARBER') && user.role === 'ADMIN'));

  if (!hasAccess) {
    return null;
  }

  // User has correct role
  return <>{children}</>;
}
