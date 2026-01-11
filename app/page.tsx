'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // TODO: Implement login logic
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-background/95 px-4">
      {/* Background pattern */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl"></div>
      </div>

      {/* Logo/Brand Area */}
      <div className="mb-8 text-center">
        <h1 className="mb-2 bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-5xl font-bold tracking-tight text-transparent sm:text-6xl">
          MAXIM
        </h1>
        <p className="text-sm font-light uppercase tracking-[0.3em] text-muted-foreground">Barber Shop</p>
        <div className="mx-auto mt-4 h-px w-32 bg-gradient-to-r from-transparent via-primary to-transparent"></div>
      </div>

      {/* Login Card */}
      <Card className="w-full max-w-md border-border/50 bg-card/50 backdrop-blur-xl">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Benvenuto</CardTitle>
          <CardDescription>Inserisci il tuo numero per continuare</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Numero di telefono</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+39 333 1234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-12 border-input bg-background/50"
                required
              />
            </div>

            <Button type="submit" className="h-12 w-full text-base font-semibold" disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></div>
                  <span>Accesso in corso...</span>
                </div>
              ) : (
                'Accedi'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-muted-foreground">
            <p>Accedendo accetti i nostri</p>
            <p className="mt-1">
              <button className="underline-offset-4 hover:underline">Termini di servizio</button>
              {' e '}
              <button className="underline-offset-4 hover:underline">Privacy Policy</button>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      <div className="mt-12 grid max-w-4xl grid-cols-1 gap-6 px-4 text-center sm:grid-cols-3">
        <div className="rounded-lg border border-border/50 bg-card/30 p-6 backdrop-blur-sm">
          <div className="mb-3 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
          <h3 className="mb-2 font-semibold">Prenota Online</h3>
          <p className="text-sm text-muted-foreground">Scegli data e ora che preferisci</p>
        </div>

        <div className="rounded-lg border border-border/50 bg-card/30 p-6 backdrop-blur-sm">
          <div className="mb-3 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
          <h3 className="mb-2 font-semibold">Risparmia Tempo</h3>
          <p className="text-sm text-muted-foreground">Evita code e attese</p>
        </div>

        <div className="rounded-lg border border-border/50 bg-card/30 p-6 backdrop-blur-sm">
          <div className="mb-3 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                />
              </svg>
            </div>
          </div>
          <h3 className="mb-2 font-semibold">Servizi Premium</h3>
          <p className="text-sm text-muted-foreground">Qualità e professionalità</p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 text-center text-xs text-muted-foreground">
        <p>© 2026 Maxim Barber Shop. Tutti i diritti riservati.</p>
      </div>
    </div>
  );
}
