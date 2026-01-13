'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { ProtectedRoute } from '@/components/protected-route';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Store, MapPin, Plus, Pencil, Trash2, Scissors, User, Phone, Mail, Calendar } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface StoreData {
  id: string;
  name: string;
  address: string;
}

type ServiceCategory = 'CAPELLI' | 'BARBA' | 'COMBO';

interface ServiceData {
  id: string;
  name: string;
  description?: string | null;
  durationMinutes: number;
  price: number;
  discountedPrice?: number | null;
  category: ServiceCategory;
  barberId: string;
  storeId: string;
  barber?: {
    firstName: string;
    lastName: string;
  };
  store?: {
    name: string;
  };
}

interface BarberData {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
}

interface Setting {
  id: string;
  key: string;
  value: string;
  description: string | null;
}

interface BarberWeeklyHour {
  id: string;
  barberId: string;
  storeId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  barber?: {
    firstName: string;
    lastName: string;
  };
  store?: {
    name: string;
  };
}

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  role: string;
}

function AdminManagementContent() {
  const { getToken } = useAuth();

  // Stores state
  const [stores, setStores] = useState<StoreData[]>([]);
  const [isLoadingStores, setIsLoadingStores] = useState(true);
  const [isStoreDialogOpen, setIsStoreDialogOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<StoreData | null>(null);
  const [storeFormData, setStoreFormData] = useState({ name: '', address: '' });
  const [isSavingStore, setIsSavingStore] = useState(false);

  // Services state
  const [services, setServices] = useState<ServiceData[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceData | null>(null);
  const [serviceFormData, setServiceFormData] = useState({
    name: '',
    description: '',
    durationMinutes: '',
    price: '',
    discountedPrice: '',
    category: 'CAPELLI' as ServiceCategory,
    barberId: '',
    storeId: '',
  });
  const [isSavingService, setIsSavingService] = useState(false);
  const [availableStores, setAvailableStores] = useState<StoreData[]>([]);
  const [availableBarbers, setAvailableBarbers] = useState<BarberData[]>([]);

  // Barbers state
  const [barbers, setBarbers] = useState<BarberData[]>([]);
  const [isLoadingBarbers, setIsLoadingBarbers] = useState(true);
  const [isBarberDialogOpen, setIsBarberDialogOpen] = useState(false);
  const [editingBarber, setEditingBarber] = useState<BarberData | null>(null);
  const [barberFormData, setBarberFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    password: '',
  });
  const [isSavingBarber, setIsSavingBarber] = useState(false);

  // Settings state
  const [settings, setSettings] = useState<Setting[]>([]);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [settingsFormData, setSettingsFormData] = useState<Record<string, string>>({});
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsSuccessMessage, setSettingsSuccessMessage] = useState('');

  // Weekly Hours state
  const [weeklyHours, setWeeklyHours] = useState<BarberWeeklyHour[]>([]);
  const [isLoadingWeeklyHours, setIsLoadingWeeklyHours] = useState(true);
  const [isWeeklyHourDialogOpen, setIsWeeklyHourDialogOpen] = useState(false);
  const [editingWeeklyHour, setEditingWeeklyHour] = useState<BarberWeeklyHour | null>(null);
  const [weeklyHourFormData, setWeeklyHourFormData] = useState({
    barberId: '',
    storeId: '',
    dayOfWeek: '',
    startTime: '',
    endTime: '',
  });
  const [isSavingWeeklyHour, setIsSavingWeeklyHour] = useState(false);

  // Customers state
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(true);

  useEffect(() => {
    loadStores();
    loadServices();
    loadBarbers();
    loadSettings();
    loadWeeklyHours();
    loadCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Stores functions
  const loadStores = async () => {
    setIsLoadingStores(true);
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
    } finally {
      setIsLoadingStores(false);
    }
  };

  const handleOpenStoreDialog = (store?: StoreData) => {
    if (store) {
      setEditingStore(store);
      setStoreFormData({ name: store.name, address: store.address });
    } else {
      setEditingStore(null);
      setStoreFormData({ name: '', address: '' });
    }
    setIsStoreDialogOpen(true);
  };

  const handleCloseStoreDialog = () => {
    setIsStoreDialogOpen(false);
    setEditingStore(null);
    setStoreFormData({ name: '', address: '' });
  };

  const handleSaveStore = async () => {
    if (!storeFormData.name || !storeFormData.address) {
      alert('Nome e indirizzo sono obbligatori');
      return;
    }

    setIsSavingStore(true);
    try {
      const token = getToken();
      const url = editingStore ? `/api/stores/${editingStore.id}` : '/api/stores';
      const method = editingStore ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(storeFormData),
      });

      if (response.ok) {
        await loadStores();
        handleCloseStoreDialog();
      } else {
        const error = await response.json();
        alert(error.error || 'Errore durante il salvataggio');
      }
    } catch (err) {
      console.error('Error saving store:', err);
      alert('Errore durante il salvataggio');
    } finally {
      setIsSavingStore(false);
    }
  };

  const handleDeleteStore = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questa sede?')) {
      return;
    }

    try {
      const token = getToken();
      const response = await fetch(`/api/stores/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        await loadStores();
      } else {
        const error = await response.json();
        alert(error.error || "Errore durante l'eliminazione");
      }
    } catch (err) {
      console.error('Error deleting store:', err);
      alert("Errore durante l'eliminazione");
    }
  };

  // Services functions
  const loadServices = async () => {
    setIsLoadingServices(true);
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
    } finally {
      setIsLoadingServices(false);
    }
  };

  const handleOpenServiceDialog = async (service?: ServiceData, preselectedBarberId?: string) => {
    // Load stores and barbers for the dropdowns (reuse existing data if available)
    if (availableStores.length === 0 && stores.length > 0) {
      setAvailableStores(stores);
    } else if (availableStores.length === 0) {
      // Load stores if not already loaded
      try {
        const token = getToken();
        const response = await fetch('/api/stores', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await response.json();
        if (result.data) {
          setAvailableStores(result.data);
        }
      } catch (err) {
        console.error('Error loading stores for service dialog:', err);
      }
    }

    if (availableBarbers.length === 0 && barbers.length > 0) {
      setAvailableBarbers(barbers);
    } else if (availableBarbers.length === 0) {
      // Load barbers if not already loaded
      try {
        const token = getToken();
        const response = await fetch('/api/barbers?excludeAdmin=true', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await response.json();
        if (result.data) {
          setAvailableBarbers(result.data);
        }
      } catch (err) {
        console.error('Error loading barbers for service dialog:', err);
      }
    }

    if (service) {
      setEditingService(service);
      setServiceFormData({
        name: service.name,
        description: service.description || '',
        durationMinutes: service.durationMinutes.toString(),
        price: service.price?.toString(),
        discountedPrice: service.discountedPrice?.toString() || '',
        category: service.category || 'CAPELLI',
        barberId: service.barberId,
        storeId: service.storeId,
      });
    } else {
      setEditingService(null);
      setServiceFormData({
        name: '',
        description: '',
        durationMinutes: '',
        price: '',
        discountedPrice: '',
        category: 'CAPELLI',
        barberId: preselectedBarberId || '',
        storeId: '',
      });
    }
    setIsServiceDialogOpen(true);
  };

  const handleCloseServiceDialog = () => {
    setIsServiceDialogOpen(false);
    setEditingService(null);
    setServiceFormData({
      name: '',
      description: '',
      durationMinutes: '',
      price: '',
      discountedPrice: '',
      category: 'CAPELLI',
      barberId: '',
      storeId: '',
    });
  };

  const handleSaveService = async () => {
    if (
      !serviceFormData.name ||
      !serviceFormData.durationMinutes ||
      !serviceFormData.price ||
      !serviceFormData.barberId ||
      !serviceFormData.storeId
    ) {
      alert('Tutti i campi sono obbligatori');
      return;
    }

    setIsSavingService(true);
    try {
      const token = getToken();
      const url = editingService ? `/api/services/${editingService.id}` : '/api/services';
      const method = editingService ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: serviceFormData.name,
          description: serviceFormData.description || null,
          durationMinutes: parseInt(serviceFormData.durationMinutes),
          price: parseFloat(serviceFormData.price),
          discountedPrice: serviceFormData.discountedPrice ? parseFloat(serviceFormData.discountedPrice) : null,
          category: serviceFormData.category,
          barberId: serviceFormData.barberId,
          storeId: serviceFormData.storeId,
        }),
      });

      if (response.ok) {
        await loadServices();
        handleCloseServiceDialog();
      } else {
        const error = await response.json();
        alert(error.error || 'Errore durante il salvataggio');
      }
    } catch (err) {
      console.error('Error saving service:', err);
      alert('Errore durante il salvataggio');
    } finally {
      setIsSavingService(false);
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo servizio?')) {
      return;
    }

    try {
      const token = getToken();
      const response = await fetch(`/api/services/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        await loadServices();
      } else {
        const error = await response.json();
        alert(error.error || "Errore durante l'eliminazione");
      }
    } catch (err) {
      console.error('Error deleting service:', err);
      alert("Errore durante l'eliminazione");
    }
  };

  // Barbers functions
  const loadBarbers = async () => {
    setIsLoadingBarbers(true);
    try {
      const token = getToken();
      const response = await fetch('/api/barbers?excludeAdmin=true', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (result.data) {
        setBarbers(result.data);
      }
    } catch (err) {
      console.error('Error loading barbers:', err);
    } finally {
      setIsLoadingBarbers(false);
    }
  };

  const handleOpenBarberDialog = (barber?: BarberData) => {
    if (barber) {
      setEditingBarber(barber);
      setBarberFormData({
        firstName: barber.firstName,
        lastName: barber.lastName,
        phone: barber.phone,
        email: barber.email || '',
        password: '',
      });
    } else {
      setEditingBarber(null);
      setBarberFormData({ firstName: '', lastName: '', phone: '', email: '', password: '' });
    }
    setIsBarberDialogOpen(true);
  };

  const handleCloseBarberDialog = () => {
    setIsBarberDialogOpen(false);
    setEditingBarber(null);
    setBarberFormData({ firstName: '', lastName: '', phone: '', email: '', password: '' });
  };

  const handleSaveBarber = async () => {
    if (!barberFormData.firstName || !barberFormData.lastName || !barberFormData.phone) {
      alert('Nome, cognome e telefono sono obbligatori');
      return;
    }

    if (!editingBarber && !barberFormData.password) {
      alert('La password è obbligatoria per i nuovi barbieri');
      return;
    }

    setIsSavingBarber(true);
    try {
      const token = getToken();
      const url = editingBarber ? `/api/users/${editingBarber.id}` : '/api/users';
      const method = editingBarber ? 'PATCH' : 'POST';

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const body: any = {
        firstName: barberFormData.firstName,
        lastName: barberFormData.lastName,
        phone: barberFormData.phone,
        email: barberFormData.email || undefined,
      };

      if (!editingBarber) {
        body.role = 'BARBER';
        body.password = barberFormData.password;
      } else if (barberFormData.password) {
        body.password = barberFormData.password;
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        await loadBarbers();
        handleCloseBarberDialog();
      } else {
        const error = await response.json();
        alert(error.error || 'Errore durante il salvataggio');
      }
    } catch (err) {
      console.error('Error saving barber:', err);
      alert('Errore durante il salvataggio');
    } finally {
      setIsSavingBarber(false);
    }
  };

  const handleDeleteBarber = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo barbiere?')) {
      return;
    }

    try {
      const token = getToken();
      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        await loadBarbers();
      } else {
        const error = await response.json();
        alert(error.error || "Errore durante l'eliminazione");
      }
    } catch (err) {
      console.error('Error deleting barber:', err);
      alert("Errore durante l'eliminazione");
    }
  };

  // Settings functions
  const loadSettings = async () => {
    setIsLoadingSettings(true);
    try {
      const token = getToken();
      const response = await fetch('/api/settings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (result.data) {
        setSettings(result.data);
        const initialData: Record<string, string> = {};
        result.data.forEach((setting: Setting) => {
          initialData[setting.key] = setting.value;
        });
        setSettingsFormData(initialData);
      }
    } catch (err) {
      console.error('Error loading settings:', err);
    } finally {
      setIsLoadingSettings(false);
    }
  };

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    setSettingsSuccessMessage('');
    try {
      const token = getToken();

      for (const [key, value] of Object.entries(settingsFormData)) {
        await fetch('/api/settings', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ key, value }),
        });
      }

      setSettingsSuccessMessage('Impostazioni salvate con successo!');
      await loadSettings();

      setTimeout(() => setSettingsSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      alert('Errore durante il salvataggio delle impostazioni');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleSettingChange = (key: string, value: string) => {
    setSettingsFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Weekly Hours functions
  const loadWeeklyHours = async () => {
    setIsLoadingWeeklyHours(true);
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
      setIsLoadingWeeklyHours(false);
    }
  };

  const handleOpenWeeklyHourDialog = (weeklyHour?: BarberWeeklyHour, preselectedBarberId?: string) => {
    if (weeklyHour) {
      setEditingWeeklyHour(weeklyHour);
      // Convert Date objects to time strings HH:mm
      const startTime = new Date(weeklyHour.startTime);
      const endTime = new Date(weeklyHour.endTime);
      setWeeklyHourFormData({
        barberId: weeklyHour.barberId,
        storeId: weeklyHour.storeId,
        dayOfWeek: weeklyHour.dayOfWeek.toString(),
        startTime: `${startTime.getUTCHours().toString().padStart(2, '0')}:${startTime.getUTCMinutes().toString().padStart(2, '0')}`,
        endTime: `${endTime.getUTCHours().toString().padStart(2, '0')}:${endTime.getUTCMinutes().toString().padStart(2, '0')}`,
      });
    } else {
      setEditingWeeklyHour(null);
      setWeeklyHourFormData({
        barberId: preselectedBarberId || '',
        storeId: '',
        dayOfWeek: '',
        startTime: '',
        endTime: '',
      });
    }
    setIsWeeklyHourDialogOpen(true);
  };

  const handleCloseWeeklyHourDialog = () => {
    setIsWeeklyHourDialogOpen(false);
    setEditingWeeklyHour(null);
    setWeeklyHourFormData({ barberId: '', storeId: '', dayOfWeek: '', startTime: '', endTime: '' });
  };

  const handleSaveWeeklyHour = async () => {
    if (
      !weeklyHourFormData.barberId ||
      !weeklyHourFormData.storeId ||
      !weeklyHourFormData.dayOfWeek ||
      !weeklyHourFormData.startTime ||
      !weeklyHourFormData.endTime
    ) {
      alert('Tutti i campi sono obbligatori');
      return;
    }

    setIsSavingWeeklyHour(true);
    try {
      const token = getToken();
      const url = editingWeeklyHour ? `/api/barber-weekly-hours/${editingWeeklyHour.id}` : '/api/barber-weekly-hours';
      const method = editingWeeklyHour ? 'PATCH' : 'POST';

      // Convert time strings to Date objects
      const [startHours, startMinutes] = weeklyHourFormData.startTime.split(':');
      const [endHours, endMinutes] = weeklyHourFormData.endTime.split(':');

      const startTime = new Date('2024-01-01T00:00:00Z');
      startTime.setUTCHours(parseInt(startHours), parseInt(startMinutes), 0, 0);

      const endTime = new Date('2024-01-01T00:00:00Z');
      endTime.setUTCHours(parseInt(endHours), parseInt(endMinutes), 0, 0);

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          barberId: weeklyHourFormData.barberId,
          storeId: weeklyHourFormData.storeId,
          dayOfWeek: parseInt(weeklyHourFormData.dayOfWeek),
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
        }),
      });

      if (response.ok) {
        await loadWeeklyHours();
        handleCloseWeeklyHourDialog();
      } else {
        const error = await response.json();
        alert(error.error || 'Errore durante il salvataggio');
      }
    } catch (err) {
      console.error('Error saving weekly hour:', err);
      alert('Errore durante il salvataggio');
    } finally {
      setIsSavingWeeklyHour(false);
    }
  };

  const handleDeleteWeeklyHour = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo turno?')) {
      return;
    }

    try {
      const token = getToken();
      const response = await fetch(`/api/barber-weekly-hours/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        await loadWeeklyHours();
      } else {
        const error = await response.json();
        alert(error.error || "Errore durante l'eliminazione");
      }
    } catch (err) {
      console.error('Error deleting weekly hour:', err);
      alert("Errore durante l'eliminazione");
    }
  };

  const getDayName = (dayOfWeek: number) => {
    const days = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
    return days[dayOfWeek];
  };

  // Customers functions
  const loadCustomers = async () => {
    setIsLoadingCustomers(true);
    try {
      const token = getToken();
      const response = await fetch('/api/users?role=CUSTOMER', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (result.data) {
        setCustomers(result.data);
      }
    } catch (err) {
      console.error('Error loading customers:', err);
    } finally {
      setIsLoadingCustomers(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-153px)] bg-background">
      <main className="container mx-auto px-4 py-4">
        <div className="mb-4">
          <h1 className="mb-1 text-2xl font-bold">Gestione</h1>
          <p className="text-sm text-muted-foreground">Gestisci sedi, servizi e barbieri</p>
        </div>

        <Tabs defaultValue="sedi" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="sedi">Sedi</TabsTrigger>
            <TabsTrigger value="barbieri">Barbieri</TabsTrigger>
            <TabsTrigger value="clienti">Clienti</TabsTrigger>
            <TabsTrigger value="limiti">Limiti</TabsTrigger>
          </TabsList>

          {/* Sedi Tab */}
          <TabsContent value="sedi" className="mt-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Sedi</h2>
              <Button onClick={() => handleOpenStoreDialog()} size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {isLoadingStores ? (
              <div className="py-12 text-center text-muted-foreground">Caricamento...</div>
            ) : (
              <div className="space-y-3">
                {stores.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Store className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                      <p className="text-muted-foreground">Nessuna sede trovata</p>
                    </CardContent>
                  </Card>
                ) : (
                  stores.map((store) => (
                    <Card key={store.id}>
                      <CardHeader className="p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                              <Store className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="text-sm">{store.name}</CardTitle>
                              <CardDescription className="mt-0.5 flex items-center gap-1 text-sm">
                                <MapPin className="h-3 w-3" />
                                <span>{store.address}</span>
                              </CardDescription>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" onClick={() => handleOpenStoreDialog(store)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteStore(store.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  ))
                )}
              </div>
            )}
          </TabsContent>

          {/* Barbieri Tab */}
          <TabsContent value="barbieri" className="mt-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Barbieri</h2>
              <Button onClick={() => handleOpenBarberDialog()} size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {isLoadingBarbers || isLoadingServices || isLoadingWeeklyHours ? (
              <div className="py-12 text-center text-muted-foreground">Caricamento...</div>
            ) : (
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
                    const barberServices = services.filter((s) => s.barberId === barber.id);
                    const barberHours = weeklyHours.filter((h) => h.barberId === barber.id);

                    return (
                      <Card key={barber.id}>
                        <CardHeader className="p-3 pb-0">
                          <div className="flex items-start justify-between">
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
                                </CardDescription>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm" onClick={() => handleOpenBarberDialog(barber)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDeleteBarber(barber.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="p-3 pt-2">
                          <Accordion type="multiple" className="w-full">
                            {/* Turni Accordion */}
                            <AccordionItem value="turni" className="border-b-0">
                              <AccordionTrigger className="py-2 text-sm hover:no-underline">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4" />
                                  <span>Turni ({barberHours.length})</span>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="space-y-2 pt-1">
                                  {barberHours.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">Nessun turno configurato</p>
                                  ) : (
                                    barberHours.map((hour) => (
                                      <div
                                        key={hour.id}
                                        className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2"
                                      >
                                        <div className="text-sm">
                                          <span className="font-medium">{getDayName(hour.dayOfWeek)}</span>
                                          <span className="text-muted-foreground">
                                            {' '}
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
                                          <span className="text-muted-foreground"> • {hour.store?.name}</span>
                                        </div>
                                        <div className="flex gap-1">
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 w-7 p-0"
                                            onClick={() => handleOpenWeeklyHourDialog(hour)}
                                          >
                                            <Pencil className="h-3 w-3" />
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 w-7 p-0"
                                            onClick={() => handleDeleteWeeklyHour(hour.id)}
                                          >
                                            <Trash2 className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      </div>
                                    ))
                                  )}
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full mt-2"
                                    onClick={() => handleOpenWeeklyHourDialog(undefined, barber.id)}
                                  >
                                    <Plus className="h-3 w-3 mr-1" />
                                    Aggiungi Turno
                                  </Button>
                                </div>
                              </AccordionContent>
                            </AccordionItem>

                            {/* Servizi Accordion */}
                            <AccordionItem value="servizi" className="border-b-0">
                              <AccordionTrigger className="py-2 text-sm hover:no-underline">
                                <div className="flex items-center gap-2">
                                  <Scissors className="h-4 w-4" />
                                  <span>Servizi ({barberServices.length})</span>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="space-y-2 pt-1">
                                  {barberServices.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">Nessun servizio configurato</p>
                                  ) : (
                                    barberServices.map((service) => (
                                      <div
                                        key={service.id}
                                        className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2"
                                      >
                                        <div className="text-sm">
                                          <div className="flex items-center gap-2">
                                            <span className="font-medium">{service.name}</span>
                                            <span
                                              className={`text-xs px-1.5 py-0.5 rounded-full ${
                                                service.category === 'CAPELLI'
                                                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                                                  : service.category === 'BARBA'
                                                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300'
                                                    : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                              }`}
                                            >
                                              {service.category}
                                            </span>
                                          </div>
                                          <div className="text-muted-foreground">
                                            {service.durationMinutes} min •{' '}
                                            {service.discountedPrice ? (
                                              <>
                                                <span className="line-through">€{service.price?.toFixed(2)}</span>{' '}
                                                <span className="text-green-600">
                                                  €{service.discountedPrice.toFixed(2)}
                                                </span>
                                              </>
                                            ) : (
                                              <span>€{service.price?.toFixed(2)}</span>
                                            )}
                                            {service.store && ` • ${service.store.name}`}
                                          </div>
                                        </div>
                                        <div className="flex gap-1">
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 w-7 p-0"
                                            onClick={() => handleOpenServiceDialog(service)}
                                          >
                                            <Pencil className="h-3 w-3" />
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 w-7 p-0"
                                            onClick={() => handleDeleteService(service.id)}
                                          >
                                            <Trash2 className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      </div>
                                    ))
                                  )}
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full mt-2"
                                    onClick={() => handleOpenServiceDialog(undefined, barber.id)}
                                  >
                                    <Plus className="h-3 w-3 mr-1" />
                                    Aggiungi Servizio
                                  </Button>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            )}
          </TabsContent>

          {/* Clienti Tab */}
          <TabsContent value="clienti" className="mt-4">
            <div className="mb-4">
              <h2 className="text-lg font-semibold">Clienti</h2>
            </div>

            {isLoadingCustomers ? (
              <div className="py-12 text-center text-muted-foreground">Caricamento...</div>
            ) : (
              <div className="space-y-3">
                {customers.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <User className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                      <p className="text-muted-foreground">Nessun cliente trovato</p>
                    </CardContent>
                  </Card>
                ) : (
                  customers.map((customer) => (
                    <Card key={customer.id}>
                      <CardHeader className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-sm">
                              {customer.firstName} {customer.lastName}
                            </CardTitle>
                            <CardDescription className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {customer.phone}
                              </span>
                              {customer.email && (
                                <span className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {customer.email}
                                </span>
                              )}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  ))
                )}
              </div>
            )}
          </TabsContent>

          {/* Limiti Tab */}
          <TabsContent value="limiti" className="mt-4">
            <div className="mb-4">
              <h2 className="text-lg font-semibold">Limiti zioni</h2>
            </div>

            {isLoadingSettings ? (
              <div className="py-12 text-center text-muted-foreground">Caricamento...</div>
            ) : (
              <div>
                {settingsSuccessMessage && (
                  <div className="mb-4 rounded-lg bg-green-100 p-3 text-sm text-green-800 dark:bg-green-900 dark:text-green-300">
                    {settingsSuccessMessage}
                  </div>
                )}

                {settings.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <p className="text-muted-foreground">Nessuna impostazione trovata</p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Esegui il seed per creare le impostazioni predefinite
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Configura Limiti</CardTitle>
                      <CardDescription className="text-sm">
                        Imposta il numero massimo di appuntamenti bili per i clienti
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {settings.map((setting) => (
                        <div key={setting.id} className="space-y-2">
                          <Label htmlFor={setting.key} className="text-sm font-medium">
                            {setting.key === 'booking_limit_per_week' && 'Limite per Settimana'}
                            {setting.key === 'booking_limit_per_month' && 'Limite per Mese'}
                          </Label>
                          {setting.description && (
                            <p className="text-sm text-muted-foreground">{setting.description}</p>
                          )}
                          <Input
                            id={setting.key}
                            type="number"
                            min="0"
                            value={settingsFormData[setting.key] || ''}
                            onChange={(e) => handleSettingChange(setting.key, e.target.value)}
                            className="max-w-xs"
                            placeholder={`Es. ${setting.value}`}
                          />
                        </div>
                      ))}

                      <div className="pt-2">
                        <Button onClick={handleSaveSettings} disabled={isSavingSettings}>
                          {isSavingSettings ? 'Salvataggio...' : 'Salva Modifiche'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Store Dialog */}
      <Dialog open={isStoreDialogOpen} onOpenChange={setIsStoreDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingStore ? 'Modifica Sede' : 'Nuova Sede'}</DialogTitle>
            <DialogDescription>
              {editingStore ? 'Modifica i dettagli della sede' : 'Aggiungi una nuova sede'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="store-name">Nome</Label>
              <Input
                id="store-name"
                value={storeFormData.name}
                onChange={(e) => setStoreFormData({ ...storeFormData, name: e.target.value })}
                placeholder="Es. Sede Centro"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="store-address">Indirizzo</Label>
              <Input
                id="store-address"
                value={storeFormData.address}
                onChange={(e) => setStoreFormData({ ...storeFormData, address: e.target.value })}
                placeholder="Es. Via Roma 123, Milano"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseStoreDialog}>
              Annulla
            </Button>
            <Button onClick={handleSaveStore} disabled={isSavingStore}>
              {isSavingStore ? 'Salvataggio...' : 'Salva'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Service Dialog */}
      <Dialog open={isServiceDialogOpen} onOpenChange={setIsServiceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingService ? 'Modifica Servizio' : 'Nuovo Servizio'}</DialogTitle>
            <DialogDescription>
              {editingService ? 'Modifica i dettagli del servizio' : 'Aggiungi un nuovo servizio'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="service-name">Nome</Label>
              <Input
                id="service-name"
                value={serviceFormData.name}
                onChange={(e) => setServiceFormData({ ...serviceFormData, name: e.target.value })}
                placeholder="Es. Taglio Classico"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="service-description">Descrizione (opzionale)</Label>
              <textarea
                id="service-description"
                value={serviceFormData.description}
                onChange={(e) => setServiceFormData({ ...serviceFormData, description: e.target.value })}
                placeholder="Es. Taglio classico con consulenza stilistica, shampoo e styling finale"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="service-duration">Durata</Label>
              <Select
                value={serviceFormData.durationMinutes}
                onValueChange={(value) => setServiceFormData({ ...serviceFormData, durationMinutes: value })}
              >
                <SelectTrigger id="service-duration">
                  <SelectValue placeholder="Seleziona durata" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minuti</SelectItem>
                  <SelectItem value="60">1 ora</SelectItem>
                  <SelectItem value="90">1 ora e 30 min</SelectItem>
                  <SelectItem value="120">2 ore</SelectItem>
                  <SelectItem value="150">2 ore e 30 min</SelectItem>
                  <SelectItem value="180">3 ore</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="service-category">Categoria</Label>
              <Select
                value={serviceFormData.category}
                onValueChange={(value) =>
                  setServiceFormData({ ...serviceFormData, category: value as ServiceCategory })
                }
              >
                <SelectTrigger id="service-category">
                  <SelectValue placeholder="Seleziona categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CAPELLI">Capelli</SelectItem>
                  <SelectItem value="BARBA">Barba</SelectItem>
                  <SelectItem value="COMBO">Combo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="service-price">Prezzo (€)</Label>
              <Input
                id="service-price"
                type="number"
                step="0.01"
                value={serviceFormData.price}
                onChange={(e) => setServiceFormData({ ...serviceFormData, price: e.target.value })}
                placeholder="Es. 25.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="service-discountedPrice">Prezzo Scontato (€) - opzionale</Label>
              <Input
                id="service-discountedPrice"
                type="number"
                step="0.01"
                value={serviceFormData.discountedPrice}
                onChange={(e) => setServiceFormData({ ...serviceFormData, discountedPrice: e.target.value })}
                placeholder="Es. 20.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="service-barberId">Barbiere</Label>
              <select
                id="service-barberId"
                value={serviceFormData.barberId}
                onChange={(e) => setServiceFormData({ ...serviceFormData, barberId: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Seleziona barbiere</option>
                {availableBarbers.map((barber) => (
                  <option key={barber.id} value={barber.id}>
                    {barber.firstName} {barber.lastName}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="service-storeId">Sede</Label>
              <select
                id="service-storeId"
                value={serviceFormData.storeId}
                onChange={(e) => setServiceFormData({ ...serviceFormData, storeId: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Seleziona sede</option>
                {availableStores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseServiceDialog}>
              Annulla
            </Button>
            <Button onClick={handleSaveService} disabled={isSavingService}>
              {isSavingService ? 'Salvataggio...' : 'Salva'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Barber Dialog */}
      <Dialog open={isBarberDialogOpen} onOpenChange={setIsBarberDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingBarber ? 'Modifica Barbiere' : 'Nuovo Barbiere'}</DialogTitle>
            <DialogDescription>
              {editingBarber ? 'Modifica i dettagli del barbiere' : 'Aggiungi un nuovo barbiere'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="barber-firstName">Nome</Label>
                <Input
                  id="barber-firstName"
                  value={barberFormData.firstName}
                  onChange={(e) => setBarberFormData({ ...barberFormData, firstName: e.target.value })}
                  placeholder="Mario"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="barber-lastName">Cognome</Label>
                <Input
                  id="barber-lastName"
                  value={barberFormData.lastName}
                  onChange={(e) => setBarberFormData({ ...barberFormData, lastName: e.target.value })}
                  placeholder="Rossi"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="barber-phone">Telefono</Label>
              <Input
                id="barber-phone"
                type="tel"
                value={barberFormData.phone}
                onChange={(e) => setBarberFormData({ ...barberFormData, phone: e.target.value })}
                placeholder="3331234567"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="barber-email">Email (opzionale)</Label>
              <Input
                id="barber-email"
                type="email"
                value={barberFormData.email}
                onChange={(e) => setBarberFormData({ ...barberFormData, email: e.target.value })}
                placeholder="mario.rossi@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="barber-password">
                Password {editingBarber ? '(lascia vuoto per non modificare)' : ''}
              </Label>
              <Input
                id="barber-password"
                type="password"
                value={barberFormData.password}
                onChange={(e) => setBarberFormData({ ...barberFormData, password: e.target.value })}
                placeholder="••••••••"
              />
              {!editingBarber && <p className="text-sm text-muted-foreground">Min. 6 caratteri</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseBarberDialog}>
              Annulla
            </Button>
            <Button onClick={handleSaveBarber} disabled={isSavingBarber}>
              {isSavingBarber ? 'Salvataggio...' : 'Salva'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Weekly Hour Dialog */}
      <Dialog open={isWeeklyHourDialogOpen} onOpenChange={setIsWeeklyHourDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingWeeklyHour ? 'Modifica Turno' : 'Nuovo Turno'}</DialogTitle>
            <DialogDescription>
              {editingWeeklyHour ? 'Modifica i dettagli del turno settimanale' : 'Aggiungi un nuovo turno settimanale'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="weekly-hour-barberId">Barbiere</Label>
              <select
                id="weekly-hour-barberId"
                value={weeklyHourFormData.barberId}
                onChange={(e) => setWeeklyHourFormData({ ...weeklyHourFormData, barberId: e.target.value })}
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
            <div className="space-y-2">
              <Label htmlFor="weekly-hour-storeId">Sede</Label>
              <select
                id="weekly-hour-storeId"
                value={weeklyHourFormData.storeId}
                onChange={(e) => setWeeklyHourFormData({ ...weeklyHourFormData, storeId: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Seleziona sede</option>
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="weekly-hour-dayOfWeek">Giorno della Settimana</Label>
              <select
                id="weekly-hour-dayOfWeek"
                value={weeklyHourFormData.dayOfWeek}
                onChange={(e) => setWeeklyHourFormData({ ...weeklyHourFormData, dayOfWeek: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Seleziona giorno</option>
                <option value="0">Domenica</option>
                <option value="1">Lunedì</option>
                <option value="2">Martedì</option>
                <option value="3">Mercoledì</option>
                <option value="4">Giovedì</option>
                <option value="5">Venerdì</option>
                <option value="6">Sabato</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="weekly-hour-startTime">Ora Inizio</Label>
                <Input
                  id="weekly-hour-startTime"
                  type="time"
                  value={weeklyHourFormData.startTime}
                  onChange={(e) => setWeeklyHourFormData({ ...weeklyHourFormData, startTime: e.target.value })}
                  placeholder="09:00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weekly-hour-endTime">Ora Fine</Label>
                <Input
                  id="weekly-hour-endTime"
                  type="time"
                  value={weeklyHourFormData.endTime}
                  onChange={(e) => setWeeklyHourFormData({ ...weeklyHourFormData, endTime: e.target.value })}
                  placeholder="13:00"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseWeeklyHourDialog}>
              Annulla
            </Button>
            <Button onClick={handleSaveWeeklyHour} disabled={isSavingWeeklyHour}>
              {isSavingWeeklyHour ? 'Salvataggio...' : 'Salva'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AdminManagementPage() {
  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <AdminManagementContent />
    </ProtectedRoute>
  );
}
