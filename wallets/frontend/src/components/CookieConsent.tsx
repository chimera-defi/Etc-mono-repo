'use client';

import { useState, useEffect } from 'react';
import { X, Cookie } from 'lucide-react';
import Link from 'next/link';

const CONSENT_KEY = 'wallet-radar-cookie-consent';

type ConsentStatus = 'pending' | 'accepted' | 'rejected';

interface CookieConsentProps {
  onAccept?: () => void;
  onReject?: () => void;
}

export function CookieConsent({ onAccept, onReject }: CookieConsentProps) {
  const [consentStatus, setConsentStatus] = useState<ConsentStatus>('pending');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const savedConsent = localStorage.getItem(CONSENT_KEY);
    if (savedConsent === 'accepted' || savedConsent === 'rejected') {
      setConsentStatus(savedConsent as ConsentStatus);
      setIsVisible(false);
    } else {
      // Show banner after a short delay for better UX
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(CONSENT_KEY, 'accepted');
    setConsentStatus('accepted');
    setIsVisible(false);
    onAccept?.();
    
    // Enable Google Analytics if it was waiting
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'granted',
      });
    }
  };

  const handleReject = () => {
    localStorage.setItem(CONSENT_KEY, 'rejected');
    setConsentStatus('rejected');
    setIsVisible(false);
    onReject?.();
    
    // Disable Google Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'denied',
      });
    }
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible || consentStatus !== 'pending') {
    return null;
  }

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
      role="dialog"
      aria-label="Cookie consent"
      aria-describedby="cookie-consent-description"
    >
      <div className="container mx-auto max-w-4xl">
        <div className="bg-card border border-border rounded-lg shadow-lg p-4 md:p-6">
          <div className="flex items-start gap-4">
            <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 flex-shrink-0">
              <Cookie className="h-5 w-5 text-primary" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg mb-2">Cookie Preferences</h3>
              <p id="cookie-consent-description" className="text-sm text-muted-foreground mb-4">
                We use cookies and similar technologies to analyze traffic and improve your experience. 
                By clicking &quot;Accept&quot;, you consent to our use of Google Analytics for website analytics.
                You can change your preferences at any time.{' '}
                <Link href="/docs/readme" className="text-primary hover:underline">
                  Learn more
                </Link>
              </p>
              
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleAccept}
                  className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  Accept All
                </button>
                <button
                  onClick={handleReject}
                  className="inline-flex items-center px-4 py-2 border border-border rounded-md text-sm font-medium hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  Reject Non-Essential
                </button>
              </div>
            </div>
            
            <button
              onClick={handleClose}
              className="p-1 text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
              aria-label="Close cookie banner"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Hook to check cookie consent status
 */
export function useCookieConsent(): ConsentStatus {
  const [status, setStatus] = useState<ConsentStatus>('pending');

  useEffect(() => {
    const savedConsent = localStorage.getItem(CONSENT_KEY);
    if (savedConsent === 'accepted' || savedConsent === 'rejected') {
      setStatus(savedConsent as ConsentStatus);
    }
  }, []);

  return status;
}
