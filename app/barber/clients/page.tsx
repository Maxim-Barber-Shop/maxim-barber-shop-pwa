'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Users } from 'lucide-react';

function BarberClientsContent() {
  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="mb-2 text-3xl font-bold">Clienti</h1>
          <p className="text-muted-foreground">Gestisci la tua clientela</p>
        </div>
        {/* Stats */}
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Totale Clienti</CardDescription>
              <CardTitle className="text-2xl">127</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Registrati</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Questo Mese</CardDescription>
              <CardTitle className="text-2xl">15</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Nuovi clienti</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Attivi</CardDescription>
              <CardTitle className="text-2xl">89</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Ultimi 30 giorni</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Cerca Cliente</CardTitle>
            <CardDescription>Trova un cliente per nome o telefono</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input placeholder="Nome, cognome o telefono..." className="h-11" />
              <Button>Cerca</Button>
            </div>
          </CardContent>
        </Card>

        {/* Clients List */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">Lista Clienti</h2>
            <Button variant="outline" size="sm">
              Aggiungi Cliente
            </Button>
          </div>
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="mb-2 text-muted-foreground">Nessun cliente trovato</p>
              <p className="text-sm text-muted-foreground">Usa la ricerca per trovare i clienti</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default function BarberClientsPage() {
  return (
    <ProtectedRoute allowedRoles={['BARBER', 'ADMIN']}>
      <BarberClientsContent />
    </ProtectedRoute>
  );
}
