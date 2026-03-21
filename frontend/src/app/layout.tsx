import type { Metadata } from 'next';
import { Syne, Outfit } from 'next/font/google';
import './globals.css';
import Providers from '@/components/Providers';
import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from 'react-hot-toast';

const syne = Syne({
  variable: '--font-syne',
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
});

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'useAI — Your AI WhatsApp Business Agent',
  description: 'Train AI on your website in 5 minutes.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${syne.variable} ${outfit.variable}`}>
          <Providers>
            <Toaster position="top-right" />
            {children}
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}

