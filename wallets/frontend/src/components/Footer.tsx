import Link from 'next/link';
import { Wallet, Github, ExternalLink, Mail, Twitter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border/80 bg-background/40">
      <div className="wr-container py-12 md:py-14">
        <div className="wr-panel mb-8 p-6 md:p-8">
          <div className="grid gap-6 md:grid-cols-[1.35fr_1fr] md:items-end">
            <div>
              <Link href="/" className="mb-3 inline-flex items-center gap-2">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-primary/25 bg-primary/10">
                  <Wallet className="h-5 w-5 text-primary" />
                </span>
                <span className="text-lg font-semibold tracking-tight">Wallet Radar</span>
              </Link>
              <p className="max-w-[52ch] text-sm leading-relaxed text-muted-foreground">
                Independent, developer-focused crypto wallet research with transparent data sources and reproducible scoring.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 md:justify-end">
              <Badge variant="accent">24+ software wallets</Badge>
              <Badge variant="accent">23+ hardware wallets</Badge>
              <Badge variant="accent">27+ cards</Badge>
              <Badge variant="accent">20+ ramps</Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Core Comparisons
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/docs/software-wallets" className="text-muted-foreground hover:text-foreground">
                  Software Wallets
                </Link>
              </li>
              <li>
                <Link href="/docs/hardware-wallets" className="text-muted-foreground hover:text-foreground">
                  Hardware Wallets
                </Link>
              </li>
              <li>
                <Link href="/docs/crypto-cards" className="text-muted-foreground hover:text-foreground">
                  Crypto Cards
                </Link>
              </li>
              <li>
                <Link href="/docs/ramps" className="text-muted-foreground hover:text-foreground">
                  Ramps
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Research
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/docs/readme" className="text-muted-foreground hover:text-foreground">
                  Methodology Overview
                </Link>
              </li>
              <li>
                <Link href="/docs/data-sources" className="text-muted-foreground hover:text-foreground">
                  Data Sources
                </Link>
              </li>
              <li>
                <Link href="/docs/contributing" className="text-muted-foreground hover:text-foreground">
                  Contributing
                </Link>
              </li>
              <li>
                <a
                  href="https://walletbeat.fyi?utm_source=walletradar&utm_medium=comparison"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
                >
                  WalletBeat <ExternalLink className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Contact + Source
            </h3>
            <div className="flex flex-wrap gap-2">
              <a
                href="mailto:chimera_deFi@protonmail.com"
                className={buttonVariants({ variant: 'outline', size: 'sm', className: 'rounded-lg' })}
              >
                <Mail className="h-4 w-4" />
                Contact
              </a>
              <a
                href="https://x.com/chimeradefi?utm_source=walletradar&utm_medium=comparison"
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({ variant: 'outline', size: 'sm', className: 'rounded-lg' })}
              >
                <Twitter className="h-4 w-4" />
                Twitter
              </a>
              <a
                href="https://github.com/chimera-defi/Etc-mono-repo/tree/main/wallets?utm_source=walletradar&utm_medium=comparison"
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({ variant: 'outline', size: 'sm', className: 'rounded-lg' })}
              >
                <Github className="h-4 w-4" />
                GitHub
              </a>
            </div>

            <div className="mt-4 text-sm text-muted-foreground">
              <p>
                <strong className="font-semibold text-foreground">Open source:</strong>{' '}
                <a href="https://github.com/chimera-defi/Etc-mono-repo/tree/main/wallets?utm_source=walletradar&utm_medium=comparison" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  Repository
                </a>
              </p>
              <p>
                <strong className="font-semibold text-foreground">Found an issue:</strong>{' '}
                <a href="https://github.com/chimera-defi/Etc-mono-repo/issues?utm_source=walletradar&utm_medium=comparison" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  Report it on GitHub
                </a>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-6 text-sm text-muted-foreground">
          Data from GitHub API, WalletBeat, and community research.
        </div>
      </div>
    </footer>
  );
}
