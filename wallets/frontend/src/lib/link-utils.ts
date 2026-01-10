/**
 * Utility functions for handling external links with referrer attribution
 */

export interface LinkAttribution {
  url: string;
  hasParams: boolean;
  isExternal: boolean;
}

/**
 * Add referrer tracking parameters to external links
 * Adds utm_source=walletradar and utm_medium=comparison for tracking
 */
export function addReferrerTracking(href: string, source: string = 'walletradar', medium: string = 'comparison'): string {
  if (!href || !href.startsWith('http')) {
    return href;
  }

  try {
    const url = new URL(href);

    // Only add UTM params if they don't already exist
    if (!url.searchParams.has('utm_source')) {
      url.searchParams.set('utm_source', source);
    }
    if (!url.searchParams.has('utm_medium')) {
      url.searchParams.set('utm_medium', medium);
    }

    return url.toString();
  } catch {
    // If URL parsing fails, return original href
    return href;
  }
}

/**
 * Check if a URL is external (http/https)
 */
export function isExternalLink(href?: string): boolean {
  return !!href && href.startsWith('http');
}

/**
 * Get a descriptive title for external links
 * Helps clarify to users that they're leaving our site
 */
export function getExternalLinkTitle(href: string): string {
  try {
    const url = new URL(href);
    return `Opens external link: ${url.hostname}`;
  } catch {
    return 'Opens external link';
  }
}

/**
 * List of known safe wallet/research domains
 * Used for additional trust verification
 */
const TRUSTED_DOMAINS = [
  'github.com',
  'ethereum.org',
  'chainlist.org',
  'walletbeat.fyi',
  'trezor.io',
  'ledger.com',
  'coldcard.com',
  'keystone.so',
  'bitbox.swiss',
  'keepkey.com',
  'gnosispay.com',
  'ether.fi',
  'transak.com',
  'rabby.io',
  'metamask.io',
  'walletconnect.com',
  'twitter.com',
  'x.com',
];

/**
 * Check if a domain is in our trusted domains list
 */
export function isTrustedDomain(href: string): boolean {
  try {
    const url = new URL(href);
    return TRUSTED_DOMAINS.some(domain =>
      url.hostname === domain || url.hostname.endsWith('.' + domain)
    );
  } catch {
    return false;
  }
}
