'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { pageView } from '@/lib/analytics';

/**
 * Sends page_view on route changes (client-side navigation).
 * GA4 config in layout sends initial page_view; this handles SPA navigations only.
 */
export function GoogleAnalytics() {
  const pathname = usePathname();
  const prevPathRef = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname) return;
    // Skip initial mount — layout's GA config sends initial page_view
    if (prevPathRef.current === null) {
      prevPathRef.current = pathname;
      return;
    }
    if (prevPathRef.current !== pathname) {
      prevPathRef.current = pathname;
      pageView(pathname);
    }
  }, [pathname]);

  return null;
}
