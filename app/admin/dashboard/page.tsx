'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { ProtectedRoute } from '@/components/protected-route';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, DollarSign, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

interface Store {
  id: string;
  name: string;
}

interface Statistics {
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  noShowAppointments: number;
  confirmedAppointments: number;
  totalRevenue: number;
  averageRevenuePerAppointment: number;
  revenueByBarber: Array<{ barberId: string; barberName: string; revenue: number; appointments: number }>;
  revenueByStore: Array<{ storeId: string; storeName: string; revenue: number; appointments: number }>;
}

function AdminDashboardContent() {
  const { getToken } = useAuth();
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<string>('all');
  const [timePeriod, setTimePeriod] = useState<string>('month');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadStatistics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timePeriod, customStartDate, customEndDate, selectedStore]);

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
      case 'year':
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'custom':
        if (!customStartDate || !customEndDate) return null;
        startDate = new Date(customStartDate);
        endDate = new Date(customEndDate);
        break;
      default:
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 30);
    }

    return { startDate, endDate };
  };

  const loadStatistics = async () => {
    setIsLoading(true);
    try {
      const dateRange = getDateRange();
      if (!dateRange) return;

      const token = getToken();
      const { startDate, endDate } = dateRange;

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
      if (result.data) {
        setStatistics(result.data);
      }
    } catch (err) {
      console.error('Error loading statistics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !statistics) {
    return (
      <div className="min-h-[calc(100vh-153px)] bg-background">
        <main className="container mx-auto px-4 py-4">
          <div className="py-12 text-center text-muted-foreground">Caricamento...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-153px)] bg-background">
      <main className="container mx-auto px-4 py-4">
        <div className="mb-4">
          <h1 className="mb-1 text-2xl font-bold">Dashboard Admin</h1>
          <p className="text-base text-muted-foreground">Panoramica economica e statistiche</p>
        </div>

        {/* Filters */}
        <div className="mb-4 flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <label className="text-sm font-medium">Sede</label>
            <Select value={selectedStore} onValueChange={setSelectedStore}>
              <SelectTrigger className="h-9 w-[160px]">
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

          <div className="space-y-1">
            <label className="text-sm font-medium">Periodo</label>
            <Select value={timePeriod} onValueChange={setTimePeriod}>
              <SelectTrigger className="h-9 w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Ultima Settimana</SelectItem>
                <SelectItem value="month">Ultimo Mese</SelectItem>
                <SelectItem value="quarter">Ultimi 3 Mesi</SelectItem>
                <SelectItem value="year">Ultimo Anno</SelectItem>
                <SelectItem value="custom">Personalizzato</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {timePeriod === 'custom' && (
            <>
              <div className="space-y-1">
                <label className="text-sm font-medium">Data Inizio</label>
                <Input
                  type="date"
                  className="h-9 w-[140px]"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Data Fine</label>
                <Input
                  type="date"
                  className="h-9 w-[140px]"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                />
              </div>
            </>
          )}
        </div>

        {statistics && (
          <>
            {/* Main Stats */}
            <div className="mb-4 grid gap-2 grid-cols-2">
              <Card>
                <CardContent className="p-2">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <DollarSign className="h-3 w-3" />
                    <span>Fatturato</span>
                  </div>
                  <div className="mt-0.5 text-lg font-bold">€{statistics.totalRevenue.toFixed(2)}</div>
                  <p className="text-sm text-muted-foreground">€{statistics.averageRevenuePerAppointment.toFixed(2)}</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-2">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>Appuntamenti</span>
                  </div>
                  <div className="mt-0.5 text-lg font-bold">{statistics.totalAppointments}</div>
                  <p className="text-sm text-muted-foreground">Totali</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-2">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <CheckCircle className="h-3 w-3" />
                    <span>Completati</span>
                  </div>
                  <div className="mt-0.5 text-lg font-bold">{statistics.completedAppointments}</div>
                  <p className="text-sm text-muted-foreground">
                    {statistics.totalAppointments > 0
                      ? ((statistics.completedAppointments / statistics.totalAppointments) * 100).toFixed(1)
                      : 0}
                    %
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-2">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <XCircle className="h-3 w-3" />
                    <span>Assenti</span>
                  </div>
                  <div className="mt-0.5 text-lg font-bold">{statistics.noShowAppointments}</div>
                  <p className="text-sm text-muted-foreground">
                    {statistics.totalAppointments > 0
                      ? ((statistics.noShowAppointments / statistics.totalAppointments) * 100).toFixed(1)
                      : 0}
                    %
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Revenue by Barber and Store - Side by Side */}
            <div className="mb-4 grid gap-2 md:grid-cols-2">
              {/* Revenue by Barber */}
              <Card>
                <CardHeader className="p-2">
                  <CardTitle className="text-sm font-semibold">Fatturato per Barbiere</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {statistics.revenueByBarber.length === 0 ? (
                      <div className="py-4 text-center text-sm text-muted-foreground">Nessun dato</div>
                    ) : (
                      statistics.revenueByBarber.map((barber) => (
                        <div key={barber.barberId} className="flex items-center justify-between px-2 py-1.5">
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{barber.barberName}</p>
                            <p className="text-sm text-muted-foreground">{barber.appointments} app.</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold">€{barber.revenue.toFixed(2)}</p>
                            <p className="text-sm text-muted-foreground">
                              €{(barber.revenue / barber.appointments).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Revenue by Store */}
              {selectedStore === 'all' && (
                <Card>
                  <CardHeader className="p-2">
                    <CardTitle className="text-sm font-semibold">Fatturato per Sede</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y">
                      {statistics.revenueByStore.length === 0 ? (
                        <div className="py-4 text-center text-sm text-muted-foreground">Nessun dato</div>
                      ) : (
                        statistics.revenueByStore.map((store) => (
                          <div key={store.storeId} className="flex items-center justify-between px-2 py-1.5">
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium">{store.storeName}</p>
                              <p className="text-sm text-muted-foreground">{store.appointments} app.</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold">€{store.revenue.toFixed(2)}</p>
                              <p className="text-sm text-muted-foreground">
                                €{(store.revenue / store.appointments).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Status Breakdown */}
            <Card>
              <CardHeader className="p-2">
                <CardTitle className="text-sm font-semibold">Dettaglio Stati</CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-lg border p-2 text-center">
                    <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                      <AlertCircle className="h-3 w-3" />
                      <span>Confermati</span>
                    </div>
                    <div className="mt-0.5 text-lg font-bold">{statistics.confirmedAppointments}</div>
                    <p className="text-sm text-muted-foreground">
                      {statistics.totalAppointments > 0
                        ? ((statistics.confirmedAppointments / statistics.totalAppointments) * 100).toFixed(1)
                        : 0}
                      %
                    </p>
                  </div>

                  <div className="rounded-lg border p-2 text-center">
                    <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                      <XCircle className="h-3 w-3" />
                      <span>Annullati</span>
                    </div>
                    <div className="mt-0.5 text-lg font-bold">{statistics.cancelledAppointments}</div>
                    <p className="text-sm text-muted-foreground">
                      {statistics.totalAppointments > 0
                        ? ((statistics.cancelledAppointments / statistics.totalAppointments) * 100).toFixed(1)
                        : 0}
                      %
                    </p>
                  </div>

                  <div className="rounded-lg border p-2 text-center">
                    <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                      <CheckCircle className="h-3 w-3" />
                      <span>Completati</span>
                    </div>
                    <div className="mt-0.5 text-lg font-bold">{statistics.completedAppointments}</div>
                    <p className="text-sm text-muted-foreground">
                      {statistics.totalAppointments > 0
                        ? ((statistics.completedAppointments / statistics.totalAppointments) * 100).toFixed(1)
                        : 0}
                      %
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <AdminDashboardContent />
    </ProtectedRoute>
  );
}
