import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ToastProvider } from '@/components/ToastProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'stAZTEC - Liquid Staking for Aztec',
  description: 'Stake AZTEC, receive stAZTEC, and earn rewards while keeping your assets liquid. The first liquid staking protocol on Aztec.',
  keywords: ['Aztec', 'stAZTEC', 'liquid staking', 'DeFi', 'crypto', 'staking'],
  openGraph: {
    title: 'stAZTEC - Liquid Staking for Aztec',
    description: 'Stake AZTEC, receive stAZTEC, and earn rewards while keeping your assets liquid.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
