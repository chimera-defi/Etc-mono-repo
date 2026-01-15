import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Shield } from 'lucide-react';
import { getHardwareWalletCompanies } from '@/lib/wallet-data';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://walletradar.org';
const ogImageVersion = 'v4';

export const metadata: Metadata = {
  title: 'Hardware Wallet Companies | Wallet Radar',
  description: 'Aggregated scores and statistics for hardware wallet manufacturers. Compare companies based on average wallet security scores.',
  openGraph: {
    title: 'Hardware Wallet Companies | Wallet Radar',
    description: 'Aggregated scores and statistics for hardware wallet manufacturers. Compare companies based on average wallet security scores.',
    url: `${baseUrl}/companies/`,
    type: 'website',
    images: [
      {
        url: `${baseUrl}/og-image.png?${ogImageVersion}`,
        width: 1200,
        height: 630,
        alt: 'Hardware wallet companies comparison',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hardware Wallet Companies | Wallet Radar',
    description: 'Aggregated scores and statistics for hardware wallet manufacturers.',
    creator: '@chimeradefi',
    site: '@chimeradefi',
    images: [`${baseUrl}/og-image.png?${ogImageVersion}`],
  },
  alternates: {
    canonical: `${baseUrl}/companies/`,
  },
};

export default function CompaniesPage() {
  const companies = getHardwareWalletCompanies();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Hardware Wallet Companies</h1>
        <p className="text-muted-foreground">
          Compare hardware wallet manufacturers based on their aggregated wallet scores.
        </p>
      </div>

      <div className="grid gap-6">
        <div className="border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-6 py-3 font-medium">Company</th>
                  <th className="px-6 py-3 font-medium">Aggregated Score</th>
                  <th className="px-6 py-3 font-medium">Wallet Count</th>
                  <th className="px-6 py-3 font-medium">Wallets</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {companies.map((company) => (
                  <tr key={company.name} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-lg">{company.name}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={
                          company.aggregatedScore >= 90 ? 'text-green-600 dark:text-green-400 font-bold' :
                          company.aggregatedScore >= 75 ? 'text-green-600 dark:text-green-400' :
                          company.aggregatedScore >= 50 ? 'text-yellow-600 dark:text-yellow-400' :
                          'text-red-600 dark:text-red-400'
                        }>
                          {company.aggregatedScore.toFixed(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center justify-center px-2 py-1 rounded-md bg-muted font-medium">
                        {company.walletCount}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {company.wallets.map(wallet => (
                          <Link 
                            key={wallet.id}
                            href={`/wallets/hardware/${wallet.id}`}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border border-border hover:border-primary/50 hover:bg-primary/5 transition-colors"
                          >
                            <Shield className="h-3 w-3" />
                            {wallet.name}
                          </Link>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <div className="mt-8 text-center">
        <Link 
          href="/docs/hardware-wallets"
          className="inline-flex items-center gap-2 text-primary hover:underline"
        >
          View full hardware wallet comparison table
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
