'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type AuthMode = 'login' | 'register';

export default function LoginPage() {
  const { login } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [phonePrefix, setPhonePrefix] = useState('+39');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const fullPhone = `${phonePrefix} ${phone}`;
      const body =
        mode === 'login' ? { phone: fullPhone, password } : { phone: fullPhone, password, firstName, lastName };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Si è verificato un errore');
        return;
      }

      // Success - use auth context to login and redirect
      login(result.data.user, result.data.token);
    } catch (err) {
      setError('Errore di connessione. Riprova più tardi.');
      console.error('Auth error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError('');
  };

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-4 py-6">
      {/* Background pattern */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-1/4 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl"></div>
      </div>

      {/* Logo/Brand Area - Compact */}
      <div className="mb-6 text-center">
        <h1 className="mb-1 bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-4xl font-bold tracking-tight text-transparent">
          MAXIM
        </h1>
        <p className="text-xs font-light uppercase tracking-[0.3em] text-muted-foreground">Barber Shop</p>
      </div>

      {/* Login/Register Card */}
      <Card className="w-full max-w-md border-border/50 bg-card/50 backdrop-blur-xl">
        <CardHeader className="space-y-1 pb-4 text-center">
          <CardTitle className="text-xl font-bold">{mode === 'login' ? 'Bentornato' : 'Crea account'}</CardTitle>
          <CardDescription className="text-sm">
            {mode === 'login' ? 'Accedi per continuare' : 'Registrati per prenotare'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'register' && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName" className="text-sm">
                    Nome
                  </Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="Mario"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="h-11 border-input bg-background/50"
                    autoComplete="given-name"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="lastName" className="text-sm">
                    Cognome
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Rossi"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="h-11 border-input bg-background/50"
                    autoComplete="family-name"
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-sm">
                Telefono
              </Label>
              <div className="flex gap-2">
                <Select value={phonePrefix} onValueChange={setPhonePrefix}>
                  <SelectTrigger className="h-11 w-[110px] border-input bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="+39">🇮🇹 +39</SelectItem>
                    <SelectItem value="+1">🇺🇸 +1</SelectItem>
                    <SelectItem value="+44">🇬🇧 +44</SelectItem>
                    <SelectItem value="+33">🇫🇷 +33</SelectItem>
                    <SelectItem value="+34">🇪🇸 +34</SelectItem>
                    <SelectItem value="+49">🇩🇪 +49</SelectItem>
                    <SelectItem value="+41">🇨🇭 +41</SelectItem>
                    <SelectItem value="+43">🇦🇹 +43</SelectItem>
                    <SelectItem value="+351">🇵🇹 +351</SelectItem>
                    <SelectItem value="+32">🇧🇪 +32</SelectItem>
                    <SelectItem value="+31">🇳🇱 +31</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="333 1234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-11 flex-1 border-input bg-background/50"
                  autoComplete="tel"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 border-input bg-background/50"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                required
                minLength={6}
              />
              {mode === 'register' && <p className="text-xs text-muted-foreground">Min. 6 caratteri</p>}
            </div>

            {error && <div className="rounded-lg bg-destructive/10 p-2.5 text-sm text-destructive">{error}</div>}

            <Button type="submit" className="h-11 w-full text-base font-semibold" disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></div>
                  <span>{mode === 'login' ? 'Accesso...' : 'Registrazione...'}</span>
                </div>
              ) : mode === 'login' ? (
                'Accedi'
              ) : (
                'Registrati'
              )}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={toggleMode}
              className="text-sm text-primary underline-offset-4 hover:underline"
            >
              {mode === 'login' ? 'Crea account' : 'Accedi'}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Footer - Compact */}
      <div className="mt-4 text-center text-xs text-muted-foreground">
        <p>© 2026 Maxim Barber Shop</p>
      </div>
    </div>
  );
}
