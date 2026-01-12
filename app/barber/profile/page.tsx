'use client';

import { useAuth } from '@/contexts/auth-context';
import { ProtectedRoute } from '@/components/protected-route';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function BarberProfileContent() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">Il Mio Profilo</h1>
          <p className="text-muted-foreground">Gestisci i tuoi dati personali</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Informazioni Personali</CardTitle>
            <CardDescription>I tuoi dati personali e di contatto</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nome</Label>
                <Input id="firstName" value={user?.firstName || ''} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Cognome</Label>
                <Input id="lastName" value={user?.lastName || ''} disabled />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefono</Label>
              <Input id="phone" value={user?.phone || ''} disabled />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Ruolo</Label>
              <Input id="role" value={user?.role || ''} disabled />
            </div>

            <div className="flex gap-3 pt-4">
              <Button className="flex-1">Modifica Profilo</Button>
              <Button variant="outline" className="flex-1">
                Cambia Password
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Impostazioni Professionali</CardTitle>
            <CardDescription>Gestisci i tuoi servizi e disponibilità</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Le impostazioni professionali saranno disponibili a breve.</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default function BarberProfilePage() {
  return (
    <ProtectedRoute allowedRoles={['BARBER', 'ADMIN']}>
      <BarberProfileContent />
    </ProtectedRoute>
  );
}
