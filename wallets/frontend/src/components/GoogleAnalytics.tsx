'use client';

import { useEffect } from 'react';

interface GoogleAnalyticsProps {
  measurementId: string;
}

const CONSENT_KEY = 'wallet-radar-cookie-consent';

export function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    // Initialize dataLayer
    window.dataLayer = window.dataLayer || [];
    
    // Define gtag function
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer.push(args);
    };

    // Check existing consent status
    const savedConsent = localStorage.getItem(CONSENT_KEY);
    const hasConsent = savedConsent === 'accepted';

    // Set default consent state (GDPR compliant - denied by default)
    window.gtag('consent', 'default', {
      analytics_storage: hasConsent ? 'granted' : 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    });

    // Load the gtag.js script
    const script1 = document.createElement('script');
    script1.async = true;
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script1);

    // Initialize gtag
    window.gtag('js', new Date());
    window.gtag('config', measurementId, {
      // Anonymize IP for additional privacy
      anonymize_ip: true,
      // Don't send page view until consent is given (if not already)
      send_page_view: hasConsent,
    });

    // If consent was already given, send the page view
    if (hasConsent) {
      window.gtag('event', 'page_view');
    }

    // Cleanup function
    return () => {
      // Remove script on unmount (though this rarely happens)
      const existingScript = document.querySelector(
        `script[src="https://www.googletagmanager.com/gtag/js?id=${measurementId}"]`
      );
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [measurementId]);

  return null;
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}
