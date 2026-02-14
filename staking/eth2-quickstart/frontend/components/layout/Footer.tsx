import Link from 'next/link'
import { SITE_CONFIG } from '@/lib/constants'

const footerLinks = [
  { label: 'Documentation', href: '/learn', internal: true },
  { label: 'GitHub', href: SITE_CONFIG.github },
  { label: 'Issues', href: `${SITE_CONFIG.github}/issues` },
]

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-5 sm:py-6">
        <div className="flex flex-col items-center justify-between gap-3 sm:gap-4 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            ETH2 Quick Start
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            {footerLinks.map((link) => (
              link.internal ? (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </a>
              )
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
