'use client';

import { BottomNav, NavItem } from '@/components/bottom-nav';
import { TopBar } from '@/components/top-bar';
import { Home, Calendar, Users, User } from 'lucide-react';

const barberNavItems: NavItem[] = [
  {
    label: 'Home',
    icon: <Home className="h-5 w-5" />,
    href: '/barber/dashboard',
  },
  {
    label: 'Appuntamenti',
    icon: <Calendar className="h-5 w-5" />,
    href: '/barber/appointments',
  },
  {
    label: 'Clienti',
    icon: <Users className="h-5 w-5" />,
    href: '/barber/clients',
  },
  {
    label: 'Profilo',
    icon: <User className="h-5 w-5" />,
    href: '/barber/profile',
  },
];

export default function BarberLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TopBar />
      <div className="pb-16 pt-22.25">{children}</div>
      <BottomNav items={barberNavItems} />
    </>
  );
}
