'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { ProtectedRoute } from '@/components/protected-route';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Phone, Mail, Calendar, DollarSign } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, XAxis, YAxis, Cell } from 'recharts';

interface Barber {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
}

interface BarberStats {
  barberId: string;
  barberName: string;
  totalAppointments: number;
  completedAppointments: number;
  revenue: number;
}

function AdminBarbersContent() {
  const { getToken } = useAuth();
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [barberStats, setBarberStats] = useState<BarberStats[]>([]);
  const [timePeriod, setTimePeriod] = useState<string>('month');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBarbers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (barbers.length > 0) {
      loadBarberStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [barbers, timePeriod, customStartDate, customEndDate]);

  const loadBarbers = async () => {
    setIsLoading(true);
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

  const loadBarberStats = async () => {
    try {
      const dateRange = getDateRange();
      if (!dateRange) return;

      const token = getToken();
      const { startDate, endDate } = dateRange;

      const response = await fetch(
        `/api/admin/statistics?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const result = await response.json();
      if (result.data && result.data.revenueByBarber) {
        setBarberStats(result.data.revenueByBarber);
      }
    } catch (err) {
      console.error('Error loading barber stats:', err);
    }
  };

  const getBarberStats = (barberId: string) => {
    return barberStats.find((s) => s.barberId === barberId);
  };

  if (isLoading) {
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
          <h1 className="mb-1 text-2xl font-bold">Gestione Barbieri</h1>
          <p className="text-sm text-muted-foreground">Statistiche e performance dei barbieri</p>
        </div>

        {/* Filters */}
        <div className="mb-4 flex flex-wrap items-end gap-3">
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

        {/* Summary and Charts */}
        {barberStats.length > 0 && (
          <>
            {/* Summary Cards */}
            <div className="mb-4 grid gap-2 grid-cols-2">
              <Card>
                <CardContent className="p-2">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <DollarSign className="h-3 w-3" />
                    <span>Fatturato</span>
                  </div>
                  <div className="mt-0.5 text-lg font-bold">
                    €{barberStats.reduce((sum, b) => sum + b.revenue, 0).toFixed(2)}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-2">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>Appuntamenti</span>
                  </div>
                  <div className="mt-0.5 text-lg font-bold">
                    {barberStats.reduce((sum, b) => sum + b.totalAppointments, 0)}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="mb-4 space-y-2">
              {/* Revenue Chart */}
              <Card>
                <CardHeader className="p-2 pb-0">
                  <CardTitle className="text-sm font-semibold">Fatturato per Barbiere</CardTitle>
                </CardHeader>
                <CardContent className="p-2">
                  <ChartContainer
                    config={{
                      revenue: {
                        label: 'Fatturato',
                        color: 'hsl(var(--primary))',
                      },
                    }}
                    className="h-[200px] w-full"
                  >
                    <BarChart data={barberStats} margin={{ left: 0, right: 0, bottom: 20 }}>
                      <XAxis
                        dataKey="barberName"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                        tickFormatter={(value) => {
                          const names = value.split(' ');
                          return names.length > 1 ? `${names[0]} ${names[1][0]}.` : names[0];
                        }}
                      />
                      <YAxis hide />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar
                        dataKey="revenue"
                        radius={4}
                        label={{
                          position: 'bottom',
                          fontSize: 10,
                          formatter: (value: number) => `€${value.toFixed(0)}`,
                        }}
                      >
                        {barberStats.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'][index % 6]}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Appointments Chart */}
              <Card>
                <CardHeader className="p-2 pb-0">
                  <CardTitle className="text-sm font-semibold">Appuntamenti per Barbiere</CardTitle>
                </CardHeader>
                <CardContent className="p-2">
                  <ChartContainer
                    config={{
                      totalAppointments: {
                        label: 'Appuntamenti',
                        color: 'hsl(var(--primary))',
                      },
                    }}
                    className="h-[200px] w-full"
                  >
                    <BarChart data={barberStats} margin={{ left: 0, right: 0, bottom: 20 }}>
                      <XAxis
                        dataKey="barberName"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                        tickFormatter={(value) => {
                          const names = value.split(' ');
                          return names.length > 1 ? `${names[0]} ${names[1][0]}.` : names[0];
                        }}
                      />
                      <YAxis hide />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="totalAppointments" radius={4} label={{ position: 'bottom', fontSize: 10 }}>
                        {barberStats.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'][index % 6]}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* Barbers List */}
        <div className="mb-2">
          <h2 className="text-sm font-semibold">Dettagli Barbieri</h2>
        </div>
        <div className="space-y-3">
          {barbers.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <User className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">Nessun barbiere trovato</p>
              </CardContent>
            </Card>
          ) : (
            barbers.map((barber) => {
              const stats = getBarberStats(barber.id);
              return (
                <Card key={barber.id}>
                  <CardHeader className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-sm">
                            {barber.firstName} {barber.lastName}
                          </CardTitle>
                          <CardDescription className="mt-0.5 flex items-center gap-3 text-sm">
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {barber.phone}
                            </span>
                            {barber.email && (
                              <span className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {barber.email}
                              </span>
                            )}
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    {stats ? (
                      <div className="grid grid-cols-3 gap-2">
                        <div className="rounded-lg border p-2 text-center">
                          <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>Totali</span>
                          </div>
                          <div className="mt-0.5 text-base font-bold">{stats.totalAppointments}</div>
                        </div>
                        <div className="rounded-lg border p-2 text-center">
                          <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3 text-green-600" />
                            <span>Completati</span>
                          </div>
                          <div className="mt-0.5 text-base font-bold text-green-600">{stats.completedAppointments}</div>
                        </div>
                        <div className="rounded-lg border p-2 text-center">
                          <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                            <DollarSign className="h-3 w-3 text-green-600" />
                            <span>Fatturato</span>
                          </div>
                          <div className="mt-0.5 text-base font-bold text-green-600">€{stats.revenue.toFixed(2)}</div>
                        </div>
                      </div>
                    ) : (
                      <div className="py-2 text-center text-sm text-muted-foreground">
                        Nessuna statistica per il periodo
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}

export default function AdminBarbersPage() {
  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <AdminBarbersContent />
    </ProtectedRoute>
  );
}
