'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { ProtectedRoute } from '@/components/protected-route';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, MapPin, User, Check, X, Phone } from 'lucide-react';

interface Appointment {
  id: string;
  startTime: string;
  endTime: string;
  status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
  service: {
    name: string;
    price: number;
  };
  customer: {
    firstName: string;
    lastName: string;
    phone: string;
  };
  store: {
    name: string;
    address: string;
  };
}

function BarberAppointmentsContent() {
  const { user, getToken } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    loadAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadAppointments = async () => {
    setIsLoading(true);
    try {
      const token = getToken();
      const response = await fetch(`/api/appointments?barberId=${user?.id}`, {
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

  const handleUpdateStatus = async (appointmentId: string, status: 'COMPLETED' | 'NO_SHOW') => {
    setUpdatingId(appointmentId);
    try {
      const token = getToken();
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        await loadAppointments();
      } else {
        alert("Errore durante l'aggiornamento dello stato");
      }
    } catch (err) {
      console.error('Error updating appointment status:', err);
      alert("Errore durante l'aggiornamento dello stato");
    } finally {
      setUpdatingId(null);
    }
  };

  const getCityFromAddress = (address: string) => {
    const parts = address.split(',')[1]?.trim().split(' ');
    return parts?.[parts.length - 2] || address;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('it-IT', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
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

  const now = new Date();
  const upcomingAppointments = appointments.filter(
    (apt) => new Date(apt.startTime) > now && apt.status === 'CONFIRMED',
  );
  const pastAppointments = appointments.filter(
    (apt) =>
      new Date(apt.startTime) <= now ||
      apt.status === 'CANCELLED' ||
      apt.status === 'COMPLETED' ||
      apt.status === 'NO_SHOW',
  );

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-153px)] bg-background">
        <main className="container mx-auto px-4 py-4">
          <div className="mb-6">
            <h1 className="mb-2 text-3xl font-bold">I Tuoi Appuntamenti</h1>
          </div>
          <div className="py-12 text-center text-muted-foreground">Caricamento...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-153px)] bg-background">
      <main className="container mx-auto px-4 py-4">
        <div className="mb-6">
          <h1 className="mb-2 text-3xl font-bold">I Tuoi Appuntamenti</h1>
          <p className="text-muted-foreground">Gestisci le tue prenotazioni</p>
        </div>

        {/* Upcoming Appointments */}
        <div className="mb-6">
          <h2 className="mb-4 text-xl font-bold">Prossimi Appuntamenti</h2>
          {upcomingAppointments.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <p className="mb-2 text-muted-foreground">Nessun appuntamento in programma</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => (
                <Card key={appointment.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{appointment.service.name}</CardTitle>
                        <CardDescription>
                          <span
                            className={`mt-2 inline-block rounded-full px-2 py-1 text-sm font-medium ${getStatusColor(appointment.status)}`}
                          >
                            {getStatusLabel(appointment.status)}
                          </span>
                        </CardDescription>
                      </div>
                      {appointment.status === 'CONFIRMED' && new Date(appointment.startTime) <= now && (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateStatus(appointment.id, 'COMPLETED')}
                            disabled={updatingId === appointment.id}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateStatus(appointment.id, 'NO_SHOW')}
                            disabled={updatingId === appointment.id}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(appointment.startTime)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>
                        {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span>
                        {appointment.customer.firstName} {appointment.customer.lastName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <a href={`tel:${appointment.customer.phone}`} className="hover:underline">
                        {appointment.customer.phone}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{getCityFromAddress(appointment.store.address)}</span>
                    </div>
                    <div className="pt-2 text-base font-semibold">€{appointment.service.price.toFixed(2)}</div>
                  </CardContent>
                </Card>
              ))}
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
              {pastAppointments.map((appointment) => (
                <Card key={appointment.id} className="opacity-75">
                  <CardHeader>
                    <div>
                      <CardTitle className="text-lg">{appointment.service.name}</CardTitle>
                      <CardDescription>
                        <span
                          className={`mt-2 inline-block rounded-full px-2 py-1 text-sm font-medium ${getStatusColor(appointment.status)}`}
                        >
                          {getStatusLabel(appointment.status)}
                        </span>
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(appointment.startTime)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>
                        {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span>
                        {appointment.customer.firstName} {appointment.customer.lastName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <a href={`tel:${appointment.customer.phone}`} className="hover:underline">
                        {appointment.customer.phone}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{getCityFromAddress(appointment.store.address)}</span>
                    </div>
                    <div className="pt-2 text-base font-semibold">€{appointment.service.price.toFixed(2)}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function BarberAppointmentsPage() {
  return (
    <ProtectedRoute allowedRoles={['BARBER', 'ADMIN']}>
      <BarberAppointmentsContent />
    </ProtectedRoute>
  );
}
