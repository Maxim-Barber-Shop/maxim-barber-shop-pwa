'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { ProtectedRoute } from '@/components/protected-route';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarPlus, Calendar, Clock, MapPin, User, X, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

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

function CustomerAppointmentsContent() {
  const router = useRouter();
  const { getToken } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const getCityFromAddress = (address: string) => {
    // Extract city from address format: "Via Roma 123, 65121 Pescara PE"
    const parts = address.split(',')[1]?.trim().split(' ');
    return parts?.[parts.length - 2] || address;
  };

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

  const handleCancel = async (appointmentId: string) => {
    if (!confirm('Sei sicuro di voler annullare questo appuntamento?')) return;

    setCancellingId(appointmentId);
    try {
      const token = getToken();
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'CANCELLED' }),
      });

      if (response.ok) {
        await loadAppointments();
      } else {
        alert("Errore durante l'annullamento dell'appuntamento");
      }
    } catch (err) {
      console.error('Error cancelling appointment:', err);
      alert("Errore durante l'annullamento dell'appuntamento");
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'Confermato';
      case 'CANCELLED':
        return 'Annullato';
      case 'COMPLETED':
        return 'Completato';
      case 'NO_SHOW':
        return 'Non Presentato';
      default:
        return status;
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('it-IT', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      time: date.toLocaleTimeString('it-IT', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
  };

  const now = new Date();
  const upcomingAppointments = appointments.filter(
    (apt) => new Date(apt.startTime) > now && apt.status !== 'CANCELLED' && apt.status !== 'COMPLETED',
  );
  const pastAppointments = appointments.filter(
    (apt) => new Date(apt.startTime) <= now || apt.status === 'CANCELLED' || apt.status === 'COMPLETED',
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-4">
          <div className="mb-6">
            <h1 className="mb-2 text-3xl font-bold">I Miei Appuntamenti</h1>
            <p className="text-muted-foreground">Gestisci le tue prenotazioni</p>
          </div>
          <div className="py-12 text-center text-muted-foreground">Caricamento...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <main className="container mx-auto px-4 py-4">
        <div className="mb-6">
          <h1 className="mb-2 text-3xl font-bold">I Miei Appuntamenti</h1>
          <p className="text-muted-foreground">Gestisci le tue prenotazioni</p>
        </div>

        {/* Upcoming Appointments */}
        <div className="mb-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">Prossimi Appuntamenti</h2>
            <Button onClick={() => router.push('/customer/appointments/new')} size="icon">
              <Plus className="h-5 w-5" />
            </Button>
          </div>

          {upcomingAppointments.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CalendarPlus className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <p className="mb-2 text-muted-foreground">Non hai appuntamenti in programma</p>
                <p className="mb-4 text-sm text-muted-foreground">Prenota il tuo primo appuntamento!</p>
                <Button onClick={() => router.push('/customer/appointments/new')}>Prenota Ora</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => {
                const { date, time } = formatDateTime(appointment.startTime);
                return (
                  <Card key={appointment.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{appointment.service.name}</CardTitle>
                          <CardDescription>
                            <span
                              className={`mt-2 inline-block rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(appointment.status)}`}
                            >
                              {getStatusLabel(appointment.status)}
                            </span>
                          </CardDescription>
                        </div>
                        {appointment.status !== 'CANCELLED' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCancel(appointment.id)}
                            disabled={cancellingId === appointment.id}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <User className="h-4 w-4" />
                        <span>
                          {appointment.barber.firstName} {appointment.barber.lastName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{getCityFromAddress(appointment.store.address)}</span>
                      </div>
                      <div className="pt-2 text-base font-semibold">€{appointment.service.price.toFixed(2)}</div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Past Appointments */}
        <div>
          <h2 className="mb-4 text-xl font-bold">Storico Appuntamenti</h2>
          {pastAppointments.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <p>Nessuno storico disponibile</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pastAppointments.map((appointment) => {
                const { date, time } = formatDateTime(appointment.startTime);
                return (
                  <Card key={appointment.id} className="opacity-75">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{appointment.service.name}</CardTitle>
                          <CardDescription>
                            <span
                              className={`mt-2 inline-block rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(appointment.status)}`}
                            >
                              {getStatusLabel(appointment.status)}
                            </span>
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <User className="h-4 w-4" />
                        <span>
                          {appointment.barber.firstName} {appointment.barber.lastName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{getCityFromAddress(appointment.store.address)}</span>
                      </div>
                      <div className="pt-2 text-base font-semibold">€{appointment.service.price.toFixed(2)}</div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function CustomerAppointmentsPage() {
  return (
    <ProtectedRoute allowedRoles={['CUSTOMER']}>
      <CustomerAppointmentsContent />
    </ProtectedRoute>
  );
}
