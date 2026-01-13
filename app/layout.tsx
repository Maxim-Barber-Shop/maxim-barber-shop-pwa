import type { Metadata } from 'next';
import { Urbanist } from 'next/font/google';
import { RotateCcw } from 'lucide-react';
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
    startupImage: [
      // iPhone 12, 12 Pro, 13, 13 Pro, 14
      {
        url: '/splash/apple-splash-1170x2532.png',
        media:
          '(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)',
      },
      // iPhone 12 Pro Max, 13 Pro Max, 14 Plus
      {
        url: '/splash/apple-splash-1284x2778.png',
        media:
          '(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)',
      },
      // iPhone 14 Pro
      {
        url: '/splash/apple-splash-1179x2556.png',
        media:
          '(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)',
      },
      // iPhone 14 Pro Max, 15 Pro Max
      {
        url: '/splash/apple-splash-1290x2796.png',
        media:
          '(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)',
      },
      // iPhone X, XS, 11 Pro
      {
        url: '/splash/apple-splash-1125x2436.png',
        media:
          '(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)',
      },
      // iPhone XS Max, 11 Pro Max
      {
        url: '/splash/apple-splash-1242x2688.png',
        media:
          '(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)',
      },
      // iPhone XR, 11
      {
        url: '/splash/apple-splash-828x1792.png',
        media:
          '(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)',
      },
      // iPhone 8, SE2, SE3
      {
        url: '/splash/apple-splash-750x1334.png',
        media:
          '(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)',
      },
      // iPhone SE 1st gen
      {
        url: '/splash/apple-splash-640x1136.png',
        media:
          '(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)',
      },
      // iPad Pro 11"
      {
        url: '/splash/apple-splash-1668x2388.png',
        media:
          '(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)',
      },
      // iPad Pro 12.9"
      {
        url: '/splash/apple-splash-2048x2732.png',
        media:
          '(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)',
      },
      // iPad 10.2"
      {
        url: '/splash/apple-splash-1620x2160.png',
        media:
          '(device-width: 810px) and (device-height: 1080px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)',
      },
      // iPad Air, Mini
      {
        url: '/splash/apple-splash-1536x2048.png',
        media:
          '(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)',
      },
    ],
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
  themeColor: '#000000',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" style={{ backgroundColor: '#000000' }}>
      <head>
        <style
          dangerouslySetInnerHTML={{
            __html: `
              html,body{background:#000!important;margin:0;padding:0}
              #splash-screen{position:fixed;inset:0;background:#000;display:flex;align-items:center;justify-content:center;z-index:99999}
              #splash-screen.hidden{display:none}
              #splash-screen svg{width:120px;height:120px}
            `,
          }}
        />
      </head>
      <body className={`${urbanist.variable} font-sans antialiased`} style={{ backgroundColor: '#000000' }}>
        {/* Splash screen overlay */}
        <div id="splash-screen">
          <img src="/icon-512x512.png" alt="" width={120} height={120} />
        </div>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('load', function() {
                setTimeout(function() {
                  var splash = document.getElementById('splash-screen');
                  if (splash) splash.classList.add('hidden');
                }, 300);
              });
            `,
          }}
        />
        <div className="landscape-warning">
          <RotateCcw className="h-16 w-16 text-primary" />
          <p className="text-xl font-medium">Ruota il dispositivo in verticale</p>
          <p className="text-muted-foreground">L&apos;app funziona meglio in modalità portrait</p>
        </div>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
