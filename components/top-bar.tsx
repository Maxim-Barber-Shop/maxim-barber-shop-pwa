'use client';

import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';

export function TopBar() {
  const { user, logout } = useAuth();

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b bg-card">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <div>
          <h1 className="text-2xl font-bold">MAXIM</h1>
          <p className="text-sm text-muted-foreground">Barber Shop</p>
        </div>
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
