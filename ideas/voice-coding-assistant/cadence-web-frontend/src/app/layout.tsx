import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Cadence - Voice Coding Assistant',
  description: 'Voice-enabled AI coding assistant powered by Claude',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-[var(--text)]">
        {children}
      </body>
    </html>
  );
}
