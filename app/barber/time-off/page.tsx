'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { ProtectedRoute } from '@/components/protected-route';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, Plus, Trash2 } from 'lucide-react';

interface TimeOff {
  id: string;
  barberId: string;
  startDate: string;
  endDate: string;
  reason: string | null;
  createdAt: string;
}

function BarberTimeOffContent() {
  const { user, getToken } = useAuth();
  const [timeOffs, setTimeOffs] = useState<TimeOff[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadTimeOffs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadTimeOffs = async () => {
    setIsLoading(true);
    try {
      const token = getToken();
      const response = await fetch(`/api/barber-time-off?barberId=${user?.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (result.data) {
        setTimeOffs(result.data);
      }
    } catch (err) {
      console.error('Error loading time offs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = () => {
    setIsAdding(true);
    setError('');
  };

  const handleCancel = () => {
    setIsAdding(false);
    setStartDate('');
    setEndDate('');
    setReason('');
    setError('');
  };

  const handleSave = async () => {
    if (!startDate || !endDate) {
      setError('Inserisci data di inizio e fine');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      setError('La data di fine deve essere successiva alla data di inizio');
      return;
    }

    try {
      const token = getToken();

      const response = await fetch('/api/barber-time-off', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          barberId: user?.id,
          startDate: start.toISOString(),
          endDate: end.toISOString(),
          reason: reason || null,
        }),
      });

      if (response.ok) {
        await loadTimeOffs();
        handleCancel();
      } else {
        setError('Errore durante il salvataggio');
      }
    } catch (err) {
      console.error('Error saving time off:', err);
      setError('Errore durante il salvataggio');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questa assenza?')) return;

    setDeletingId(id);
    try {
      const token = getToken();
      const response = await fetch(`/api/barber-time-off/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        await loadTimeOffs();
      } else {
        alert("Errore durante l'eliminazione");
      }
    } catch (err) {
      console.error('Error deleting time off:', err);
      alert("Errore durante l'eliminazione");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const now = new Date();
  const upcomingTimeOffs = timeOffs.filter((t) => new Date(t.endDate) >= now);
  const pastTimeOffs = timeOffs.filter((t) => new Date(t.endDate) < now);

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-153px)] bg-background">
        <main className="container mx-auto px-4 py-4">
          <div className="mb-6">
            <h1 className="mb-2 text-3xl font-bold">Assenze</h1>
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
          <h1 className="mb-2 text-3xl font-bold">Assenze</h1>
          <p className="text-muted-foreground">Gestisci i tuoi periodi di assenza</p>
        </div>

        {/* Add New Time Off */}
        {!isAdding ? (
          <Button onClick={handleAdd} className="mb-6 w-full">
            <Plus className="mr-2 h-4 w-4" />
            Aggiungi Assenza
          </Button>
        ) : (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Nuova Assenza</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                  {error}
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Data Inizio</Label>
                  <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">Data Fine</Label>
                  <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Motivo (opzionale)</Label>
                <Input
                  id="reason"
                  type="text"
                  placeholder="Ferie, Malattia, ecc."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button className="flex-1" onClick={handleSave}>
                  Salva
                </Button>
                <Button variant="outline" className="flex-1" onClick={handleCancel}>
                  Annulla
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upcoming Time Offs */}
        <div className="mb-6">
          <h2 className="mb-4 text-xl font-bold">Prossime Assenze</h2>
          {upcomingTimeOffs.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <p className="mb-2 text-muted-foreground">Nessuna assenza programmata</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {upcomingTimeOffs.map((timeOff) => (
                <Card key={timeOff.id}>
                  <CardContent className="flex items-center justify-between py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {formatDate(timeOff.startDate)} - {formatDate(timeOff.endDate)}
                        </span>
                      </div>
                      {timeOff.reason && <p className="text-sm text-muted-foreground">{timeOff.reason}</p>}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(timeOff.id)}
                      disabled={deletingId === timeOff.id}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Past Time Offs */}
        {pastTimeOffs.length > 0 && (
          <div>
            <h2 className="mb-4 text-xl font-bold">Storico Assenze</h2>
            <div className="space-y-4">
              {pastTimeOffs.map((timeOff) => (
                <Card key={timeOff.id} className="opacity-75">
                  <CardContent className="flex items-center justify-between py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {formatDate(timeOff.startDate)} - {formatDate(timeOff.endDate)}
                        </span>
                      </div>
                      {timeOff.reason && <p className="text-sm text-muted-foreground">{timeOff.reason}</p>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function BarberTimeOffPage() {
  return (
    <ProtectedRoute allowedRoles={['BARBER', 'ADMIN']}>
      <BarberTimeOffContent />
    </ProtectedRoute>
  );
}
