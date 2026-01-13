'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import {
  generateDates,
  formatDateItalian,
  getAvailableTimeSlots,
  isSlotUnavailable,
  type AvailabilitySlot,
} from '@/lib/utils/date-time';
import type { Customer, Service, Barber, AppointmentStatus } from '@/lib/types/appointment';

interface Store {
  id: string;
  name: string;
}

interface Appointment {
  id: string;
  customerId: string;
  barberId: string;
  serviceId: string;
  storeId: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
}

interface AppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment?: Appointment | null;
  onSuccess: () => void;
}

export function AppointmentDialog({ open, onOpenChange, appointment, onSuccess }: AppointmentDialogProps) {
  const { getToken } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Customer[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Form data
  const [customerId, setCustomerId] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [storeId, setStoreId] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [barberId, setBarberId] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [status, setStatus] = useState<'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW'>('CONFIRMED');

  // Availability
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
  const [dateTimeDialogOpen, setDateTimeDialogOpen] = useState(false);

  // Options
  const [stores, setStores] = useState<Store[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const dates = generateDates();

  useEffect(() => {
    if (open) {
      loadStores();
      if (appointment) {
        // Edit mode - populate form
        setCustomerId(appointment.customerId);
        setStoreId(appointment.storeId);
        setServiceId(appointment.serviceId);
        setBarberId(appointment.barberId);
        setStatus(appointment.status);

        const startDate = new Date(appointment.startTime);
        setSelectedDate(startDate);
        setSelectedTime(
          `${startDate.getHours().toString().padStart(2, '0')}:${startDate.getMinutes().toString().padStart(2, '0')}`,
        );
      } else {
        // Create mode - reset form
        resetForm();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, appointment]);

  useEffect(() => {
    if (storeId) {
      loadBarbers(storeId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId]);

  // Load services when store and barber are selected
  useEffect(() => {
    if (storeId && barberId) {
      loadServices(barberId, storeId);
    } else {
      setServices([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId, barberId]);

  // Load availability when store, service, and barber are selected
  useEffect(() => {
    if (storeId && serviceId && barberId) {
      loadAvailability();
    } else {
      setAvailability([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId, serviceId, barberId]);

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchQuery.length >= 2) {
        searchCustomers(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delaySearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const resetForm = () => {
    setCustomerId('');
    setSelectedCustomer(null);
    setStoreId('');
    setServiceId('');
    setBarberId('');
    setSelectedDate(null);
    setSelectedTime('');
    setStatus('CONFIRMED');
    setSearchQuery('');
    setSearchResults([]);
    setAvailability([]);
    setError('');
  };

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

  const loadServices = async (barberId: string, storeId: string) => {
    try {
      const token = getToken();
      const response = await fetch(`/api/services?barberId=${barberId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (result.data) {
        // Filter services by storeId since each service is now specific to a store
        const filteredServices = result.data.filter((service: Service) => service.storeId === storeId);
        setServices(filteredServices);
      }
    } catch (err) {
      console.error('Error loading services:', err);
    }
  };

  const loadBarbers = async (selectedStoreId: string) => {
    try {
      const token = getToken();
      const response = await fetch(`/api/barbers?storeId=${selectedStoreId}`, {
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

  const searchCustomers = async (query: string) => {
    setIsSearching(true);
    try {
      const token = getToken();
      const response = await fetch(`/api/users?search=${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (result.data) {
        // Filter only customers
        const customers = result.data.filter((user: Customer & { role: string }) => user.role === 'CUSTOMER');
        setSearchResults(customers);
      }
    } catch (err) {
      console.error('Error searching customers:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const selectCustomer = (customer: Customer) => {
    setCustomerId(customer.id);
    setSelectedCustomer(customer);
    setSearchQuery('');
    setSearchResults([]);
  };

  const loadAvailability = async () => {
    setIsLoadingAvailability(true);
    try {
      const token = getToken();
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 29);

      const params = new URLSearchParams({
        storeId: storeId,
        serviceId: serviceId,
        barberId: barberId,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      });

      const response = await fetch(`/api/availability?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (result.data) {
        setAvailability(result.data);
      }
    } catch (err) {
      console.error('Error loading availability:', err);
    } finally {
      setIsLoadingAvailability(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!customerId || !storeId || !serviceId || !barberId || !selectedDate || !selectedTime) {
      setError('Tutti i campi sono obbligatori');
      return;
    }

    setIsSubmitting(true);

    try {
      const token = getToken();

      // Calculate start and end times
      const [hours, minutes] = selectedTime.split(':');
      const startTime = new Date(selectedDate);
      startTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const service = services.find((s) => s.id === serviceId);
      if (!service) {
        setError('Servizio non trovato');
        return;
      }

      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + service.durationMinutes);

      const body = {
        customerId,
        barberId,
        serviceId,
        storeId,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        status,
      };

      const url = appointment ? `/api/appointments/${appointment.id}` : '/api/appointments';
      const method = appointment ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (!response.ok || result.error) {
        setError(result.error || 'Errore durante il salvataggio');
        return;
      }

      onSuccess();
      onOpenChange(false);
    } catch (err) {
      setError('Errore durante il salvataggio');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{appointment ? 'Modifica Appuntamento' : 'Nuovo Appuntamento'}</DialogTitle>
          <DialogDescription>
            {appointment ? "Modifica i dettagli dell'appuntamento" : 'Crea un nuovo appuntamento per un cliente'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Customer Search - Only in create mode */}
            {!appointment && (
              <div className="space-y-2">
                <Label>Cliente *</Label>
                {selectedCustomer ? (
                  <div className="flex items-center justify-between rounded-lg border p-3 bg-muted">
                    <div>
                      <div className="font-medium">
                        {selectedCustomer.firstName} {selectedCustomer.lastName}
                      </div>
                      <div className="text-base text-muted-foreground">{selectedCustomer.phone}</div>
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedCustomer(null)}>
                      Cambia
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Cerca cliente per nome..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    {searchResults.length > 0 && (
                      <div className="rounded-lg border bg-background max-h-48 overflow-y-auto">
                        {searchResults.map((customer) => (
                          <button
                            key={customer.id}
                            type="button"
                            onClick={() => selectCustomer(customer)}
                            className="w-full text-left px-4 py-3 hover:bg-muted border-b last:border-b-0 transition-colors"
                          >
                            <div className="font-medium">
                              {customer.firstName} {customer.lastName}
                            </div>
                            <div className="text-base text-muted-foreground">{customer.phone}</div>
                          </button>
                        ))}
                      </div>
                    )}
                    {isSearching && <div className="text-base text-muted-foreground">Ricerca in corso...</div>}
                  </>
                )}
              </div>
            )}

            {/* Store */}
            <div className="space-y-2">
              <Label htmlFor="store">Sede *</Label>
              <Select value={storeId} onValueChange={setStoreId}>
                <SelectTrigger id="store">
                  <SelectValue placeholder="Seleziona sede" />
                </SelectTrigger>
                <SelectContent>
                  {stores.map((store) => (
                    <SelectItem key={store.id} value={store.id}>
                      {store.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Service */}
            <div className="space-y-2">
              <Label htmlFor="service">Servizio *</Label>
              <Select value={serviceId} onValueChange={setServiceId}>
                <SelectTrigger id="service">
                  <SelectValue placeholder="Seleziona servizio" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name} -{' '}
                      {service.discountedPrice
                        ? `€${service.discountedPrice.toFixed(2)} (invece di €${service.price.toFixed(2)})`
                        : `€${service.price.toFixed(2)}`}{' '}
                      ({service.durationMinutes} min)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Barber */}
            <div className="space-y-2">
              <Label htmlFor="barber">Barbiere *</Label>
              <Select value={barberId} onValueChange={setBarberId} disabled={!storeId}>
                <SelectTrigger id="barber">
                  <SelectValue placeholder={storeId ? 'Seleziona barbiere' : 'Seleziona prima una sede'} />
                </SelectTrigger>
                <SelectContent>
                  {barbers.map((barber) => (
                    <SelectItem key={barber.id} value={barber.id}>
                      {barber.firstName} {barber.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date and Time - Summary Button */}
            {storeId && serviceId && barberId && (
              <div className="space-y-2">
                <Label>Data e Ora *</Label>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                  onClick={() => setDateTimeDialogOpen(true)}
                >
                  {selectedDate && selectedTime ? (
                    <span>
                      {selectedDate.toLocaleDateString('it-IT', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}{' '}
                      alle {selectedTime}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Seleziona data e ora</span>
                  )}
                </Button>
              </div>
            )}

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Stato</Label>
              <Select value={status} onValueChange={(value) => setStatus(value as typeof status)}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CONFIRMED">Confermato</SelectItem>
                  <SelectItem value="COMPLETED">Completato</SelectItem>
                  <SelectItem value="CANCELLED">Annullato</SelectItem>
                  <SelectItem value="NO_SHOW">Assente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {error && (
              <div className="rounded-lg border border-destructive bg-destructive/10 p-3 text-base text-destructive">
                {error}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Annulla
            </Button>
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                (!appointment && !customerId) ||
                !storeId ||
                !serviceId ||
                !barberId ||
                !selectedDate ||
                !selectedTime
              }
            >
              {isSubmitting ? 'Salvataggio...' : appointment ? 'Salva Modifiche' : 'Crea Appuntamento'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>

      {/* Date/Time Selection Dialog */}
      <Dialog open={dateTimeDialogOpen} onOpenChange={setDateTimeDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto max-w-2xl">
          <DialogHeader>
            <DialogTitle>Seleziona Data e Orario</DialogTitle>
            <DialogDescription>Scegli quando vuoi prenotare l&apos;appuntamento</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {isLoadingAvailability ? (
              <div className="py-8 text-center text-muted-foreground">Caricamento disponibilità...</div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label>Seleziona la Data</Label>
                  <div className="flex gap-2 overflow-x-auto pb-2 max-w-[85vw] max-h-[90vh]">
                    {dates.map((date) => {
                      const formatted = formatDateItalian(date);
                      const isSelected = selectedDate?.toDateString() === date.toDateString();
                      const hasAvailableSlots = getAvailableTimeSlots(date, availability).length > 0;
                      return (
                        <button
                          key={date.toISOString()}
                          type="button"
                          onClick={() => {
                            setSelectedDate(date);
                            setSelectedTime('');
                          }}
                          disabled={!hasAvailableSlots}
                          className={`flex min-w-17.5 flex-col items-center gap-1 rounded-lg border-2 px-3 py-2 transition-colors ${
                            !hasAvailableSlots
                              ? 'cursor-not-allowed border-border bg-muted text-muted-foreground opacity-50'
                              : isSelected
                                ? 'border-primary bg-primary text-primary-foreground'
                                : 'border-border bg-background hover:border-primary/50'
                          }`}
                        >
                          <span className="text-sm font-medium">{formatted.day}</span>
                          <span className="text-lg font-bold">{formatted.date}</span>
                          <span className="text-sm">{formatted.month}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {selectedDate && (
                  <div className="space-y-2">
                    <Label>Seleziona l&apos;Orario</Label>
                    {getAvailableTimeSlots(selectedDate, availability).length === 0 ? (
                      <div className="py-8 text-center text-base text-muted-foreground">
                        Nessuno slot disponibile per questa data
                      </div>
                    ) : (
                      <div className="grid max-h-[300px] grid-cols-4 gap-2 overflow-y-auto">
                        {getAvailableTimeSlots(selectedDate, availability).map((time) => {
                          const isUnavailable = isSlotUnavailable(selectedDate, time, availability);
                          const isSelected = selectedTime === time;
                          return (
                            <button
                              key={time}
                              type="button"
                              onClick={() => !isUnavailable && setSelectedTime(time)}
                              disabled={isUnavailable}
                              className={`rounded-lg border-2 px-4 py-3 text-base font-medium transition-colors ${
                                isUnavailable
                                  ? 'cursor-not-allowed border-border bg-muted text-muted-foreground line-through'
                                  : isSelected
                                    ? 'border-primary bg-primary text-primary-foreground'
                                    : 'border-border bg-background hover:border-primary/50'
                              }`}
                            >
                              {time}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setDateTimeDialogOpen(false);
              }}
            >
              Annulla
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (selectedDate && selectedTime) {
                  setDateTimeDialogOpen(false);
                }
              }}
              disabled={!selectedDate || !selectedTime}
            >
              Conferma
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
