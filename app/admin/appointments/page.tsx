'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { ProtectedRoute } from '@/components/protected-route';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Clock, MapPin, User, Phone, Plus, Pencil, Trash2, Scissors } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AppointmentDialog } from '@/components/appointment-dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface Appointment {
  id: string;
  startTime: string;
  endTime: string;
  status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
  service: {
    id: string;
    name: string;
    price: number;
    durationMinutes: number;
  };
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
  };
  barber: {
    id: string;
    firstName: string;
    lastName: string;
  };
  store: {
    id: string;
    name: string;
  };
}

interface Store {
  id: string;
  name: string;
}

interface Barber {
  id: string;
  firstName: string;
  lastName: string;
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

function AdminAppointmentsContent() {
  const { getToken } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [selectedStore, setSelectedStore] = useState<string>('all');
  const [selectedBarber, setSelectedBarber] = useState<string>('all');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editingAppointment, setEditingAppointment] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingAppointmentId, setDeletingAppointmentId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadStores();
    loadBarbers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate, selectedStore]);

  const loadStores = async () => {
    try {
      const token = getToken();
      const response = await fetch('/api/stores', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (result.data) {
        setStores(result.data);
      }
    } catch (err) {
      console.error('Error loading stores:', err);
    }
  };

  const loadBarbers = async () => {
    try {
      const token = getToken();
      const response = await fetch('/api/barbers', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (result.data) {
        setBarbers(result.data);
      }
    } catch (err) {
      console.error('Error loading barbers:', err);
    }
  };

  const loadAppointments = async () => {
    setIsLoading(true);
    try {
      const token = getToken();

      // Get first and last day of current month
      const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59);

      const params = new URLSearchParams({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });

      if (selectedStore !== 'all') {
        params.append('storeId', selectedStore);
      }

      const response = await fetch(`/api/admin/statistics?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (result.data && result.data.appointments) {
        setAppointments(result.data.appointments);
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
      const matchesDate =
        aptDate.getDate() === date.getDate() &&
        aptDate.getMonth() === date.getMonth() &&
        aptDate.getFullYear() === date.getFullYear();

      // Apply barber filter
      const matchesBarber = selectedBarber === 'all' || apt.barber.id === selectedBarber;

      return matchesDate && matchesBarber;
    });
  };

  const hasAppointments = (date: Date | null) => {
    return date && getAppointmentsForDate(date).length > 0;
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'NO_SHOW':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
        return 'Assente';
      default:
        return status;
    }
  };

  const handleCreateNew = () => {
    setEditingAppointment(null);
    setDialogOpen(true);
  };

  const handleEdit = (appointment: Appointment) => {
    // Convert the full appointment to the format expected by the dialog
    const editData = {
      id: appointment.id,
      customerId: appointment.customer.id,
      barberId: appointment.barber.id,
      serviceId: appointment.service.id,
      storeId: appointment.store.id,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      status: appointment.status,
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setEditingAppointment(editData as any);
    setDialogOpen(true);
  };

  const handleDeleteClick = (appointmentId: string) => {
    setDeletingAppointmentId(appointmentId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingAppointmentId) return;

    setIsDeleting(true);
    try {
      const token = getToken();
      const response = await fetch(`/api/appointments/${deletingAppointmentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        await loadAppointments();
        setDeleteDialogOpen(false);
        setDeletingAppointmentId(null);
      } else {
        const result = await response.json();
        alert(result.error || "Errore durante l'eliminazione");
      }
    } catch (err) {
      console.error('Error deleting appointment:', err);
      alert("Errore durante l'eliminazione");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDialogSuccess = () => {
    loadAppointments();
  };

  const days = getDaysInMonth(currentDate);
  const selectedDateAppointments = selectedDate ? getAppointmentsForDate(selectedDate) : [];

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-153px)] bg-background">
        <main className="container mx-auto px-4 py-4">
          <div className="mb-6">
            <h1 className="mb-2 text-3xl font-bold">Calendario Appuntamenti</h1>
          </div>
          <div className="py-12 text-center text-muted-foreground">Caricamento...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-153px)] bg-background">
      <main className="container mx-auto px-4 py-4">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold">Calendario Appuntamenti</h1>
            <p className="text-muted-foreground">Gestisci tutti gli appuntamenti</p>
          </div>
          <Button onClick={handleCreateNew}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Sede:</label>
            <Select value={selectedStore} onValueChange={setSelectedStore}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutte le Sedi</SelectItem>
                {stores.map((store) => (
                  <SelectItem key={store.id} value={store.id}>
                    {store.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Barbiere:</label>
            <Select value={selectedBarber} onValueChange={setSelectedBarber}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti i Barbieri</SelectItem>
                {barbers.map((barber) => (
                  <SelectItem key={barber.id} value={barber.id}>
                    {barber.firstName} {barber.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
                                {appointment.store.name}
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
                            <span className="ml-auto">
                              €{appointment.service.price.toFixed(2)} • {appointment.service.durationMinutes} min
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <User className="h-4 w-4" />
                            <span>
                              Cliente: {appointment.customer.firstName} {appointment.customer.lastName}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="h-4 w-4" />
                            <a href={`tel:${appointment.customer.phone}`} className="hover:underline">
                              {appointment.customer.phone}
                            </a>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <User className="h-4 w-4" />
                            <span>
                              Barbiere: {appointment.barber.firstName} {appointment.barber.lastName}
                            </span>
                          </div>
                          <div className="flex gap-2 mt-4 pt-3 border-t">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(appointment)}
                              className="flex-1"
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Modifica
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteClick(appointment.id)}
                              className="flex-1 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Elimina
                            </Button>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
              </Accordion>
            )}
          </div>
        )}

        {/* Dialogs */}
        <AppointmentDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          appointment={editingAppointment}
          onSuccess={handleDialogSuccess}
        />

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Conferma eliminazione</AlertDialogTitle>
              <AlertDialogDescription>
                Sei sicuro di voler eliminare questo appuntamento? Questa azione non può essere annullata.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Annulla</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? 'Eliminazione...' : 'Elimina'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
}

export default function AdminAppointmentsPage() {
  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <AdminAppointmentsContent />
    </ProtectedRoute>
  );
}
