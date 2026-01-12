'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { ProtectedRoute } from '@/components/protected-route';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ChevronLeft, ChevronRight, Check, User } from 'lucide-react';

type Step = 1 | 2 | 3 | 4;

interface Store {
  id: string;
  name: string;
  address: string;
}

interface Service {
  id: string;
  name: string;
  durationMinutes: number;
  price: number;
}

interface Barber {
  id: string;
  firstName: string;
  lastName: string;
}

interface AvailabilitySlot {
  date: string;
  time: string;
  available: boolean;
}

// Generate next 14 days
const generateDates = () => {
  const dates = [];
  const today = new Date();
  for (let i = 0; i < 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push(date);
  }
  return dates;
};

function NewAppointmentContent() {
  const router = useRouter();
  const { user, getToken } = useAuth();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [selectedStore, setSelectedStore] = useState<string>('');
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedBarber, setSelectedBarber] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');

  const [stores, setStores] = useState<Store[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);

  const dates = generateDates();

  // Load stores
  useEffect(() => {
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
    loadStores();
  }, [getToken]);

  // Load services
  useEffect(() => {
    const loadServices = async () => {
      try {
        const token = getToken();
        const response = await fetch('/api/services', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await response.json();
        if (result.data) {
          setServices(result.data);
        }
      } catch (err) {
        console.error('Error loading services:', err);
      }
    };
    loadServices();
  }, [getToken]);

  // Load barbers
  useEffect(() => {
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
    loadBarbers();
  }, [getToken]);

  // Load availability when store, service, and barber are selected
  useEffect(() => {
    if (selectedStore && selectedService && selectedBarber) {
      const loadAvailability = async () => {
        setIsLoadingAvailability(true);
        try {
          const token = getToken();
          const startDate = new Date();
          const endDate = new Date();
          endDate.setDate(endDate.getDate() + 13);

          const params = new URLSearchParams({
            storeId: selectedStore,
            serviceId: selectedService,
            barberId: selectedBarber,
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
      loadAvailability();
    }
  }, [selectedStore, selectedService, selectedBarber, getToken]);

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return selectedStore !== '';
      case 2:
        return selectedService !== '';
      case 3:
        return selectedBarber !== '';
      case 4:
        return selectedDate !== null && selectedTime !== '';
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (canProceed() && currentStep < 4) {
      // When moving to step 4, pre-select today's date
      if (currentStep === 3) {
        const today = new Date();
        setSelectedDate(today);
      }
      setCurrentStep((currentStep + 1) as Step);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step);
    }
  };

  const handleSubmit = async () => {
    if (!canProceed() || !selectedDate || !user) return;

    setIsSubmitting(true);
    setError('');

    try {
      // Calculate start and end times
      const [hours, minutes] = selectedTime.split(':');
      const startTime = new Date(selectedDate);
      startTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      // Get service duration
      const service = services.find((s) => s.id === selectedService);
      if (!service) {
        setError('Servizio non trovato');
        return;
      }

      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + service.durationMinutes);

      const token = getToken();
      if (!token) {
        setError('Token di autenticazione non trovato');
        return;
      }

      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          customerId: user.id,
          barberId: selectedBarber,
          serviceId: selectedService,
          storeId: selectedStore,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          status: 'CONFIRMED',
        }),
      });

      const result = await response.json();

      if (!response.ok || result.error) {
        setError(result.error || "Errore durante la creazione dell'appuntamento");
        return;
      }

      // Success - redirect to appointments page
      router.push('/customer/appointments');
    } catch (err) {
      setError("Errore durante la creazione dell'appuntamento");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSlotUnavailable = (date: Date, time: string) => {
    const dateStr = date.toISOString().split('T')[0];
    const slot = availability.find((s) => s.date === dateStr && s.time === time);
    return slot ? !slot.available : true;
  };

  const getAvailableTimeSlots = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return availability
      .filter((slot) => slot.date === dateStr)
      .map((slot) => slot.time)
      .filter((time, index, self) => self.indexOf(time) === index)
      .sort();
  };

  const formatDate = (date: Date) => {
    const days = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
    const months = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];
    return {
      day: days[date.getDay()],
      date: date.getDate(),
      month: months[date.getMonth()],
    };
  };

  const getCityFromAddress = (address: string) => {
    // Extract city from address format: "Via Roma 123, 65121 Pescara PE"
    const parts = address.split(',')[1]?.trim().split(' ');
    return parts?.[parts.length - 2] || address;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <main className="container mx-auto px-4 py-4">
        <div className="mb-6">
          <h1 className="mb-2 text-3xl font-bold">Nuovo Appuntamento</h1>
          <p className="text-muted-foreground">Prenota il tuo servizio in pochi passaggi</p>
        </div>

        {/* Step Indicator */}
        <div className="mb-6 flex justify-center overflow-x-auto">
          <div className="flex items-center px-4">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full border-2 sm:h-10 sm:w-10 ${
                      step < currentStep
                        ? 'border-primary bg-primary text-primary-foreground'
                        : step === currentStep
                          ? 'border-primary bg-background text-primary'
                          : 'border-muted bg-background text-muted-foreground'
                    }`}
                  >
                    {step < currentStep ? <Check className="h-4 w-4 sm:h-5 sm:w-5" /> : step}
                  </div>
                  <span
                    className={`mt-1 text-[10px] sm:mt-2 sm:text-xs ${
                      step === currentStep ? 'font-semibold text-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    {step === 1 && 'Sede'}
                    {step === 2 && 'Servizio'}
                    {step === 3 && 'Barbiere'}
                    {step === 4 && 'Data/Ora'}
                  </span>
                </div>
                {step < 4 && (
                  <div className={`mx-2 h-0.5 w-8 sm:mx-4 sm:w-16 ${step < currentStep ? 'bg-primary' : 'bg-muted'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {currentStep === 1 && 'Seleziona la Sede'}
              {currentStep === 2 && 'Seleziona il Servizio'}
              {currentStep === 3 && 'Seleziona il Barbiere'}
              {currentStep === 4 && 'Seleziona Data e Orario'}
            </CardTitle>
            <CardDescription>
              {currentStep === 1 && 'Scegli la sede dove vuoi prenotare'}
              {currentStep === 2 && 'Scegli il servizio che desideri'}
              {currentStep === 3 && 'Scegli il barbiere che preferisci'}
              {currentStep === 4 && 'Scegli quando vuoi venire'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Step 1: Store Selection */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  {stores.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground">Caricamento...</div>
                  ) : (
                    <div className="grid gap-3">
                      {stores.map((store) => (
                        <button
                          key={store.id}
                          onClick={() => setSelectedStore(store.id)}
                          className={`flex items-center gap-3 rounded-lg border-2 p-4 text-left transition-colors w-full ${
                            selectedStore === store.id
                              ? 'border-primary bg-primary/5'
                              : 'border-muted hover:border-primary/50'
                          }`}
                        >
                          <div className="flex-1">
                            <div className="font-semibold">{getCityFromAddress(store.address)}</div>
                            <div className="text-sm text-muted-foreground">{store.address}</div>
                          </div>
                          {selectedStore === store.id && (
                            <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                              <Check className="h-3 w-3 text-primary-foreground" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Service Selection */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  {services.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground">Caricamento...</div>
                  ) : (
                    <div className="grid gap-3">
                      {services.map((service) => (
                        <button
                          key={service.id}
                          onClick={() => setSelectedService(service.id)}
                          className={`flex items-center gap-3 rounded-lg border-2 p-4 text-left transition-colors w-full ${
                            selectedService === service.id
                              ? 'border-primary bg-primary/5'
                              : 'border-muted hover:border-primary/50'
                          }`}
                        >
                          <div className="flex-1 min-w-0 overflow-hidden">
                            <div className="font-semibold">{service.name}</div>
                            <div className="text-sm text-muted-foreground">{service.durationMinutes} minuti</div>
                          </div>
                          <div className="text-lg font-bold whitespace-nowrap shrink-0">
                            €{service.price.toFixed(2)}
                          </div>
                          {selectedService === service.id && (
                            <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                              <Check className="h-3 w-3 text-primary-foreground" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Barber Selection */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  {barbers.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground">Caricamento...</div>
                  ) : (
                    <div className="grid gap-3">
                      {barbers.map((barber) => (
                        <button
                          key={barber.id}
                          onClick={() => setSelectedBarber(barber.id)}
                          className={`flex items-center gap-3 rounded-lg border-2 p-4 text-left transition-colors w-full ${
                            selectedBarber === barber.id
                              ? 'border-primary bg-primary/5'
                              : 'border-muted hover:border-primary/50'
                          }`}
                        >
                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                            <User className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div className="font-semibold flex-1 min-w-0">
                            {barber.firstName} {barber.lastName}
                          </div>
                          {selectedBarber === barber.id && (
                            <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                              <Check className="h-3 w-3 text-primary-foreground" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: Date and Time Selection */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  {isLoadingAvailability ? (
                    <div className="py-8 text-center text-muted-foreground">Caricamento disponibilità...</div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label>Seleziona la Data</Label>
                        <div className="flex gap-2 overflow-x-auto pb-2">
                          {dates.map((date) => {
                            const formatted = formatDate(date);
                            const isSelected = selectedDate?.toDateString() === date.toDateString();
                            const hasAvailableSlots = getAvailableTimeSlots(date).length > 0;
                            return (
                              <button
                                key={date.toISOString()}
                                onClick={() => {
                                  setSelectedDate(date);
                                  setSelectedTime(''); // Reset time when date changes
                                }}
                                disabled={!hasAvailableSlots}
                                className={`flex min-w-[70px] flex-col items-center gap-1 rounded-lg border-2 px-3 py-2 transition-colors ${
                                  !hasAvailableSlots
                                    ? 'cursor-not-allowed border-border bg-muted text-muted-foreground opacity-50'
                                    : isSelected
                                      ? 'border-primary bg-primary text-primary-foreground'
                                      : 'border-border bg-background hover:border-primary/50'
                                }`}
                              >
                                <span className="text-xs font-medium">{formatted.day}</span>
                                <span className="text-lg font-bold">{formatted.date}</span>
                                <span className="text-xs">{formatted.month}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Seleziona l'Orario</Label>
                        {!selectedDate ? (
                          <div className="py-8 text-center text-sm text-muted-foreground">
                            Seleziona una data per vedere gli orari disponibili
                          </div>
                        ) : getAvailableTimeSlots(selectedDate).length === 0 ? (
                          <div className="py-8 text-center text-sm text-muted-foreground">
                            Nessuno slot disponibile per questa data
                          </div>
                        ) : (
                          <div className="grid max-h-[300px] grid-cols-3 gap-2 overflow-y-auto">
                            {getAvailableTimeSlots(selectedDate).map((time) => {
                              const isUnavailable = isSlotUnavailable(selectedDate, time);
                              const isSelected = selectedTime === time;
                              return (
                                <button
                                  key={time}
                                  onClick={() => !isUnavailable && setSelectedTime(time)}
                                  disabled={isUnavailable}
                                  className={`rounded-lg border-2 px-4 py-3 text-sm font-medium transition-colors ${
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
                    </>
                  )}
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="rounded-lg border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-3 pt-4">
                {currentStep > 1 && (
                  <Button variant="outline" onClick={handlePrevious} className="flex-1" disabled={isSubmitting}>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Indietro
                  </Button>
                )}
                {currentStep < 4 ? (
                  <Button onClick={handleNext} disabled={!canProceed()} className="flex-1">
                    Avanti
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button onClick={handleSubmit} disabled={!canProceed() || isSubmitting} className="flex-1">
                    {isSubmitting ? 'Creazione in corso...' : 'Conferma Prenotazione'}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Card */}
        {(selectedStore || selectedService || selectedBarber || (selectedDate && selectedTime)) && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Riepilogo Prenotazione</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {selectedStore && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sede:</span>
                  <span className="font-medium">
                    {(() => {
                      const store = stores.find((s) => s.id === selectedStore);
                      return store ? getCityFromAddress(store.address) : selectedStore;
                    })()}
                  </span>
                </div>
              )}
              {selectedService && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Servizio:</span>
                  <span className="font-medium">
                    {services.find((s) => s.id === selectedService)?.name || selectedService}
                  </span>
                </div>
              )}
              {selectedBarber && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Barbiere:</span>
                  <span className="font-medium">
                    {(() => {
                      const barber = barbers.find((b) => b.id === selectedBarber);
                      return barber ? `${barber.firstName} ${barber.lastName}` : selectedBarber;
                    })()}
                  </span>
                </div>
              )}
              {selectedDate && selectedTime && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Data e Ora:</span>
                  <span className="font-medium">
                    {selectedDate.toLocaleDateString('it-IT', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                    })}{' '}
                    alle {selectedTime}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

export default function NewAppointmentPage() {
  return (
    <ProtectedRoute allowedRoles={['CUSTOMER']}>
      <NewAppointmentContent />
    </ProtectedRoute>
  );
}
