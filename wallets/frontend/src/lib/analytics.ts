/**
 * Google Analytics 4 utilities for Wallet Radar
 * Use from client components only (checks typeof window)
 */

export const GA_MEASUREMENT_ID = 'G-L6ZV569CMN';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

function safeGtag(...args: unknown[]): void {
  if (typeof window === 'undefined') return;
  if (window.gtag) {
    window.gtag(...args);
  } else {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(args);
  }
}

/** Send page_view for client-side navigation (SPA). Uses config to trigger GA4 page_view. */
export function pageView(path: string, title?: string): void {
  safeGtag('config', GA_MEASUREMENT_ID, {
    page_path: path,
    page_title: title,
  });
}

/** Track search queries */
export function trackSearch(searchTerm: string): void {
  safeGtag('event', 'search', { search_term: searchTerm });
}

/** Track external link clicks (wallet sites, docs, etc.) */
export function trackOutboundLink(url: string, linkText?: string): void {
  safeGtag('event', 'click', {
    event_category: 'outbound',
    event_label: url,
    link_url: url,
    link_text: linkText,
  });
}

/** Track share actions */
export function trackShare(platform: string, contentType?: string, itemId?: string): void {
  safeGtag('event', 'share', {
    method: platform,
    content_type: contentType,
    item_id: itemId,
  });
}

/** Track copy link */
export function trackCopyLink(url: string): void {
  safeGtag('event', 'copy_link', { link_url: url });
}
