'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Clock } from 'lucide-react';

function BarberClientsContent() {
  return (
    <div className="min-h-[calc(100vh-153px)] bg-background">
      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-16 text-center">
            <Users className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
            <h2 className="mb-2 text-xl font-semibold">Gestione Clienti</h2>
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <p>Questa funzionalita sara disponibile presto</p>
            </div>
          </CardContent>
        </Card>
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
