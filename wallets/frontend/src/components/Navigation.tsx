'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, Wallet, Github, Twitter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { ThemeToggle } from './ThemeToggle';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/explore', label: 'Explore & Compare' },
  { href: '/companies', label: 'Companies' },
  { href: '/docs/software-wallets', label: 'Software Wallets' },
  { href: '/docs/hardware-wallets', label: 'Hardware Wallets' },
  { href: '/docs/crypto-cards', label: 'Crypto Cards' },
  { href: '/docs/ramps', label: 'Ramps' },
  { href: '/docs/about', label: 'About' },
  { href: '/docs', label: 'All Docs' },
];

export function Navigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/80 backdrop-blur-xl">
      <nav className="wr-container">
        <div className="flex h-16 items-center justify-between gap-3">
          <Link href="/" className="group inline-flex items-center gap-2">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 transition-colors group-hover:bg-primary/20 sm:h-9 sm:w-9">
              <Wallet className="h-5 w-5 text-primary" />
            </span>
            <span className="text-sm font-semibold tracking-tight sm:text-base md:text-lg">Wallet Radar</span>
            <span className="hidden rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground lg:inline-block">
              Research
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                  pathname === item.href
                    ? 'bg-primary/12 text-primary'
                    : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                )}
              >
                {item.label}
              </Link>
            ))}
            <ThemeToggle />
            <a
              href="https://x.com/chimeradefi?utm_source=walletradar&utm_medium=comparison"
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({
                variant: 'ghost',
                size: 'icon',
                className: 'h-9 w-9 rounded-xl',
              })}
              aria-label="Twitter"
            >
              <Twitter className="h-5 w-5" />
            </a>
            <a
              href="https://github.com/chimera-defi/Etc-mono-repo/tree/main/wallets?utm_source=walletradar&utm_medium=comparison"
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({
                variant: 'ghost',
                size: 'icon',
                className: 'h-9 w-9 rounded-xl',
              })}
              aria-label="GitHub"
            >
              <Github className="h-5 w-5" />
            </a>
          </div>

          <div className="md:hidden flex items-center gap-1">
            <ThemeToggle />
            <button
              className={buttonVariants({
                variant: 'ghost',
                size: 'icon',
                className: 'h-10 w-10 rounded-xl',
              })}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden pb-4">
            <div className="wr-panel overflow-hidden">
              <div className="grid grid-cols-1 gap-1 p-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'min-h-10 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      pathname === item.href
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
              <div className="flex items-center gap-2 border-t border-border px-3 py-3">
                <a
                  href="https://x.com/chimeradefi?utm_source=walletradar&utm_medium=comparison"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonVariants({
                    variant: 'outline',
                    size: 'sm',
                    className: 'min-h-10 flex-1 rounded-lg',
                  })}
                >
                  <Twitter className="h-4 w-4" />
                  Twitter
                </a>
                <a
                  href="https://github.com/chimera-defi/Etc-mono-repo/tree/main/wallets?utm_source=walletradar&utm_medium=comparison"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonVariants({
                    variant: 'outline',
                    size: 'sm',
                    className: 'min-h-10 flex-1 rounded-lg',
                  })}
                >
                  <Github className="h-4 w-4" />
                  GitHub
                </a>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
