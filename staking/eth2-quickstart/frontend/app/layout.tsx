import type { Metadata } from 'next'
import './globals.css'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

export const metadata: Metadata = {
  metadataBase: new URL('https://eth2-quickstart.com'),
  title: 'ETH2 Quick Start - Ethereum Node Setup in Minutes',
  description: 'Transform a fresh server into a fully-configured Ethereum node. 12 clients, automated security, MEV integration.',
  openGraph: {
    title: 'ETH2 Quick Start - Ethereum Node Setup in Minutes',
    description: 'Transform a fresh server into a fully-configured Ethereum node. 12 clients, automated security, MEV integration.',
    siteName: 'ETH2 Quick Start',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ETH2 Quick Start - Ethereum Node Setup in Minutes',
    description: 'Transform a fresh server into a fully-configured Ethereum node. 12 clients, automated security, MEV integration.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-foreground antialiased overflow-x-hidden">
        <Navbar />
        <main className="overflow-x-hidden">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
