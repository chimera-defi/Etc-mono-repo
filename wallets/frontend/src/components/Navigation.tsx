'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, Wallet, Github, Twitter, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from './ThemeToggle';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/explore', label: 'Explore' },
  { href: '/docs/software-wallets', label: 'Software' },
  { href: '/docs/hardware-wallets', label: 'Hardware' },
  { href: '/docs/crypto-cards', label: 'Cards' },
  { href: '/docs/ramps', label: 'Ramps' },
  { href: '/articles', label: 'Articles' },
  { href: '/docs', label: 'Docs' },
];

export function Navigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-700/60 bg-slate-900/80 backdrop-blur-md">
      <nav className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Wallet className="h-6 w-6 text-sky-400" />
            <span className="font-bold text-xl text-slate-100">Wallet Radar</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'px-3 py-2 text-sm font-medium rounded-lg transition-colors hover:bg-slate-800/50',
                  pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
                    ? 'text-sky-400 bg-sky-500/10'
                    : 'text-slate-400 hover:text-slate-200'
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-2">
            {/* Search button */}
            <Link
              href="/explore"
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-400 bg-slate-800/50 border border-slate-700/60 rounded-lg hover:border-slate-600 hover:text-slate-300 transition-colors"
              title="Search & Compare"
            >
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">Search</span>
            </Link>

            <ThemeToggle />

            <a
              href="https://x.com/chimeradefi?utm_source=walletradar&utm_medium=comparison"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:block text-slate-400 hover:text-slate-100 transition-colors p-2"
              aria-label="Twitter"
            >
              <Twitter className="h-5 w-5" />
            </a>
            <a
              href="https://github.com/chimera-defi/Etc-mono-repo/tree/main/wallets?utm_source=walletradar&utm_medium=comparison"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:block text-slate-400 hover:text-slate-100 transition-colors p-2"
              aria-label="GitHub"
            >
              <Github className="h-5 w-5" />
            </a>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6 text-slate-300" />
              ) : (
                <Menu className="h-6 w-6 text-slate-300" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-slate-700/60">
            <div className="flex flex-col space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                    pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
                      ? 'text-sky-400 bg-sky-500/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <div className="flex items-center gap-2 px-3 pt-2 mt-2 border-t border-slate-700/60">
                <a
                  href="https://x.com/chimeradefi?utm_source=walletradar&utm_medium=comparison"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-slate-100 transition-colors p-2"
                  aria-label="Twitter"
                >
                  <Twitter className="h-5 w-5" />
                </a>
                <a
                  href="https://github.com/chimera-defi/Etc-mono-repo/tree/main/wallets?utm_source=walletradar&utm_medium=comparison"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-slate-100 transition-colors p-2"
                  aria-label="GitHub"
                >
                  <Github className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
