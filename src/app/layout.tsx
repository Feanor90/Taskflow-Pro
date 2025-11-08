import type { Metadata } from 'next';
import { Play } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { Providers } from './providers';

const play = Play({ 
  subsets: ['latin'], 
  weight: ['400', '700'],
  variable: '--font-primary',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'TaskFlow Pro - Gestión de Tareas con Pomodoro',
  description:
    'Aplicación de gestión de tareas con técnica Pomodoro integrada para máxima productividad',
  manifest: '/manifest.json',
  themeColor: '#22c55e',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${play.variable} font-sans antialiased`}>
        <Providers>
          <AuthProvider>{children}</AuthProvider>
        </Providers>
      </body>
    </html>
  );
}

