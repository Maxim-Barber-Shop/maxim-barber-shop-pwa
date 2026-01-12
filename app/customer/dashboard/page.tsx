'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { ProtectedRoute } from '@/components/protected-route';
import { CalendarPlus, Calendar, User } from 'lucide-react';

function CustomerDashboardContent() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <main className="container mx-auto px-4 py-4">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">Ciao, {user?.firstName}!</h1>
          <p className="text-muted-foreground">Cosa vuoi fare oggi?</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {/* Nuovo Appuntamento - PRINCIPALE */}
          <button
            onClick={() => router.push('/customer/appointments/new')}
            className="group relative overflow-hidden rounded-xl border-2 border-primary bg-primary p-6 text-left hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
          >
            <div className="flex items-center gap-3 mb-4">
              <CalendarPlus className="h-6 w-6 text-primary-foreground" />
              <h3 className="text-xl font-bold text-primary-foreground">Prenota</h3>
            </div>
            <p className="text-sm text-primary-foreground/80">Nuovo appuntamento</p>
          </button>

          {/* I Miei Appuntamenti */}
          <button
            onClick={() => router.push('/customer/appointments')}
            className="group relative overflow-hidden rounded-xl border-2 border-border bg-card p-6 text-left hover:border-primary/50 hover:shadow-lg transition-all duration-200"
          >
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="h-6 w-6 text-foreground" />
              <h3 className="text-xl font-bold text-foreground">Appuntamenti</h3>
            </div>
            <p className="text-sm text-muted-foreground">Gestisci prenotazioni</p>
          </button>

          {/* Profilo */}
          <button
            onClick={() => router.push('/customer/profile')}
            className="group relative overflow-hidden rounded-xl border-2 border-border bg-card p-6 text-left hover:border-primary/50 hover:shadow-lg transition-all duration-200"
          >
            <div className="flex items-center gap-3 mb-4">
              <User className="h-6 w-6 text-foreground" />
              <h3 className="text-xl font-bold text-foreground">Profilo</h3>
            </div>
            <p className="text-sm text-muted-foreground">Dati personali</p>
          </button>
        </div>
      </main>
    </div>
  );
}

export default function CustomerDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['CUSTOMER']}>
      <CustomerDashboardContent />
    </ProtectedRoute>
  );
}
