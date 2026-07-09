import type { Metadata } from 'next';
import { Chakra_Petch, Inter, JetBrains_Mono } from 'next/font/google';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
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
  title: 'CifraLab · Cifras para violão',
  description:
    'Cifras 100% focadas em violão: transposição, capotraste calculado, números da escala e shapes por afinação.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${chakra.variable} ${inter.variable} ${jetbrains.variable}`}>
      <body className="flex min-h-screen flex-col font-sans">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
