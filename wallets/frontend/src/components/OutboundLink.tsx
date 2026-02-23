'use client';

import { useRef, useEffect } from 'react';
import { trackOutboundLink } from '@/lib/analytics';

interface OutboundLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  trackLabel?: string;
}

/**
 * External link with GA outbound tracking. Uses useEffect to attach click handler
 * (avoids passing onClick during SSR, which breaks RSC serialization).
 */
export function OutboundLink({ href, trackLabel, children, ...props }: OutboundLinkProps) {
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !href) return;
    const handler = () => trackOutboundLink(href, trackLabel);
    el.addEventListener('click', handler);
    return () => el.removeEventListener('click', handler);
  }, [href, trackLabel]);

  return (
    <a ref={ref} href={href} {...props}>
      {children}
    </a>
  );
}
