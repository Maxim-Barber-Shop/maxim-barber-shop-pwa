'use client';

import { BottomNav, NavItem } from '@/components/bottom-nav';
import { TopBar } from '@/components/top-bar';
import { Home, Users, Calendar, UserCheck, Settings } from 'lucide-react';

const adminNavItems: NavItem[] = [
  {
    label: 'Dashboard',
    icon: <Home className="h-6 w-6" />,
    href: '/admin/dashboard',
  },
  {
    label: 'Appuntamenti',
    icon: <Calendar className="h-6 w-6" />,
    href: '/admin/appointments',
  },
  {
    label: 'Barbieri',
    icon: <Users className="h-6 w-6" />,
    href: '/admin/barbers',
  },
  {
    label: 'Clienti',
    icon: <UserCheck className="h-6 w-6" />,
    href: '/admin/clienti',
  },
  {
    label: 'Gestione',
    icon: <Settings className="h-6 w-6" />,
    href: '/admin/gestione',
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TopBar />
      <div className="pb-20 pt-[89px]">{children}</div>
      <BottomNav items={adminNavItems} />
    </>
  );
}
