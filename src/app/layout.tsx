import type { Metadata, Viewport } from 'next';
import { Chakra_Petch, Inter, JetBrains_Mono } from 'next/font/google';
import { FlashAdModal } from '@/components/ads/FlashAdModal';
import { SessionProvider } from '@/components/auth/SessionProvider';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { ServiceWorkerRegister } from '@/components/pwa/ServiceWorkerRegister';
import { areAdsEnabled } from '@/lib/ads/ads-enabled';
import './globals.css';

const chakra = Chakra_Petch({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-chakra',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Cifra Tom · Cifras para violão',
  description:
    'Cifras 100% focadas em violão: transposição, capotraste calculado, números da escala e shapes por afinação.',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favico.png', type: 'image/png', sizes: '488x511' },
    ],
    apple: [{ url: '/favico.png', type: 'image/png' }],
  },
};

export const viewport: Viewport = {
  themeColor: '#f2ab3c',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${chakra.variable} ${inter.variable} ${jetbrains.variable}`}>
      <body className="flex min-h-screen flex-col font-sans">
        <SessionProvider>
          <ServiceWorkerRegister />
          <Header />
          <main className="flex-1">{children}</main>
          {areAdsEnabled() && <FlashAdModal />}
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}
