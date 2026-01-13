'use client';

import { BottomNav, NavItem } from '@/components/bottom-nav';
import { TopBar } from '@/components/top-bar';
import { Home, Calendar, CalendarPlus, User } from 'lucide-react';

const customerNavItems: NavItem[] = [
  {
    label: 'Home',
    icon: <Home className="h-6 w-6" />,
    href: '/customer/dashboard',
  },
  {
    label: 'Prenota',
    icon: <CalendarPlus className="h-6 w-6" />,
    href: '/customer/appointments/new',
  },
  {
    label: 'Appuntamenti',
    icon: <Calendar className="h-6 w-6" />,
    href: '/customer/appointments',
  },
  {
    label: 'Profilo',
    icon: <User className="h-6 w-6" />,
    href: '/customer/profile',
  },
];

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TopBar />
      <div className="pb-20 pt-[89px]">{children}</div>
      <BottomNav items={customerNavItems} />
    </>
  );
}
