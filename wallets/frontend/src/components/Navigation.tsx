'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, Wallet, Github, Twitter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from './ThemeToggle';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/explore', label: 'Explore & Compare' },
  { href: '/articles', label: 'Articles' },
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
    <header className="sticky top-0 z-50 w-full border-b border-slate-700/60 bg-slate-900/80 backdrop-blur-md">
      <nav className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Wallet className="h-6 w-6 text-sky-400" />
            <span className="font-bold text-xl text-slate-100">Wallet Radar</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-sky-400',
                  pathname === item.href
                    ? 'text-sky-400'
                    : 'text-slate-400'
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
              className="text-slate-400 hover:text-slate-100 transition-colors"
              aria-label="Twitter"
            >
              <Twitter className="h-5 w-5" />
            </a>
            <a
              href="https://github.com/chimera-defi/Etc-mono-repo/tree/main/wallets?utm_source=walletradar&utm_medium=comparison"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-slate-100 transition-colors"
              aria-label="GitHub"
            >
              <Github className="h-5 w-5" />
            </a>
          </div>

          {/* Mobile Menu Button and Theme Toggle */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <button
              className="p-2"
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

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-700/60">
            <div className="flex flex-col space-y-3">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'text-sm font-medium transition-colors hover:text-sky-400 py-2',
                    pathname === item.href
                      ? 'text-sky-400'
                      : 'text-slate-400'
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
