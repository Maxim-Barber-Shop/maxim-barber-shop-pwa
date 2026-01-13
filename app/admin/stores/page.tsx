'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { ProtectedRoute } from '@/components/protected-route';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Store, MapPin, Plus, Pencil, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface StoreData {
  id: string;
  name: string;
  address: string;
}

function AdminStoresContent() {
  const { getToken } = useAuth();
  const [stores, setStores] = useState<StoreData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<StoreData | null>(null);
  const [formData, setFormData] = useState({ name: '', address: '' });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadStores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadStores = async () => {
    setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (store?: StoreData) => {
    if (store) {
      setEditingStore(store);
      setFormData({ name: store.name, address: store.address });
    } else {
      setEditingStore(null);
      setFormData({ name: '', address: '' });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingStore(null);
    setFormData({ name: '', address: '' });
  };

  const handleSave = async () => {
    if (!formData.name || !formData.address) {
      alert('Nome e indirizzo sono obbligatori');
      return;
    }

    setIsSaving(true);
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
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await loadStores();
        handleCloseDialog();
      } else {
        const error = await response.json();
        alert(error.error || 'Errore durante il salvataggio');
      }
    } catch (err) {
      console.error('Error saving store:', err);
      alert('Errore durante il salvataggio');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
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
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold">Gestione Sedi</h1>
            <p className="text-muted-foreground">Visualizza e gestisci le sedi</p>
          </div>
          <Button onClick={() => handleOpenDialog()} className="flex justify-center items-center">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
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
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <Store className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle>{store.name}</CardTitle>
                        <CardDescription className="mt-1 flex items-center gap-2">
                          <MapPin className="h-3 w-3" />
                          <span>{store.address}</span>
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleOpenDialog(store)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(store.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))
          )}
        </div>
      </main>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingStore ? 'Modifica Sede' : 'Nuova Sede'}</DialogTitle>
            <DialogDescription>
              {editingStore ? 'Modifica i dettagli della sede' : 'Aggiungi una nuova sede'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Es. Sede Centro"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Indirizzo</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Es. Via Roma 123, Milano"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Annulla
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Salvataggio...' : 'Salva'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AdminStoresPage() {
  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <AdminStoresContent />
    </ProtectedRoute>
  );
}
