'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { ProtectedRoute } from '@/components/protected-route';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  CalendarOff,
  Plus,
  Pencil,
  Trash2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Phone,
  Clock,
  History,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface BarberData {
  id: string;
  firstName: string;
  lastName: string;
}

interface BarberTimeOff {
  id: string;
  barberId: string;
  startDate: string;
  endDate: string;
  reason?: string;
  barber?: {
    firstName: string;
    lastName: string;
  };
  affectedAppointments?: Array<{
    id: string;
    startTime: string;
    status: string;
    customer: {
      firstName: string;
      lastName: string;
      phone: string;
    };
    service: {
      name: string;
    };
  }>;
}

function AdminTimeBlocksContent() {
  const { getToken } = useAuth();

  const [barbers, setBarbers] = useState<BarberData[]>([]);
  const [timeOffs, setTimeOffs] = useState<BarberTimeOff[]>([]);
  const [isLoadingTimeOffs, setIsLoadingTimeOffs] = useState(true);
  const [isTimeOffDialogOpen, setIsTimeOffDialogOpen] = useState(false);
  const [editingTimeOff, setEditingTimeOff] = useState<BarberTimeOff | null>(null);
  const [timeOffFormData, setTimeOffFormData] = useState({
    barberId: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    reason: '',
  });
  const [isSavingTimeOff, setIsSavingTimeOff] = useState(false);
  const [expandedTimeOffId, setExpandedTimeOffId] = useState<string | null>(null);

  useEffect(() => {
    loadBarbers();
    loadTimeOffs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const loadTimeOffs = async () => {
    setIsLoadingTimeOffs(true);
    try {
      const token = getToken();
      const response = await fetch('/api/barber-time-off', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (result.data) {
        setTimeOffs(result.data);
      }
    } catch (err) {
      console.error('Error loading time offs:', err);
    } finally {
      setIsLoadingTimeOffs(false);
    }
  };

  const handleOpenTimeOffDialog = (timeOff?: BarberTimeOff) => {
    if (timeOff) {
      setEditingTimeOff(timeOff);
      const startDateTime = new Date(timeOff.startDate);
      const endDateTime = new Date(timeOff.endDate);
      setTimeOffFormData({
        barberId: timeOff.barberId,
        startDate: startDateTime.toISOString().split('T')[0],
        startTime: `${startDateTime.getHours().toString().padStart(2, '0')}:${startDateTime.getMinutes().toString().padStart(2, '0')}`,
        endDate: endDateTime.toISOString().split('T')[0],
        endTime: `${endDateTime.getHours().toString().padStart(2, '0')}:${endDateTime.getMinutes().toString().padStart(2, '0')}`,
        reason: timeOff.reason || '',
      });
    } else {
      setEditingTimeOff(null);
      setTimeOffFormData({ barberId: '', startDate: '', startTime: '', endDate: '', endTime: '', reason: '' });
    }
    setIsTimeOffDialogOpen(true);
  };

  const handleCloseTimeOffDialog = () => {
    setIsTimeOffDialogOpen(false);
    setEditingTimeOff(null);
    setTimeOffFormData({ barberId: '', startDate: '', startTime: '', endDate: '', endTime: '', reason: '' });
  };

  const handleSaveTimeOff = async () => {
    if (
      !timeOffFormData.barberId ||
      !timeOffFormData.startDate ||
      !timeOffFormData.startTime ||
      !timeOffFormData.endDate ||
      !timeOffFormData.endTime
    ) {
      alert('Barbiere, data/ora inizio e data/ora fine sono obbligatori');
      return;
    }

    setIsSavingTimeOff(true);
    try {
      const token = getToken();
      const url = editingTimeOff ? `/api/barber-time-off/${editingTimeOff.id}` : '/api/barber-time-off';
      const method = editingTimeOff ? 'PATCH' : 'POST';

      // Combine date + time
      const [startHours, startMinutes] = timeOffFormData.startTime.split(':');
      const [endHours, endMinutes] = timeOffFormData.endTime.split(':');

      const startDate = new Date(timeOffFormData.startDate);
      startDate.setHours(parseInt(startHours), parseInt(startMinutes), 0, 0);

      const endDate = new Date(timeOffFormData.endDate);
      endDate.setHours(parseInt(endHours), parseInt(endMinutes), 0, 0);

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          barberId: timeOffFormData.barberId,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          reason: timeOffFormData.reason || undefined,
        }),
      });

      if (response.ok) {
        await loadTimeOffs();
        handleCloseTimeOffDialog();
      } else {
        const error = await response.json();
        alert(error.error || 'Errore durante il salvataggio');
      }
    } catch (err) {
      console.error('Error saving time off:', err);
      alert('Errore durante il salvataggio');
    } finally {
      setIsSavingTimeOff(false);
    }
  };

  const handleDeleteTimeOff = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo blocco?')) {
      return;
    }

    try {
      const token = getToken();
      const response = await fetch(`/api/barber-time-off/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        await loadTimeOffs();
      } else {
        const error = await response.json();
        alert(error.error || "Errore durante l'eliminazione");
      }
    } catch (err) {
      console.error('Error deleting time off:', err);
      alert("Errore durante l'eliminazione");
    }
  };

  return (
    <div className="min-h-[calc(100vh-153px)] bg-background">
      <main className="container mx-auto px-4 py-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="mb-1 text-2xl font-bold">Blocchi Orari</h1>
            <p className="text-sm text-muted-foreground">Gestisci i periodi di assenza dei barbieri</p>
          </div>
          <Button onClick={() => handleOpenTimeOffDialog()} size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {isLoadingTimeOffs ? (
          <div className="py-12 text-center text-muted-foreground">Caricamento...</div>
        ) : (
          <Tabs defaultValue="current" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="current" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Futuri
              </TabsTrigger>
              <TabsTrigger value="past" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                Passati
              </TabsTrigger>
            </TabsList>

            <TabsContent value="current" className="space-y-3 mt-4">
              {(() => {
                const now = new Date();
                const currentTimeOffs = timeOffs.filter((timeOff) => new Date(timeOff.endDate) >= now);

                if (currentTimeOffs.length === 0) {
                  return (
                    <Card>
                      <CardContent className="py-12 text-center">
                        <Clock className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                        <p className="text-muted-foreground">Nessun blocco presente o futuro</p>
                      </CardContent>
                    </Card>
                  );
                }

                return currentTimeOffs.map((timeOff) => {
                  const startDateTime = new Date(timeOff.startDate);
                  const endDateTime = new Date(timeOff.endDate);
                  const isSameDay =
                    startDateTime.toLocaleDateString('it-IT') === endDateTime.toLocaleDateString('it-IT');
                  const hasAppointments = timeOff.affectedAppointments && timeOff.affectedAppointments.length > 0;
                  const isExpanded = expandedTimeOffId === timeOff.id;

                  return (
                    <Card key={timeOff.id}>
                      <CardHeader className="p-3">
                        <div className="flex items-start justify-between">
                          <div
                            className="flex flex-1 cursor-pointer items-center gap-2"
                            onClick={() => setExpandedTimeOffId(isExpanded ? null : timeOff.id)}
                          >
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 shrink-0">
                              <CalendarOff className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <CardTitle className="text-sm">
                                  {timeOff.barber
                                    ? `${timeOff.barber.firstName} ${timeOff.barber.lastName}`
                                    : 'Barbiere'}
                                </CardTitle>
                                {hasAppointments && (
                                  <div className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-sm font-medium text-orange-800 dark:bg-orange-950/40 dark:text-orange-300">
                                    <AlertCircle className="h-3 w-3" />
                                    {timeOff.affectedAppointments!.length} prenotaz.
                                  </div>
                                )}
                              </div>
                              <CardDescription className="mt-0.5 text-sm">
                                {isSameDay ? (
                                  <>
                                    {startDateTime.toLocaleDateString('it-IT', {
                                      day: '2-digit',
                                      month: '2-digit',
                                      year: 'numeric',
                                    })}{' '}
                                    •{' '}
                                    {startDateTime.toLocaleTimeString('it-IT', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}{' '}
                                    -{' '}
                                    {endDateTime.toLocaleTimeString('it-IT', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </>
                                ) : (
                                  <>
                                    {startDateTime.toLocaleDateString('it-IT', {
                                      day: '2-digit',
                                      month: '2-digit',
                                      year: 'numeric',
                                    })}{' '}
                                    {startDateTime.toLocaleTimeString('it-IT', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}{' '}
                                    -{' '}
                                    {endDateTime.toLocaleDateString('it-IT', {
                                      day: '2-digit',
                                      month: '2-digit',
                                      year: 'numeric',
                                    })}{' '}
                                    {endDateTime.toLocaleTimeString('it-IT', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </>
                                )}
                              </CardDescription>
                              {timeOff.reason && (
                                <div className="mt-1 text-sm text-muted-foreground">{timeOff.reason}</div>
                              )}
                            </div>
                            {hasAppointments && (
                              <div className="shrink-0">
                                {isExpanded ? (
                                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                )}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-1 ml-2">
                            <Button variant="ghost" size="sm" onClick={() => handleOpenTimeOffDialog(timeOff)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteTimeOff(timeOff.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      {isExpanded && hasAppointments && (
                        <CardContent className="border-t bg-muted/30 p-3">
                          <div className="space-y-2">
                            <div className="text-sm font-medium text-muted-foreground">Prenotazioni nel periodo:</div>
                            {timeOff.affectedAppointments!.map((appointment) => (
                              <div
                                key={appointment.id}
                                className="flex items-center justify-between rounded-md bg-background p-2 text-sm"
                              >
                                <div className="flex-1">
                                  <div className="font-medium">
                                    {appointment.customer.firstName} {appointment.customer.lastName}
                                  </div>
                                  <div className="text-muted-foreground">
                                    {appointment.service.name} •{' '}
                                    {new Date(appointment.startTime).toLocaleString('it-IT', {
                                      day: '2-digit',
                                      month: '2-digit',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </div>
                                </div>
                                <a
                                  href={`tel:${appointment.customer.phone}`}
                                  className="flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-primary hover:bg-primary/20"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Phone className="h-3 w-3" />
                                  <span>{appointment.customer.phone}</span>
                                </a>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  );
                });
              })()}
            </TabsContent>

            <TabsContent value="past" className="space-y-3 mt-4">
              {(() => {
                const now = new Date();
                const pastTimeOffs = timeOffs.filter((timeOff) => new Date(timeOff.endDate) < now);

                if (pastTimeOffs.length === 0) {
                  return (
                    <Card>
                      <CardContent className="py-12 text-center">
                        <History className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                        <p className="text-muted-foreground">Nessun blocco passato</p>
                      </CardContent>
                    </Card>
                  );
                }

                return pastTimeOffs.map((timeOff) => {
                  const startDateTime = new Date(timeOff.startDate);
                  const endDateTime = new Date(timeOff.endDate);
                  const isSameDay =
                    startDateTime.toLocaleDateString('it-IT') === endDateTime.toLocaleDateString('it-IT');
                  const hasAppointments = timeOff.affectedAppointments && timeOff.affectedAppointments.length > 0;
                  const isExpanded = expandedTimeOffId === timeOff.id;

                  return (
                    <Card key={timeOff.id}>
                      <CardHeader className="p-3">
                        <div className="flex items-start justify-between">
                          <div
                            className="flex flex-1 cursor-pointer items-center gap-2"
                            onClick={() => setExpandedTimeOffId(isExpanded ? null : timeOff.id)}
                          >
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted shrink-0">
                              <CalendarOff className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <CardTitle className="text-sm">
                                  {timeOff.barber
                                    ? `${timeOff.barber.firstName} ${timeOff.barber.lastName}`
                                    : 'Barbiere'}
                                </CardTitle>
                                {hasAppointments && (
                                  <div className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-sm font-medium text-orange-800 dark:bg-orange-950/40 dark:text-orange-300">
                                    <AlertCircle className="h-3 w-3" />
                                    {timeOff.affectedAppointments!.length} prenotaz.
                                  </div>
                                )}
                              </div>
                              <CardDescription className="mt-0.5 text-sm">
                                {isSameDay ? (
                                  <>
                                    {startDateTime.toLocaleDateString('it-IT', {
                                      day: '2-digit',
                                      month: '2-digit',
                                      year: 'numeric',
                                    })}{' '}
                                    •{' '}
                                    {startDateTime.toLocaleTimeString('it-IT', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}{' '}
                                    -{' '}
                                    {endDateTime.toLocaleTimeString('it-IT', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </>
                                ) : (
                                  <>
                                    {startDateTime.toLocaleDateString('it-IT', {
                                      day: '2-digit',
                                      month: '2-digit',
                                      year: 'numeric',
                                    })}{' '}
                                    {startDateTime.toLocaleTimeString('it-IT', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}{' '}
                                    -{' '}
                                    {endDateTime.toLocaleDateString('it-IT', {
                                      day: '2-digit',
                                      month: '2-digit',
                                      year: 'numeric',
                                    })}{' '}
                                    {endDateTime.toLocaleTimeString('it-IT', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </>
                                )}
                              </CardDescription>
                              {timeOff.reason && (
                                <div className="mt-1 text-sm text-muted-foreground">{timeOff.reason}</div>
                              )}
                            </div>
                            {hasAppointments && (
                              <div className="shrink-0">
                                {isExpanded ? (
                                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                )}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-1 ml-2">
                            <Button variant="ghost" size="sm" onClick={() => handleOpenTimeOffDialog(timeOff)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteTimeOff(timeOff.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      {isExpanded && hasAppointments && (
                        <CardContent className="border-t bg-muted/30 p-3">
                          <div className="space-y-2">
                            <div className="text-sm font-medium text-muted-foreground">Prenotazioni nel periodo:</div>
                            {timeOff.affectedAppointments!.map((appointment) => (
                              <div
                                key={appointment.id}
                                className="flex items-center justify-between rounded-md bg-background p-2 text-sm"
                              >
                                <div className="flex-1">
                                  <div className="font-medium">
                                    {appointment.customer.firstName} {appointment.customer.lastName}
                                  </div>
                                  <div className="text-muted-foreground">
                                    {appointment.service.name} •{' '}
                                    {new Date(appointment.startTime).toLocaleString('it-IT', {
                                      day: '2-digit',
                                      month: '2-digit',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </div>
                                </div>
                                <a
                                  href={`tel:${appointment.customer.phone}`}
                                  className="flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-primary hover:bg-primary/20"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Phone className="h-3 w-3" />
                                  <span>{appointment.customer.phone}</span>
                                </a>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  );
                });
              })()}
            </TabsContent>
          </Tabs>
        )}
      </main>

      {/* Blocco Dialog */}
      <Dialog open={isTimeOffDialogOpen} onOpenChange={setIsTimeOffDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTimeOff ? 'Modifica Blocco' : 'Nuovo Blocco'}</DialogTitle>
            <DialogDescription>
              {editingTimeOff
                ? 'Modifica i dettagli del blocco orario'
                : 'Aggiungi un nuovo blocco orario per un barbiere'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="time-off-barberId">Barbiere</Label>
              <select
                id="time-off-barberId"
                value={timeOffFormData.barberId}
                onChange={(e) => setTimeOffFormData({ ...timeOffFormData, barberId: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Seleziona barbiere</option>
                {barbers.map((barber) => (
                  <option key={barber.id} value={barber.id}>
                    {barber.firstName} {barber.lastName}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Inizio</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    id="time-off-startDate"
                    type="date"
                    value={timeOffFormData.startDate}
                    onChange={(e) => setTimeOffFormData({ ...timeOffFormData, startDate: e.target.value })}
                    placeholder="Data"
                  />
                  <Input
                    id="time-off-startTime"
                    type="time"
                    value={timeOffFormData.startTime}
                    onChange={(e) => setTimeOffFormData({ ...timeOffFormData, startTime: e.target.value })}
                    placeholder="Ora"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Fine</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    id="time-off-endDate"
                    type="date"
                    value={timeOffFormData.endDate}
                    onChange={(e) => setTimeOffFormData({ ...timeOffFormData, endDate: e.target.value })}
                    placeholder="Data"
                  />
                  <Input
                    id="time-off-endTime"
                    type="time"
                    value={timeOffFormData.endTime}
                    onChange={(e) => setTimeOffFormData({ ...timeOffFormData, endTime: e.target.value })}
                    placeholder="Ora"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="time-off-reason">Motivo (opzionale)</Label>
              <Input
                id="time-off-reason"
                value={timeOffFormData.reason}
                onChange={(e) => setTimeOffFormData({ ...timeOffFormData, reason: e.target.value })}
                placeholder="Es. Ferie, Pausa pranzo, Evento..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseTimeOffDialog}>
              Annulla
            </Button>
            <Button onClick={handleSaveTimeOff} disabled={isSavingTimeOff}>
              {isSavingTimeOff ? 'Salvataggio...' : 'Salva'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AdminTimeBlocksPage() {
  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <AdminTimeBlocksContent />
    </ProtectedRoute>
  );
}
