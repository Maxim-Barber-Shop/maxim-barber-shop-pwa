'use client';

import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export interface NavItem {
  label: string;
  icon: React.ReactNode;
  href: string;
}

interface BottomNavProps {
  items: NavItem[];
}

export function BottomNav({ items }: BottomNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="flex h-20 items-center justify-around">
        {items.map((item) => {
          const isActive = pathname === item.href;

          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={cn(
                'flex flex-1 flex-col items-center justify-center gap-1.5 py-2 transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <div className={cn('transition-transform', isActive && 'scale-110')}>{item.icon}</div>
              <span className="text-base font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
