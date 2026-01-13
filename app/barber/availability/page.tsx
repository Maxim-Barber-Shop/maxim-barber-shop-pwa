'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { ProtectedRoute } from '@/components/protected-route';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Clock, Plus, Trash2, MapPin } from 'lucide-react';

interface Store {
  id: string;
  name: string;
  address: string;
}

interface WeeklyHour {
  id: string;
  barberId: string;
  storeId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  store: Store;
}

const DAYS_OF_WEEK = [
  { value: 1, label: 'Lunedì' },
  { value: 2, label: 'Martedì' },
  { value: 3, label: 'Mercoledì' },
  { value: 4, label: 'Giovedì' },
  { value: 5, label: 'Venerdì' },
  { value: 6, label: 'Sabato' },
  { value: 0, label: 'Domenica' },
];

function BarberAvailabilityContent() {
  const { user, getToken } = useAuth();
  const [weeklyHours, setWeeklyHours] = useState<WeeklyHour[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [selectedStore, setSelectedStore] = useState<string | null>(null);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('18:00');
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const token = getToken();

      // Load weekly hours
      const hoursResponse = await fetch(`/api/barber-weekly-hours?barberId=${user?.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const hoursResult = await hoursResponse.json();
      if (hoursResult.data) {
        setWeeklyHours(hoursResult.data);
      }

      // Load stores
      const storesResponse = await fetch('/api/stores', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const storesResult = await storesResponse.json();
      if (storesResult.data) {
        setStores(storesResult.data);
      }
    } catch (err) {
      console.error('Error loading data:', err);
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
    setSelectedDays([]);
    setSelectedStore(null);
    setStartTime('09:00');
    setEndTime('18:00');
    setError('');
  };

  const toggleDay = (dayValue: number) => {
    setSelectedDays((prev) => {
      if (prev.includes(dayValue)) {
        return prev.filter((d) => d !== dayValue);
      } else {
        return [...prev, dayValue];
      }
    });
  };

  const handleSave = async () => {
    if (selectedDays.length === 0) {
      setError('Seleziona almeno un giorno');
      return;
    }

    if (!selectedStore) {
      setError('Seleziona una sede');
      return;
    }

    if (!startTime || !endTime) {
      setError('Inserisci orario di inizio e fine');
      return;
    }

    try {
      const token = getToken();

      // Create Date objects for today with the specified times
      const today = new Date();
      const [startHour, startMinute] = startTime.split(':');
      const [endHour, endMinute] = endTime.split(':');

      const start = new Date(today);
      start.setHours(parseInt(startHour), parseInt(startMinute), 0, 0);

      const end = new Date(today);
      end.setHours(parseInt(endHour), parseInt(endMinute), 0, 0);

      // Create an entry for each selected day
      const promises = selectedDays.map((dayOfWeek) =>
        fetch('/api/barber-weekly-hours', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            barberId: user?.id,
            storeId: selectedStore,
            dayOfWeek,
            startTime: start.toISOString(),
            endTime: end.toISOString(),
          }),
        }),
      );

      const responses = await Promise.all(promises);
      const allSuccessful = responses.every((response) => response.ok);

      if (allSuccessful) {
        await loadData();
        handleCancel();
      } else {
        setError('Errore durante il salvataggio di alcuni orari');
      }
    } catch (err) {
      console.error('Error saving weekly hours:', err);
      setError('Errore durante il salvataggio');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo orario?')) return;

    setDeletingId(id);
    try {
      const token = getToken();
      const response = await fetch(`/api/barber-weekly-hours/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        await loadData();
      } else {
        alert("Errore durante l'eliminazione");
      }
    } catch (err) {
      console.error('Error deleting weekly hour:', err);
      alert("Errore durante l'eliminazione");
    } finally {
      setDeletingId(null);
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

  const groupedHours = DAYS_OF_WEEK.map((day) => ({
    ...day,
    hours: weeklyHours.filter((h) => h.dayOfWeek === day.value),
  }));

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-153px)] bg-background">
        <main className="container mx-auto px-4 py-4">
          <div className="mb-6">
            <h1 className="mb-2 text-3xl font-bold">Disponibilità</h1>
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
          <h1 className="mb-2 text-3xl font-bold">Disponibilità</h1>
          <p className="text-muted-foreground">Gestisci i tuoi orari settimanali</p>
        </div>

        {/* Add New Hour */}
        {!isAdding ? (
          <Button onClick={handleAdd} className="mb-6 w-full">
            <Plus className="mr-2 h-4 w-4" />
            Aggiungi Orario
          </Button>
        ) : (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Nuovo Orario</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label>Giorni (selezione multipla)</Label>
                <div className="grid gap-2">
                  {DAYS_OF_WEEK.map((day) => (
                    <button
                      key={day.value}
                      onClick={() => toggleDay(day.value)}
                      className={`flex items-center justify-between rounded-lg border-2 p-3 text-left transition-colors ${
                        selectedDays.includes(day.value)
                          ? 'border-primary bg-primary/5'
                          : 'border-muted hover:border-primary/50'
                      }`}
                    >
                      <span>{day.label}</span>
                      {selectedDays.includes(day.value) && (
                        <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                          <svg
                            className="h-3 w-3 text-primary-foreground"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Sede</Label>
                <div className="grid gap-2">
                  {stores.map((store) => (
                    <button
                      key={store.id}
                      onClick={() => setSelectedStore(store.id)}
                      className={`rounded-lg border-2 p-3 text-left transition-colors ${
                        selectedStore === store.id
                          ? 'border-primary bg-primary/5'
                          : 'border-muted hover:border-primary/50'
                      }`}
                    >
                      <div className="font-semibold">{getCityFromAddress(store.address)}</div>
                      <div className="text-sm text-muted-foreground">{store.address}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Ora Inizio</Label>
                  <Input id="startTime" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">Ora Fine</Label>
                  <Input id="endTime" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                </div>
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

        {/* Weekly Hours */}
        <div className="space-y-4">
          {groupedHours.map((day) => (
            <Card key={day.value}>
              <CardHeader>
                <CardTitle className="text-lg">{day.label}</CardTitle>
                {day.hours.length === 0 && <CardDescription>Nessun orario impostato</CardDescription>}
              </CardHeader>
              {day.hours.length > 0 && (
                <CardContent className="space-y-2">
                  {day.hours.map((hour) => (
                    <div key={hour.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {formatTime(hour.startTime)} - {formatTime(hour.endTime)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{getCityFromAddress(hour.store.address)}</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(hour.id)}
                        disabled={deletingId === hour.id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}

export default function BarberAvailabilityPage() {
  return (
    <ProtectedRoute allowedRoles={['BARBER', 'ADMIN']}>
      <BarberAvailabilityContent />
    </ProtectedRoute>
  );
}
