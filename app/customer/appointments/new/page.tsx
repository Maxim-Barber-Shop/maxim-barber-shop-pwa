'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { ProtectedRoute } from '@/components/protected-route';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ChevronLeft, ChevronRight, Check, User, AlertCircle } from 'lucide-react';
import {
  generateDates,
  formatDateItalian,
  getAvailableTimeSlots,
  isSlotUnavailable,
  type AvailabilitySlot,
} from '@/lib/utils/date-time';
import type { Store, Service, Barber, BookingLimits, ServiceCategory } from '@/lib/types/appointment';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

type Step = 1 | 2 | 3 | 4;

function NewAppointmentContent() {
  const router = useRouter();
  const { user, getToken } = useAuth();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [selectedStore, setSelectedStore] = useState<string>('');
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedBarber, setSelectedBarber] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory>('COMBO');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');

  const [stores, setStores] = useState<Store[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
  const [isLoadingBarbers, setIsLoadingBarbers] = useState(false);
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  const [bookingLimits, setBookingLimits] = useState<BookingLimits | null>(null);
  const [isLoadingLimits, setIsLoadingLimits] = useState(true);

  const dates = generateDates();

  // Load booking limits
  useEffect(() => {
    const loadLimits = async () => {
      setIsLoadingLimits(true);
      try {
        const token = getToken();
        const response = await fetch('/api/appointments/check-limits', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await response.json();
        if (result.data) {
          setBookingLimits(result.data);
        }
      } catch (err) {
        console.error('Error loading booking limits:', err);
      } finally {
        setIsLoadingLimits(false);
      }
    };
    loadLimits();
  }, [getToken]);

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

  // Load services when barber is selected
  useEffect(() => {
    if (!selectedBarber || !selectedStore) {
      setServices([]);
      setIsLoadingServices(false);
      return;
    }

    // Reset service selection when barber changes
    setSelectedService('');
    setSelectedDate(null);
    setSelectedTime('');

    const loadServices = async () => {
      setIsLoadingServices(true);
      try {
        const token = getToken();
        const response = await fetch(`/api/services?barberId=${selectedBarber}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await response.json();
        // Filter services by storeId since each service is now specific to a store
        const filteredServices = (result.data || []).filter((service: Service) => service.storeId === selectedStore);
        setServices(filteredServices);
      } catch (err) {
        console.error('Error loading services:', err);
        setServices([]);
      } finally {
        setIsLoadingServices(false);
      }
    };
    loadServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBarber, selectedStore]);

  // Load barbers when store is selected
  useEffect(() => {
    if (!selectedStore) {
      setBarbers([]);
      setIsLoadingBarbers(false);
      return;
    }

    // Reset selections when store changes
    setSelectedBarber('');
    setSelectedService('');
    setSelectedDate(null);
    setSelectedTime('');

    const loadBarbers = async () => {
      setIsLoadingBarbers(true);
      try {
        const token = getToken();
        const response = await fetch(`/api/barbers?storeId=${selectedStore}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await response.json();
        // Always update barbers state, even if empty
        setBarbers(result.data || []);
      } catch (err) {
        console.error('Error loading barbers:', err);
        setBarbers([]);
      } finally {
        setIsLoadingBarbers(false);
      }
    };
    loadBarbers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStore]);

  // Load availability when store, service, and barber are selected
  useEffect(() => {
    if (selectedStore && selectedService && selectedBarber) {
      const loadAvailability = async () => {
        setIsLoadingAvailability(true);
        try {
          const token = getToken();
          const startDate = new Date();
          const endDate = new Date();
          endDate.setDate(endDate.getDate() + 34); // 5 weeks (35 days - 1)

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
        return selectedBarber !== '';
      case 3:
        return selectedService !== '';
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

  const getCityFromAddress = (address: string) => {
    // Extract city from address format: "Via Roma 123, 65121 Pescara PE"
    const parts = address.split(',')[1]?.trim().split(' ');
    return parts?.[parts.length - 2] || address;
  };

  const isDateBlockedByLimits = (date: Date): boolean => {
    if (!bookingLimits) return false;

    // Check weekly limit
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const now = new Date();
    const currentWeekStart = new Date(now);
    currentWeekStart.setDate(now.getDate() - now.getDay());
    currentWeekStart.setHours(0, 0, 0, 0);

    const isSameWeek = weekStart.getTime() === currentWeekStart.getTime();
    if (isSameWeek && !bookingLimits.canBookThisWeek) {
      return true;
    }

    // Check monthly limit
    const isSameMonth = date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    if (isSameMonth && !bookingLimits.canBookThisMonth) {
      return true;
    }

    return false;
  };

  return (
    <div className="min-h-[calc(100vh-153px)] bg-background">
      {/* Main Content */}
      <main className="container mx-auto px-4 py-4">
        <div className="mb-6">
          <h1 className="mb-3 text-4xl font-bold">Nuovo Appuntamento</h1>
          <p className="text-lg text-muted-foreground">Prenota il tuo servizio in pochi passaggi</p>
        </div>

        {/* Booking Limits Banner - Show only when limit is reached */}
        {!isLoadingLimits && bookingLimits && !bookingLimits.canBook && (
          <div className="mb-6 rounded-lg border border-destructive bg-destructive/10 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-destructive mb-1">Limite di prenotazioni raggiunto</h3>
                <div className="text-sm text-destructive/90 space-y-1">
                  {!bookingLimits.canBookThisWeek && (
                    <p>
                      Hai già prenotato {bookingLimits.appointmentsThisWeek} su {bookingLimits.weeklyLimit} appuntament
                      {bookingLimits.weeklyLimit > 1 ? 'i' : 'o'} disponibili questa settimana.
                    </p>
                  )}
                  {!bookingLimits.canBookThisMonth && (
                    <p>
                      Hai già prenotato {bookingLimits.appointmentsThisMonth} su {bookingLimits.monthlyLimit}{' '}
                      appuntament{bookingLimits.monthlyLimit > 1 ? 'i' : 'o'} disponibili questo mese.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

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
                    className={`mt-1 text-xs sm:mt-2 sm:text-sm ${
                      step === currentStep ? 'font-semibold text-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    {step === 1 && 'Sede'}
                    {step === 2 && 'Barbiere'}
                    {step === 3 && 'Servizio'}
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
              {currentStep === 2 && 'Seleziona il Barbiere'}
              {currentStep === 3 && 'Seleziona il Servizio'}
              {currentStep === 4 && 'Seleziona Data e Orario'}
            </CardTitle>
            <CardDescription>
              {currentStep === 1 && 'Scegli la sede dove vuoi prenotare'}
              {currentStep === 2 && 'Scegli il barbiere che preferisci'}
              {currentStep === 3 && 'Scegli il servizio che desideri'}
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
                            <div className="font-semibold">{getCityFromAddress(store.name)}</div>
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

              {/* Step 2: Barber Selection */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  {isLoadingBarbers ? (
                    <div className="py-8 text-center text-muted-foreground">Caricamento...</div>
                  ) : barbers.length === 0 ? (
                    <div className="py-8 text-center">
                      <p className="text-muted-foreground">Nessun barbiere disponibile per questa sede.</p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Torna indietro e seleziona un&apos;altra sede.
                      </p>
                    </div>
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
                          <div className="font-semibold flex-1 min-w-0">{barber.firstName}</div>
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

              {/* Step 3: Service Selection */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  {isLoadingServices ? (
                    <div className="py-8 text-center text-muted-foreground">Caricamento...</div>
                  ) : services.length === 0 ? (
                    <div className="py-8 text-center">
                      <p className="text-muted-foreground">Nessun servizio disponibile per questo barbiere.</p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Torna indietro e seleziona un altro barbiere.
                      </p>
                    </div>
                  ) : (
                    <>
                      <Tabs
                        value={selectedCategory}
                        onValueChange={(value) => {
                          setSelectedCategory(value as ServiceCategory);
                          setSelectedService('');
                        }}
                      >
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="COMBO">Combo</TabsTrigger>
                          <TabsTrigger value="CAPELLI">Capelli</TabsTrigger>
                          <TabsTrigger value="BARBA">Barba</TabsTrigger>
                        </TabsList>
                      </Tabs>
                      <div className="grid gap-3">
                        {services
                          .filter((s) => s.category === selectedCategory)
                          .map((service) => (
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
                                {service.description && (
                                  <div className="text-sm text-muted-foreground mt-1">{service.description}</div>
                                )}
                                <div className="text-xs text-muted-foreground/70 mt-1">
                                  {service.durationMinutes} minuti
                                </div>
                              </div>
                              <div className="text-lg font-bold whitespace-nowrap shrink-0">
                                {service.discountedPrice ? (
                                  <div className="flex flex-col items-end">
                                    <span className="text-sm line-through text-muted-foreground">
                                      €{service.price.toFixed(2)}
                                    </span>
                                    <span className="text-green-600">€{service.discountedPrice.toFixed(2)}</span>
                                  </div>
                                ) : (
                                  <span>€{service.price.toFixed(2)}</span>
                                )}
                              </div>
                              {selectedService === service.id && (
                                <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                                  <Check className="h-3 w-3 text-primary-foreground" />
                                </div>
                              )}
                            </button>
                          ))}
                        {services.filter((s) => s.category === selectedCategory).length === 0 && (
                          <div className="py-4 text-center text-muted-foreground">
                            Nessun servizio in questa categoria
                          </div>
                        )}
                      </div>
                    </>
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
                            const formatted = formatDateItalian(date);
                            const isSelected = selectedDate?.toDateString() === date.toDateString();
                            const hasAvailableSlots = getAvailableTimeSlots(date, availability).length > 0;
                            const isBlockedByLimits = !hasAvailableSlots && isDateBlockedByLimits(date);
                            const label = hasAvailableSlots ? formatted.month : isBlockedByLimits ? 'Limite' : 'N/D';
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
                                <span className="text-sm font-medium">{formatted.day}</span>
                                <span className="text-lg font-bold">{formatted.date}</span>
                                <span className="text-sm">{label}</span>
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
                        ) : getAvailableTimeSlots(selectedDate, availability).length === 0 ? (
                          <div className="py-8 text-center text-sm text-muted-foreground">
                            Nessuno slot disponibile per questa data
                          </div>
                        ) : (
                          <div className="grid grid-cols-3 gap-2 overflow-y-auto">
                            {getAvailableTimeSlots(selectedDate, availability).map((time) => {
                              const isUnavailable = isSlotUnavailable(selectedDate, time, availability);
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
        {(selectedStore || selectedBarber || selectedService || (selectedDate && selectedTime)) && (
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
              {selectedService && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Servizio:</span>
                  <span className="font-medium">
                    {services.find((s) => s.id === selectedService)?.name || selectedService}
                  </span>
                </div>
              )}
              {selectedService && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Prezzo:</span>
                  <span className="font-medium">
                    {(() => {
                      const service = services.find((s) => s.id === selectedService);
                      if (!service) return '€0.00';
                      if (service.discountedPrice) {
                        return (
                          <>
                            <span className="line-through text-muted-foreground mr-2">€{service.price.toFixed(2)}</span>
                            <span className="text-green-600">€{service.discountedPrice.toFixed(2)}</span>
                          </>
                        );
                      }
                      return `€${service.price.toFixed(2)}`;
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
