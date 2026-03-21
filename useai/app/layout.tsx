import type { Metadata } from 'next';
import { Instrument_Serif, DM_Sans, DM_Mono } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { Providers } from './providers';
import './globals.css';

const instrumentSerif = Instrument_Serif({
  variable: '--font-instrument',
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic']
});

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700']
});

const dmMono = DM_Mono({
  variable: '--font-dm-mono',
  subsets: ['latin'],
  weight: ['400', '500']
});

export const metadata: Metadata = {
  title: 'useAI — WhatsApp AI for Indian Businesses',
  description: 'Your business on WhatsApp, powered by real AI.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${instrumentSerif.variable} ${dmSans.variable} ${dmMono.variable}`}>
      <body>
        <Providers>
          <div className="cursor">
            <div className="c-dot" id="cd"></div>
            <div className="c-ring" id="cr"></div>
          </div>
          <Toaster position="top-center" />
          {children}
        </Providers>
      </body>
    </html>
  );
}
