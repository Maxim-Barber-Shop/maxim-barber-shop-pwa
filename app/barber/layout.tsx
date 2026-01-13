'use client';

import { BottomNav, NavItem } from '@/components/bottom-nav';
import { TopBar } from '@/components/top-bar';
import { Home, Calendar, Clock, User } from 'lucide-react';

const barberNavItems: NavItem[] = [
  {
    label: 'Oggi',
    icon: <Home className="h-6 w-6" />,
    href: '/barber/dashboard',
  },
  {
    label: 'Calendario',
    icon: <Calendar className="h-6 w-6" />,
    href: '/barber/calendar',
  },
  {
    label: 'Turni',
    icon: <Clock className="h-6 w-6" />,
    href: '/barber/shifts',
  },
  {
    label: 'Profilo',
    icon: <User className="h-6 w-6" />,
    href: '/barber/profile',
  },
];

export default function BarberLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TopBar />
      <div className="pb-20 pt-[89px]">{children}</div>
      <BottomNav items={barberNavItems} />
    </>
  );
}
