import type { Metadata, Viewport } from 'next';
import './globals.css';
import { QueryProvider } from '@/components/providers/QueryProvider';

export const metadata: Metadata = {
  title: 'FreelancerOS — Your freelance business, in one place',
  description: 'Operating system for independent creative freelancers, studios, and consultants.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-neutral-900 selection:text-white dark:selection:bg-neutral-100 dark:selection:text-black">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
