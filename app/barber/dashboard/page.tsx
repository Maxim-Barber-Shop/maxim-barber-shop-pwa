'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { ProtectedRoute } from '@/components/protected-route';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, MapPin, User, CheckCircle, XCircle, Phone } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

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

interface Statistics {
  totalAppointments: number;
  completedAppointments: number;
  noShowAppointments: number;
  totalRevenue: number;
}

function BarberDashboardContent() {
  const { user, getToken } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [timePeriod, setTimePeriod] = useState<string>('week');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');

  useEffect(() => {
    loadAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadStatistics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timePeriod, customStartDate, customEndDate]);

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

  const getDateRange = () => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    switch (timePeriod) {
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 30);
        break;
      case 'quarter':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 90);
        break;
      case 'custom':
        if (!customStartDate || !customEndDate) return null;
        startDate = new Date(customStartDate);
        endDate = new Date(customEndDate);
        break;
      default:
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
    }

    return { startDate, endDate };
  };

  const loadStatistics = async () => {
    try {
      const dateRange = getDateRange();
      if (!dateRange) return;

      const token = getToken();
      const { startDate, endDate } = dateRange;
      const response = await fetch(
        `/api/statistics?barberId=${user?.id}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const result = await response.json();
      if (result.data) {
        setStatistics(result.data);
      }
    } catch (err) {
      console.error('Error loading statistics:', err);
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
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

  const todayAppointments = appointments.filter(
    (apt) => new Date(apt.startTime) >= todayStart && new Date(apt.startTime) <= todayEnd && apt.status !== 'CANCELLED',
  );

  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);

  const weekAppointments = appointments.filter(
    (apt) => new Date(apt.startTime) >= weekStart && new Date(apt.startTime) < weekEnd && apt.status !== 'CANCELLED',
  );

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-153px)] bg-background">
        <main className="container mx-auto px-4 py-4">
          <div className="mb-6">
            <h1 className="mb-2 text-3xl font-bold">Benvenuto!</h1>
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
          <h1 className="mb-2 text-3xl font-bold">Ciao, {user?.firstName}!</h1>
          <p className="text-muted-foreground">Dashboard</p>
        </div>

        {/* Quick Stats */}
        <div className="mb-6 grid grid-cols-2 gap-3">
          <Card>
            <CardHeader className="pb-1 pt-4">
              <CardDescription className="flex items-center gap-1.5 text-sm">
                <Calendar className="h-3.5 w-3.5" />
                Oggi
              </CardDescription>
              <CardTitle className="text-2xl">{todayAppointments.length}</CardTitle>
            </CardHeader>
            <CardContent className="pb-3">
              <p className="text-xs text-muted-foreground">Appuntamenti</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-1 pt-4">
              <CardDescription className="flex items-center gap-1.5 text-sm">
                <Calendar className="h-3.5 w-3.5" />
                Questa Settimana
              </CardDescription>
              <CardTitle className="text-2xl">{weekAppointments.length}</CardTitle>
            </CardHeader>
            <CardContent className="pb-3">
              <p className="text-xs text-muted-foreground">Appuntamenti</p>
            </CardContent>
          </Card>
        </div>

        {/* Statistics Section */}
        <div className="mb-6">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-xl font-bold">Statistiche</h2>

            <div className="flex items-center gap-2">
              <Select value={timePeriod} onValueChange={setTimePeriod}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Seleziona periodo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Ultima Settimana</SelectItem>
                  <SelectItem value="month">Ultimo Mese</SelectItem>
                  <SelectItem value="quarter">Ultimi 3 Mesi</SelectItem>
                  <SelectItem value="custom">Personalizzato</SelectItem>
                </SelectContent>
              </Select>

              {/* Custom Date Range */}
              {timePeriod === 'custom' && (
                <>
                  <Input
                    type="date"
                    className="w-[140px]"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    placeholder="Data Inizio"
                  />
                  <Input
                    type="date"
                    className="w-[140px]"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    placeholder="Data Fine"
                  />
                </>
              )}
            </div>
          </div>

          {/* Statistics Cards */}
          {statistics && (
            <div className="grid grid-cols-2 gap-3">
              <Card>
                <CardHeader className="pb-1 pt-4">
                  <CardDescription className="flex items-center gap-1.5 text-sm">
                    <CheckCircle className="h-3.5 w-3.5" />
                    Completati
                  </CardDescription>
                  <CardTitle className="text-2xl">{statistics.completedAppointments}</CardTitle>
                </CardHeader>
                <CardContent className="pb-3">
                  <p className="text-xs text-muted-foreground">Appuntamenti</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-1 pt-4">
                  <CardDescription className="flex items-center gap-1.5 text-sm">
                    <XCircle className="h-3.5 w-3.5" />
                    Assenti
                  </CardDescription>
                  <CardTitle className="text-2xl">{statistics.noShowAppointments}</CardTitle>
                </CardHeader>
                <CardContent className="pb-3">
                  <p className="text-xs text-muted-foreground">Clienti</p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Today's Appointments */}
        <div>
          <h2 className="mb-4 text-xl font-bold">Appuntamenti di Oggi</h2>
          {todayAppointments.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <p className="mb-2 text-muted-foreground">Nessun appuntamento per oggi</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {todayAppointments.map((appointment) => (
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
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
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
                      <span>{appointment.customer.phone}</span>
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

export default function BarberDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['BARBER', 'ADMIN']}>
      <BarberDashboardContent />
    </ProtectedRoute>
  );
}
