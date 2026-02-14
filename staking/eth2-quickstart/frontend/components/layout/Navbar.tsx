'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { SITE_CONFIG, NAV_LINKS } from '@/lib/constants'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  // Close mobile menu on route change (resize to desktop)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  
  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileMenuOpen])
  
  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <Link 
            href="/" 
            className="font-mono text-sm font-medium text-foreground"
          >
            {SITE_CONFIG.shortName}
          </Link>
          
          {/* Desktop navigation */}
          <div className="hidden items-center gap-6 lg:gap-8 md:flex">
            {NAV_LINKS.map((link) => (
              link.external ? (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              )
            ))}
            <Button href="/quickstart" size="sm">
              Get Started
            </Button>
          </div>
          
          {/* Mobile menu button */}
          <button
            type="button"
            className="inline-flex items-center justify-center p-2 text-muted-foreground transition-colors hover:text-foreground md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      
      {/* Mobile menu with animation */}
      <div
        className={cn(
          'border-t border-border bg-background md:hidden overflow-hidden transition-all duration-200 ease-out',
          mobileMenuOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0 border-t-0'
        )}
      >
        <div className="px-4 sm:px-6 py-4 space-y-1 mobile-menu-enter">
          {NAV_LINKS.map((link) => (
            link.external ? (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="block py-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.label}
                href={link.href}
                className="block py-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            )
          ))}
          <div className="pt-3">
            <Button href="/quickstart" className="w-full justify-center" onClick={() => setMobileMenuOpen(false)}>
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
