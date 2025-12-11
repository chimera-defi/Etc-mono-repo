import Link from 'next/link';
import { Wallet, Github, ExternalLink, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <Wallet className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">Wallet Compare</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Developer-focused crypto wallet research and comparison.
            </p>
          </div>

          {/* Comparisons */}
          <div>
            <h3 className="font-semibold mb-3">Comparisons</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/docs/wallet-comparison-unified" className="text-muted-foreground hover:text-foreground">
                  Software Wallets
                </Link>
              </li>
              <li>
                <Link href="/docs/hardware-wallet-comparison" className="text-muted-foreground hover:text-foreground">
                  Hardware Wallets
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold mb-3">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/docs/readme" className="text-muted-foreground hover:text-foreground">
                  Overview
                </Link>
              </li>
              <li>
                <Link href="/docs/contributing" className="text-muted-foreground hover:text-foreground">
                  Contributing
                </Link>
              </li>
              <li>
                <a 
                  href="https://walletbeat.fyi" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                >
                  WalletBeat <ExternalLink className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* External */}
          <div>
            <h3 className="font-semibold mb-3">External</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a 
                  href="https://ethereum.org/en/wallets/find-wallet/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                >
                  Ethereum.org Wallets <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a 
                  href="https://chainlist.org" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                >
                  ChainList <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a 
                  href="mailto:chimera_deFi@protonmail.com"
                  className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                >
                  Contact Us <Mail className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            Data from GitHub API, WalletBeat, and community research.
          </p>
          <div className="flex items-center gap-6">
            <a
              href="mailto:chimera_deFi@protonmail.com"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <Mail className="h-4 w-4" />
              Contact Us
            </a>
            <a
              href="https://github.com/chimera-defi/Etc-mono-repo/tree/main/wallets"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <Github className="h-4 w-4" />
              View on GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
