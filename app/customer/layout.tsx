'use client';

import { BottomNav, NavItem } from '@/components/bottom-nav';
import { TopBar } from '@/components/top-bar';
import { Home, Calendar, CalendarPlus, User } from 'lucide-react';

const customerNavItems: NavItem[] = [
  {
    label: 'Home',
    icon: <Home className="h-5 w-5" />,
    href: '/customer/dashboard',
  },
  {
    label: 'Prenota',
    icon: <CalendarPlus className="h-5 w-5" />,
    href: '/customer/appointments/new',
  },
  {
    label: 'Appuntamenti',
    icon: <Calendar className="h-5 w-5" />,
    href: '/customer/appointments',
  },
  {
    label: 'Profilo',
    icon: <User className="h-5 w-5" />,
    href: '/customer/profile',
  },
];

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TopBar />
      <div className="pb-16 pt-[89px]">{children}</div>
      <BottomNav items={customerNavItems} />
    </>
  );
}
