import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';

const inter = Inter({ subsets: ['latin'] });

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
      </body>
    </html>
  );
}
