import type { Metadata } from 'next';
import { Urbanist } from 'next/font/google';
import { AuthProvider } from '@/contexts/auth-context';
import './globals.css';

const urbanist = Urbanist({
  variable: '--font-urbanist',
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800'],
});

// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: 'Maxim Barber Shop - Prenota Online',
  description: 'Prenota il tuo appuntamento presso Maxim Barber Shop. Servizi premium di taglio e barba.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Maxim',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
};

// eslint-disable-next-line react-refresh/only-export-components
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#4169e1',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body className={`${urbanist.variable} font-sans antialiased`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
