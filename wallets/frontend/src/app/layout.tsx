import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { ThemeProvider } from '@/components/ThemeProvider';
import { getSearchData } from '@/lib/search-data';

// Google Analytics Measurement ID - hardcoded for static export reliability
const GA_MEASUREMENT_ID = 'G-L6ZV569CMN';
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://walletradar.org';
const siteName = 'Wallet Radar';
const defaultTitle = 'Wallet Radar - Developer-Focused Crypto Wallet Research';
const defaultDescription = 'Independent research and comparison of crypto wallets, hardware wallets, and payment solutions. Scoring, security audits, GitHub activity analysis, and developer experience benchmarks.';
// Cache-busting version for OG images - increment when images are updated
const ogImageVersion = 'v5';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: defaultTitle,
    template: `%s | ${siteName}`,
  },
  description: defaultDescription,
  keywords: [
    'crypto wallet',
    'wallet research',
    'wallet comparison',
    'hardware wallet',
    'software wallet',
    'wallet analysis',
    'Rabby wallet',
    'Trezor',
    'Ledger',
    'EVM wallet',
    'Ethereum wallet',
    'Web3 wallet',
    'crypto security',
    'developer tools',
    'security audit',
    'blockchain wallet',
    'DeFi wallet',
    'educational research',
  ],
  authors: [{ name: 'Chimera DeFi' }],
  creator: 'Chimera DeFi',
  publisher: 'Chimera DeFi',
  applicationName: siteName,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: `${baseUrl}/`,
    siteName: siteName,
    title: defaultTitle,
    description: defaultDescription,
    images: [
      {
        url: `${baseUrl}/og-image.svg?${ogImageVersion}`,
        width: 1200,
        height: 630,
        alt: 'Wallet Radar - Developer-Focused Crypto Wallet Research',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: defaultTitle,
    description: defaultDescription,
    creator: '@chimeradefi',
    site: '@chimeradefi',
    images: [`${baseUrl}/og-image.svg?${ogImageVersion}`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: `${baseUrl}/`,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Generate search data at build time
  const searchData = getSearchData();
  // Structured data for Organization and Website
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteName,
    url: baseUrl,
    logo: `${baseUrl}/logo.svg`,
    description: 'Developer-focused crypto wallet research and comparison platform',
    sameAs: [
      'https://github.com/chimera-defi/Etc-mono-repo/tree/main/wallets',
      'https://x.com/chimeradefi',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'chimera_deFi@protonmail.com',
      contactType: 'Customer Service',
    },
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteName,
    url: baseUrl,
    description: defaultDescription,
  };

  // Script to prevent flash of wrong theme - runs before hydration
  const themeScript = `
    (function() {
      const savedTheme = localStorage.getItem('theme');
      const theme = savedTheme || 'dark';
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    })();
  `;

  return (
    <html lang="en" className="scroll-smooth dark" suppressHydrationWarning>
      <head>
        {/* Theme initialization script - must run before render to prevent FOUC */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        
        {/* Google Analytics - Standard implementation for static export sites */}
        {/* This MUST be in <head> for reliable tracking on static sites */}
        <script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_MEASUREMENT_ID}', {
                page_path: window.location.pathname,
                anonymize_ip: true
              });
              (function() {
                try {
                  var ref = document.referrer || '';
                  var refUrl = ref ? new URL(ref) : null;
                  var refHost = refUrl ? refUrl.hostname : 'direct';
                  var refPath = refUrl ? refUrl.pathname : '';
                  var url = new URL(window.location.href);
                  var params = url.searchParams;
                  var utmSource = params.get('utm_source');
                  var utmMedium = params.get('utm_medium');
                  var source = utmSource || refHost || 'direct';
                  var medium = utmMedium || (ref ? 'referral' : 'direct');
                  var aiHosts = [
                    'chat.openai.com',
                    'claude.ai',
                    'perplexity.ai',
                    'gemini.google.com',
                    'copilot.microsoft.com',
                    'bing.com'
                  ];
                  var isAi = aiHosts.includes(refHost) || (refHost === 'bing.com' && refPath.indexOf('/chat') === 0);
                  gtag('event', 'referral_detected', {
                    referrer_host: refHost,
                    referrer_path: refPath,
                    traffic_source: source,
                    traffic_medium: medium,
                    is_ai_referrer: isAi
                  });
                } catch (e) {
                  // no-op
                }
              })();
            `,
          }}
        />
        
        {/* Preconnect for performance (keeping for other Google services) */}
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        
        {/* PWA and icons */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.svg" />
        <meta name="theme-color" content="#0f172a" media="(prefers-color-scheme: dark)" />
        <meta name="theme-color" content="#3b82f6" media="(prefers-color-scheme: light)" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content={siteName} />
      </head>
      <body className="font-sans bg-gradient-to-b from-[#0b1020] to-[#111827] min-h-screen">
        <Script
          id="organization-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <Script
          id="website-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <ThemeProvider defaultTheme="dark">
          <div className="min-h-screen flex flex-col">
            <Navigation searchData={searchData} />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
