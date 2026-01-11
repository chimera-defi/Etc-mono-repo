/**
 * Utility functions for handling external links with referrer attribution
 */

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
