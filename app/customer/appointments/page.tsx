'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { ProtectedRoute } from '@/components/protected-route';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarPlus, Calendar, Clock, MapPin, User, Plus, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FaGoogle, FaApple } from 'react-icons/fa';

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

  // Contact phone numbers for modifications/cancellations
  const MAXIM_PHONE = '3312920752';
  const MANAGEMENT_PHONE = '3292580402';

  const getCityFromAddress = (address: string) => {
    // Extract city from address format: "Via Roma 123, 65121 Pescara PE"
    const parts = address.split(',')[1]?.trim().split(' ');
    return parts?.[parts.length - 2] || address;
  };

  const formatDateForCalendar = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const addToGoogleCalendar = (appointment: Appointment) => {
    const title = `${appointment.service.name} - ${appointment.barber.firstName} ${appointment.barber.lastName}`;
    const startDate = formatDateForCalendar(appointment.startTime);
    const endDate = formatDateForCalendar(appointment.endTime);
    const location = appointment.store.address;
    const details = `Barbiere: ${appointment.barber.firstName} ${appointment.barber.lastName}\nSede: ${appointment.store.name}\nPrezzo: €${appointment.service.price.toFixed(2)}`;

    const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startDate}/${endDate}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}`;
    window.open(url, '_blank');
  };

  const addToAppleCalendar = (appointment: Appointment) => {
    const title = `${appointment.service.name} - ${appointment.barber.firstName} ${appointment.barber.lastName}`;
    const startDate = formatDateForCalendar(appointment.startTime);
    const endDate = formatDateForCalendar(appointment.endTime);
    const location = appointment.store.address;
    const description = `Barbiere: ${appointment.barber.firstName} ${appointment.barber.lastName}\\nSede: ${appointment.store.name}\\nPrezzo: €${appointment.service.price.toFixed(2)}`;

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      `DTSTART:${startDate}`,
      `DTEND:${endDate}`,
      `SUMMARY:${title}`,
      `DESCRIPTION:${description}`,
      `LOCATION:${location}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'appointment.ics';
    link.click();
    URL.revokeObjectURL(url);
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
  const upcomingAppointments = appointments
    .filter((apt) => new Date(apt.startTime) > now && apt.status !== 'CANCELLED' && apt.status !== 'COMPLETED')
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  const pastAppointments = appointments
    .filter((apt) => new Date(apt.startTime) <= now || apt.status === 'CANCELLED' || apt.status === 'COMPLETED')
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-153px)] bg-background">
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
    <div className="min-h-[calc(100vh-153px)] bg-background">
      {/* Main Content */}
      <main className="container mx-auto px-4 py-4">
        <div className="mb-6">
          <h1 className="mb-2 text-3xl font-bold">I Miei Appuntamenti</h1>
          <p className="text-muted-foreground">Gestisci le tue prenotazioni</p>
        </div>

        {/* Info Banner for Modifications/Cancellations */}
        <Card className="mb-6 border-slate-800 bg-slate-950/40 dark:border-slate-800 dark:bg-slate-950/40">
          <CardContent>
            <div className="flex flex-col items-center gap-1 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4" />
                <span>Per modifiche o cancellazioni:</span>
              </div>
              <a href={`tel:${MAXIM_PHONE}`} className="text-slate-200 hover:underline">
                Maxim: {MAXIM_PHONE}
              </a>
              <a href={`tel:${MANAGEMENT_PHONE}`} className="text-slate-200 hover:underline">
                Gestione: {MANAGEMENT_PHONE}
              </a>
            </div>
          </CardContent>
        </Card>

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
                      <CardTitle className="text-lg">{appointment.service.name}</CardTitle>
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
                      {appointment.status !== 'CANCELLED' && (
                        <div className="pt-3">
                          <p className="mb-2 text-sm text-muted-foreground">Aggiungi a:</p>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => addToGoogleCalendar(appointment)}
                              className="flex-1"
                            >
                              <FaGoogle className="h-4 w-4 mr-1" />
                              Google Calendar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => addToAppleCalendar(appointment)}
                              className="flex-1"
                            >
                              <FaApple className="h-4 w-4 mr-1" />
                              Apple Calendar
                            </Button>
                          </div>
                        </div>
                      )}
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
                      <CardTitle className="text-lg">{appointment.service.name}</CardTitle>
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
