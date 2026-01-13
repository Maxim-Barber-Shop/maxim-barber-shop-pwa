'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { ProtectedRoute } from '@/components/protected-route';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Store, Clock } from 'lucide-react';
import { getDayNameItalian } from '@/lib/utils/date-time';

interface BarberWeeklyHour {
  id: string;
  barberId: string;
  storeId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  store?: {
    name: string;
  };
}

function BarberShiftsContent() {
  const { getToken } = useAuth();
  const [weeklyHours, setWeeklyHours] = useState<BarberWeeklyHour[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadWeeklyHours();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadWeeklyHours = async () => {
    setIsLoading(true);
    try {
      const token = getToken();
      const response = await fetch('/api/barber-weekly-hours', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (result.data) {
        setWeeklyHours(result.data);
      }
    } catch (err) {
      console.error('Error loading weekly hours:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Group hours by store and day
  const groupedHours = weeklyHours.reduce(
    (acc, hour) => {
      const storeName = hour.store?.name || 'Sede sconosciuta';
      if (!acc[storeName]) {
        acc[storeName] = {};
      }
      const dayName = getDayNameItalian(hour.dayOfWeek);
      if (!acc[storeName][dayName]) {
        acc[storeName][dayName] = [];
      }
      acc[storeName][dayName].push(hour);
      return acc;
    },
    {} as Record<string, Record<string, BarberWeeklyHour[]>>,
  );

  return (
    <div className="min-h-[calc(100vh-153px)] bg-background">
      <main className="container mx-auto px-4 py-4">
        <div className="mb-4">
          <h1 className="mb-1 text-2xl font-bold">I Miei Turni</h1>
          <p className="text-sm text-muted-foreground">Visualizza i tuoi turni settimanali</p>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-muted-foreground">Caricamento...</div>
        ) : weeklyHours.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">Nessun turno trovato</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Contatta l'amministratore per configurare i tuoi turni
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedHours).map(([storeName, days]) => (
              <Card key={storeName}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Store className="h-5 w-5" />
                    {storeName}
                  </CardTitle>
                  <CardDescription>I tuoi turni settimanali per questa sede</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(days)
                      .sort(([dayA], [dayB]) => {
                        const daysOrder = [
                          'Lunedi',
                          'Martedi',
                          'Mercoledi',
                          'Giovedi',
                          'Venerdi',
                          'Sabato',
                          'Domenica',
                        ];
                        return daysOrder.indexOf(dayA) - daysOrder.indexOf(dayB);
                      })
                      .map(([dayName, hours]) => (
                        <div key={dayName} className="flex items-start gap-3 rounded-lg border p-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 shrink-0">
                            <Calendar className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold">{dayName}</div>
                            <div className="mt-1 space-y-1">
                              {hours
                                .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                                .map((hour) => (
                                  <div key={hour.id} className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Clock className="h-3 w-3" />
                                    <span>
                                      {new Date(hour.startTime).toLocaleTimeString('it-IT', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        timeZone: 'UTC',
                                      })}{' '}
                                      -{' '}
                                      {new Date(hour.endTime).toLocaleTimeString('it-IT', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        timeZone: 'UTC',
                                      })}
                                    </span>
                                  </div>
                                ))}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function BarberShiftsPage() {
  return (
    <ProtectedRoute allowedRoles={['BARBER', 'ADMIN']}>
      <BarberShiftsContent />
    </ProtectedRoute>
  );
}
