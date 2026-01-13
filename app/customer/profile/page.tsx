'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { ProtectedRoute } from '@/components/protected-route';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function CustomerProfileContent() {
  const { user, getToken, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleEdit = () => {
    setIsEditing(true);
    setIsChangingPassword(false);
    setError('');
    setSuccess('');
  };

  const handleChangePassword = () => {
    setIsChangingPassword(true);
    setIsEditing(false);
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setIsChangingPassword(false);
    setFirstName(user?.firstName || '');
    setLastName(user?.lastName || '');
    setPhone(user?.phone || '');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess('');
  };

  const handleSave = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = getToken();
      const response = await fetch(`/api/users/${user?.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName,
          lastName,
          phone,
        }),
      });

      const result = await response.json();

      if (!response.ok || result.error) {
        setError(result.error || 'Errore durante il salvataggio');
        return;
      }

      // Update user in context
      if (result.data) {
        updateUser(result.data);
      }

      setSuccess('Profilo aggiornato con successo!');
      setIsEditing(false);
    } catch (err) {
      setError('Errore durante il salvataggio');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePassword = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    // Validate passwords
    if (!newPassword || !confirmPassword) {
      setError('Inserisci la nuova password e confermala');
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('La password deve essere di almeno 6 caratteri');
      setIsLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Le password non corrispondono');
      setIsLoading(false);
      return;
    }

    try {
      const token = getToken();
      const response = await fetch(`/api/users/${user?.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          password: newPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok || result.error) {
        setError(result.error || 'Errore durante il cambio password');
        return;
      }

      setSuccess('Password aggiornata con successo!');
      setIsChangingPassword(false);
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError('Errore durante il cambio password');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-153px)] bg-background">
      {/* Main Content */}
      <main className="container mx-auto px-4 py-4">
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
            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                {error}
              </div>
            )}
            {success && (
              <div className="rounded-lg bg-green-50 p-3 text-sm text-green-600 dark:bg-green-900/20 dark:text-green-400">
                {success}
              </div>
            )}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nome</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Cognome</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefono</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={!isEditing} />
            </div>

            {isChangingPassword && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nuova Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Almeno 6 caratteri"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Conferma Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Reinserisci la nuova password"
                  />
                </div>
              </>
            )}

            <div className="flex gap-3 pt-4">
              {isEditing ? (
                <>
                  <Button className="flex-1" onClick={handleSave} disabled={isLoading}>
                    {isLoading ? 'Salvataggio...' : 'Salva'}
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={handleCancel} disabled={isLoading}>
                    Annulla
                  </Button>
                </>
              ) : isChangingPassword ? (
                <>
                  <Button className="flex-1" onClick={handleSavePassword} disabled={isLoading}>
                    {isLoading ? 'Salvataggio...' : 'Salva Password'}
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={handleCancel} disabled={isLoading}>
                    Annulla
                  </Button>
                </>
              ) : (
                <>
                  <Button className="flex-1" onClick={handleEdit}>
                    Modifica Profilo
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={handleChangePassword}>
                    Cambia Password
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default function CustomerProfilePage() {
  return (
    <ProtectedRoute allowedRoles={['CUSTOMER']}>
      <CustomerProfileContent />
    </ProtectedRoute>
  );
}
