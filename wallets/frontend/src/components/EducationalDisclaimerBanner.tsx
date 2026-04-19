'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Info, X } from 'lucide-react';

const DISMISS_KEY = 'walletradar-dismiss-educational-banner';

export function EducationalDisclaimerBanner() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(DISMISS_KEY) === 'true') {
        setIsVisible(false);
      }
    } catch {
      // Ignore storage access errors (private browsing / restricted environments).
    }
  }, []);

  const dismissBanner = () => {
    setIsVisible(false);
    try {
      window.localStorage.setItem(DISMISS_KEY, 'true');
    } catch {
      // Ignore storage access errors (private browsing / restricted environments).
    }
  };

  if (!isVisible) return null;

  return (
    <div className="w-full bg-sky-900/30 border-b border-sky-800/50 text-sky-100 px-4 py-3">
      <div className="container mx-auto max-w-7xl flex items-start gap-3">
        <div className="mt-0.5 flex-shrink-0">
          <Info className="h-5 w-5 text-sky-400" aria-hidden="true" />
        </div>
        <div className="flex-1 text-sm">
          <p className="font-semibold">Educational Research &amp; Data Only</p>
          <p className="text-sky-200/80">
            No login pages, no wallet connections, no tracking. All data is public and verifiable.{' '}
            <Link href="/docs/about" className="underline hover:text-white">
              Why we&apos;re not phishing
            </Link>
            . Full disclosure in the{' '}
            <Link href="/#faq" className="underline hover:text-white">
              FAQ
            </Link>
            .
          </p>
        </div>
        <button
          type="button"
          onClick={dismissBanner}
          className="rounded-md p-1.5 text-sky-300/90 hover:text-white hover:bg-sky-700/40 transition-colors"
          aria-label="Dismiss educational data notice"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
