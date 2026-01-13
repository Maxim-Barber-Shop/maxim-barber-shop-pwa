'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Users, Scissors } from 'lucide-react';

export function TopBar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const homeUrl =
    user?.role === 'ADMIN'
      ? '/admin/dashboard'
      : user?.role === 'CUSTOMER'
        ? '/customer/dashboard'
        : '/barber/dashboard';

  const isAdminView = pathname?.startsWith('/admin');
  const isBarberView = pathname?.startsWith('/barber');

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b bg-card">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <Link href={homeUrl} className="flex items-center">
          <Image src="/logo_maxim.png" alt="Maxim Barber Studio" width={120} height={120} priority />
        </Link>

        {/* Role Switcher - Only visible for ADMIN users */}
        {user?.role === 'ADMIN' && (
          <div className="flex items-center gap-1 rounded-lg border bg-background p-1">
            <Button
              variant={isAdminView ? 'default' : 'ghost'}
              size="sm"
              onClick={() => router.push('/admin/dashboard')}
              className="gap-2"
            >
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Admin</span>
            </Button>
            <Button
              variant={isBarberView ? 'default' : 'ghost'}
              size="sm"
              onClick={() => router.push('/barber/dashboard')}
              className="gap-2"
            >
              <Scissors className="h-4 w-4" />
              <span className="hidden sm:inline">Barber</span>
            </Button>
          </div>
        )}

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-muted-foreground">{user?.phone}</p>
          </div>
          <Button variant="outline" size="sm" onClick={logout}>
            Esci
          </Button>
        </div>
      </div>
    </header>
  );
}
