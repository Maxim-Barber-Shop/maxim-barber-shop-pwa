'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';

function BarberAppointmentsContent() {
  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="mb-2 text-3xl font-bold">Gestione Appuntamenti</h1>
          <p className="text-muted-foreground">Visualizza e gestisci le prenotazioni</p>
        </div>
        {/* Quick Stats */}
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Oggi</CardDescription>
              <CardTitle className="text-2xl">5</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Appuntamenti</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>In Attesa</CardDescription>
              <CardTitle className="text-2xl">3</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Da confermare</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Questa Settimana</CardDescription>
              <CardTitle className="text-2xl">32</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Totali</p>
            </CardContent>
          </Card>
        </div>

        {/* Today's Appointments */}
        <div className="mb-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">Appuntamenti di Oggi</h2>
            <Button variant="outline" size="sm">
              Visualizza Calendario
            </Button>
          </div>
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="mb-2 text-muted-foreground">Nessun appuntamento per oggi</p>
              <p className="text-sm text-muted-foreground">Tutti gli appuntamenti sono stati completati!</p>
            </CardContent>
          </Card>
        </div>

        {/* Pending Appointments */}
        <div>
          <h2 className="mb-4 text-xl font-bold">In Attesa di Conferma</h2>
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <p>Nessun appuntamento in attesa</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default function BarberAppointmentsPage() {
  return (
    <ProtectedRoute allowedRoles={['BARBER', 'ADMIN']}>
      <BarberAppointmentsContent />
    </ProtectedRoute>
  );
}
