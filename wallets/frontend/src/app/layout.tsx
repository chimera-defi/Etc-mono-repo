import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { GoogleAnalytics } from '@/components/GoogleAnalytics';

const inter = Inter({ subsets: ['latin'] });

const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-L6ZV569CMN';

export const metadata: Metadata = {
  title: 'Wallet Radar - Developer-Focused Crypto Wallet Research',
  description: 'Comprehensive comparison of software and hardware crypto wallets for developers. Find stable MetaMask alternatives with scoring, security audits, and recommendations.',
  keywords: ['crypto wallet', 'MetaMask alternative', 'hardware wallet', 'Rabby', 'Trezor', 'wallet comparison', 'EVM wallet'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <Navigation />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </div>
        {gaMeasurementId && <GoogleAnalytics measurementId={gaMeasurementId} />}
      </body>
    </html>
  );
}
