'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { ProtectedRoute } from '@/components/protected-route';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Clock, MapPin, Check, X, Phone, Scissors } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

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

const DAYS_OF_WEEK = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
const MONTHS = [
  'Gennaio',
  'Febbraio',
  'Marzo',
  'Aprile',
  'Maggio',
  'Giugno',
  'Luglio',
  'Agosto',
  'Settembre',
  'Ottobre',
  'Novembre',
  'Dicembre',
];

function BarberCalendarContent() {
  const { user, getToken } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    loadAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate]);

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

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    // Add empty slots for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const getAppointmentsForDate = (date: Date | null) => {
    if (!date) return [];

    return appointments.filter((apt) => {
      const aptDate = new Date(apt.startTime);
      return (
        aptDate.getDate() === date.getDate() &&
        aptDate.getMonth() === date.getMonth() &&
        aptDate.getFullYear() === date.getFullYear() &&
        apt.status !== 'CANCELLED'
      );
    });
  };

  const hasAppointments = (date: Date | null) => {
    return date && getAppointmentsForDate(date).length > 0;
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

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    setSelectedDate(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    setSelectedDate(null);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('it-IT', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getCityFromAddress = (address: string) => {
    const parts = address.split(',')[1]?.trim().split(' ');
    return parts?.[parts.length - 2] || address;
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

  const days = getDaysInMonth(currentDate);
  const selectedDateAppointments = selectedDate ? getAppointmentsForDate(selectedDate) : [];

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-153px)] bg-background">
        <main className="container mx-auto px-4 py-4">
          <div className="mb-6">
            <h1 className="mb-2 text-3xl font-bold">Calendario</h1>
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
          <h1 className="mb-2 text-3xl font-bold">Calendario</h1>
          <p className="text-muted-foreground">Visualizza tutti i tuoi appuntamenti</p>
        </div>

        {/* Month Navigation */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="icon" onClick={previousMonth}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <CardTitle>
                {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={nextMonth}>
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Days of week header */}
            <div className="mb-2 grid grid-cols-7 gap-1">
              {DAYS_OF_WEEK.map((day) => (
                <div key={day} className="text-center text-sm font-medium text-muted-foreground">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, index) => (
                <button
                  key={index}
                  onClick={() => day && setSelectedDate(day)}
                  disabled={!day}
                  className={`aspect-square rounded-lg p-2 text-sm transition-colors ${
                    !day
                      ? 'cursor-default'
                      : selectedDate &&
                          day.getDate() === selectedDate.getDate() &&
                          day.getMonth() === selectedDate.getMonth()
                        ? 'bg-primary text-primary-foreground'
                        : hasAppointments(day)
                          ? 'bg-primary/20 hover:bg-primary/30 font-semibold'
                          : 'hover:bg-muted'
                  }`}
                >
                  {day?.getDate()}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Selected Date Appointments */}
        {selectedDate && (
          <div>
            <h2 className="mb-4 text-xl font-bold">
              Appuntamenti del{' '}
              {selectedDate.toLocaleDateString('it-IT', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </h2>

            {selectedDateAppointments.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <p>Nessun appuntamento per questo giorno</p>
                </CardContent>
              </Card>
            ) : (
              <Accordion type="single" collapsible className="space-y-3">
                {selectedDateAppointments
                  .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                  .map((appointment) => (
                    <AccordionItem key={appointment.id} value={appointment.id} className="border rounded-lg bg-card">
                      <AccordionTrigger className="px-4 py-3 hover:no-underline data-[state=open]:pb-0">
                        <div className="flex flex-1 items-center justify-between text-left pr-2">
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-base mb-1">
                              {appointment.customer.firstName} {appointment.customer.lastName}
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5" />
                                {getCityFromAddress(appointment.store.address)}
                              </span>
                            </div>
                          </div>
                          <div className="ml-2">
                            <span
                              className={`inline-block rounded-full px-2 py-1 text-sm font-medium ${getStatusColor(appointment.status)}`}
                            >
                              {getStatusLabel(appointment.status)}
                            </span>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4 pt-3">
                        <div className="space-y-3 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Scissors className="h-4 w-4" />
                            <span className="font-medium">{appointment.service.name}</span>
                            <span className="ml-auto">€{appointment.service.price.toFixed(2)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="h-4 w-4" />
                            <a href={`tel:${appointment.customer.phone}`} className="hover:underline">
                              {appointment.customer.phone}
                            </a>
                          </div>

                          {/* Action buttons - only show for CONFIRMED appointments that are today or in the past */}
                          {appointment.status === 'CONFIRMED' && new Date(appointment.endTime) <= new Date() && (
                            <div className="flex gap-2 mt-4 pt-3 border-t">
                              <Button
                                variant="default"
                                size="sm"
                                className="flex-1"
                                onClick={() => handleUpdateStatus(appointment.id, 'COMPLETED')}
                                disabled={updatingId === appointment.id}
                              >
                                <Check className="mr-2 h-4 w-4" />
                                Fatto
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                className="flex-1"
                                onClick={() => handleUpdateStatus(appointment.id, 'NO_SHOW')}
                                disabled={updatingId === appointment.id}
                              >
                                <X className="mr-2 h-4 w-4" />
                                Assente
                              </Button>
                            </div>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
              </Accordion>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default function BarberCalendarPage() {
  return (
    <ProtectedRoute allowedRoles={['BARBER', 'ADMIN']}>
      <BarberCalendarContent />
    </ProtectedRoute>
  );
}
