'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type AuthMode = 'login' | 'register';

export default function LoginPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading, login } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [phonePrefix, setPhonePrefix] = useState('+39');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    if (!isAuthLoading && user) {
      if (user.role === 'CUSTOMER') {
        router.push('/customer/dashboard');
      } else if (user.role === 'BARBER') {
        router.push('/barber/dashboard');
      } else if (user.role === 'ADMIN') {
        router.push('/admin/dashboard');
      }
    }
  }, [user, isAuthLoading, router]);

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

  // Show loading while checking auth status
  if (isAuthLoading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // Don't show login page if already logged in (will redirect)
  if (user) {
    return null;
  }

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-4 py-6">
      {/* Background pattern */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-1/4 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl"></div>
      </div>

      {/* Logo/Brand Area - Compact */}
      <div className="mb-6 text-center">
        <Image
          src="/logo_maxim.png"
          alt="Maxim Barber Studio"
          width={500}
          height={131}
          priority
          unoptimized
          className="mx-auto"
        />
      </div>

      {/* Login/Register Card */}
      <Card className="w-full max-w-md border-border/50 bg-card/50 backdrop-blur-xl">
        <CardHeader className="space-y-1 pb-4 text-center">
          <CardTitle className="text-2xl font-bold">{mode === 'login' ? 'Bentornato' : 'Crea account'}</CardTitle>
          <CardDescription>{mode === 'login' ? 'Accedi per continuare' : 'Registrati per prenotare'}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Nome</Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="Mario"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="border-input bg-background/50"
                    autoComplete="given-name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Cognome</Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Rossi"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="border-input bg-background/50"
                    autoComplete="family-name"
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="phone">Telefono</Label>
              <div className="flex gap-2">
                <Select value={phonePrefix} onValueChange={setPhonePrefix}>
                  <SelectTrigger className="w-28 border-input bg-background/50">
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
                  placeholder="3331234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="flex-1 border-input bg-background/50"
                  autoComplete="tel"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-input bg-background/50"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                required
                minLength={6}
              />
              {mode === 'register' && <p className="text-sm text-muted-foreground">Min. 6 caratteri</p>}
            </div>

            {error && <div className="rounded-lg bg-destructive/10 p-3 text-base text-destructive">{error}</div>}

            <Button type="submit" className="h-12 w-full text-base font-semibold" disabled={isLoading}>
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

          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={toggleMode}
              className="text-base text-primary underline-offset-4 hover:underline"
            >
              {mode === 'login' ? 'Crea account' : 'Accedi'}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="mt-6 text-center text-sm text-muted-foreground">
        <p>© 2026 Maxim Barber Shop</p>
      </div>
    </div>
  );
}
