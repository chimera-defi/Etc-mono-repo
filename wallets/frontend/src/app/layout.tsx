import type { Metadata } from 'next';
import Script from 'next/script';
import { IBM_Plex_Sans, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { ThemeProvider } from '@/components/ThemeProvider';
import { GoogleAnalytics } from '@/components/GoogleAnalytics';
import { getSearchData } from '@/lib/search-data';
import { brand } from '@/lib/brand';

// Google Analytics Measurement ID - hardcoded for static export reliability
const GA_MEASUREMENT_ID = 'G-L6ZV569CMN';
const bodyFont = IBM_Plex_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
  weight: ['400', '500', '600', '700'],
});
const displayFont = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
  weight: ['500', '600', '700'],
});

export const metadata: Metadata = {
  metadataBase: new URL(brand.baseUrl),
  title: {
    default: brand.defaultTitle,
    template: `%s | ${brand.displayName}`,
  },
  description: brand.defaultDescription,
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
  applicationName: brand.displayName,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: `${brand.baseUrl}/`,
    siteName: brand.displayName,
    title: brand.defaultTitle,
    description: brand.defaultDescription,
    images: [
      {
        url: `${brand.baseUrl}/og-image.svg?${brand.ogImageVersion}`,
        width: 1200,
        height: 630,
        alt: `${brand.displayName} - Developer-Focused Crypto Wallet Research`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: brand.defaultTitle,
    description: brand.defaultDescription,
    creator: brand.twitterHandle,
    site: brand.twitterHandle,
    images: [`${brand.baseUrl}/og-image.svg?${brand.ogImageVersion}`],
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
    canonical: `${brand.baseUrl}/`,
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
    name: brand.displayName,
    url: brand.baseUrl,
    logo: `${brand.baseUrl}/logo.svg`,
    description: 'Developer-focused crypto wallet research and comparison platform',
    sameAs: [
      brand.githubUrl,
      brand.twitterUrl,
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      email: brand.contactEmail,
      contactType: 'Customer Service',
    },
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: brand.displayName,
    url: brand.baseUrl,
    description: brand.defaultDescription,
  };

  // Minified theme init - runs before hydration to prevent FOUC
  const themeScript = '(function(){var t=localStorage.getItem("theme")||"dark";document.documentElement.classList.toggle("dark",t==="dark");})();';

  return (
    <html
      lang="en"
      className={`${bodyFont.variable} ${displayFont.variable} scroll-smooth dark`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.svg" />
        <meta name="theme-color" content="#0f172a" media="(prefers-color-scheme: dark)" />
        <meta name="theme-color" content="#3b82f6" media="(prefers-color-scheme: light)" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content={brand.shortName} />
      </head>
      <body className="font-sans bg-background min-h-screen">
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
        <Script
          strategy="lazyOnload"
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        />
        <Script id="ga-config" strategy="lazyOnload">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_MEASUREMENT_ID}',{page_path:window.location.pathname,anonymize_ip:true});try{var r=document.referrer||'',u=r?new URL(r):null,h=u?u.hostname:'direct',p=u?u.pathname:'',s=new URL(location.href).searchParams,src=s.get('utm_source')||h,med=s.get('utm_medium')||(r?'referral':'direct'),ai=['chat.openai.com','claude.ai','perplexity.ai','gemini.google.com','copilot.microsoft.com','bing.com'],isAi=ai.includes(h)||(h==='bing.com'&&p.startsWith('/chat'));gtag('event','referral_detected',{referrer_host:h,referrer_path:p,traffic_source:src,traffic_medium:med,is_ai_referrer:isAi});}catch(e){}`}
        </Script>
        <ThemeProvider defaultTheme="dark">
          <GoogleAnalytics />
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
