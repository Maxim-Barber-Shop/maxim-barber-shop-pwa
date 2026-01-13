'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { ProtectedRoute } from '@/components/protected-route';
import { CalendarPlus, Calendar, User, Clock, MapPin } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Appointment {
  id: string;
  startTime: string;
  endTime: string;
  status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
  service: {
    name: string;
    price: number;
  };
  barber: {
    firstName: string;
    lastName: string;
  };
  store: {
    name: string;
    address: string;
  };
}

function CustomerDashboardContent() {
  const router = useRouter();
  const { user, getToken } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadAppointments = async () => {
    setIsLoading(true);
    try {
      const token = getToken();
      const response = await fetch('/api/appointments', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (result.data) {
        setAppointments(result.data);
      }
    } catch (err) {
      console.error('Error loading appointments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('it-IT', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      }),
      time: date.toLocaleTimeString('it-IT', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
  };

  const getCityFromAddress = (address: string) => {
    const parts = address.split(',')[1]?.trim().split(' ');
    return parts?.[parts.length - 2] || address;
  };

  const now = new Date();
  const upcomingAppointments = appointments.filter(
    (apt) => new Date(apt.startTime) > now && apt.status === 'CONFIRMED',
  );
  const nextAppointment = upcomingAppointments.sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
  )[0];

  const confirmedCount = appointments.filter((apt) => apt.status === 'CONFIRMED').length;
  const completedCount = appointments.filter((apt) => apt.status === 'COMPLETED').length;
  const cancelledCount = appointments.filter((apt) => apt.status === 'CANCELLED').length;

  return (
    <div className="min-h-[calc(100vh-153px)] bg-background">
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
              <h3 className="text-xl font-bold text-foreground">Appuntamenti prenotati</h3>
            </div>
            <p className="text-sm text-muted-foreground">Gestisci Prenotazioni</p>
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

        {/* Stato Prenotazioni - Compatto */}
        {!isLoading && (
          <div className="mt-6">
            <Card className="border-muted bg-muted/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium text-muted-foreground">Stato Prenotazioni</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Next Appointment */}
                {nextAppointment && (
                  <div className="rounded-lg bg-card/50 border border-muted p-3">
                    <p className="text-xs text-muted-foreground mb-2">Prossimo appuntamento</p>
                    <div className="space-y-1">
                      <p className="font-medium text-sm">{nextAppointment.service.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>
                          {formatDateTime(nextAppointment.startTime).date} alle{' '}
                          {formatDateTime(nextAppointment.startTime).time}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>{getCityFromAddress(nextAppointment.store.address)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Status Counters - Compact with muted colors */}
                <div className="flex gap-2 flex-wrap">
                  {confirmedCount > 0 && (
                    <div className="inline-flex items-center gap-1.5 rounded-md bg-emerald-950/40 px-2.5 py-1 text-xs">
                      <span className="font-medium text-emerald-200">{confirmedCount}</span>
                      <span className="text-emerald-300/70">Confermati</span>
                    </div>
                  )}
                  {completedCount > 0 && (
                    <div className="inline-flex items-center gap-1.5 rounded-md bg-blue-950/40 px-2.5 py-1 text-xs">
                      <span className="font-medium text-blue-200">{completedCount}</span>
                      <span className="text-blue-300/70">Completati</span>
                    </div>
                  )}
                  {cancelledCount > 0 && (
                    <div className="inline-flex items-center gap-1.5 rounded-md bg-slate-800/40 px-2.5 py-1 text-xs">
                      <span className="font-medium text-slate-200">{cancelledCount}</span>
                      <span className="text-slate-300/70">Annullati</span>
                    </div>
                  )}
                  {appointments.length === 0 && <p className="text-xs text-muted-foreground">Nessuna prenotazione</p>}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
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
