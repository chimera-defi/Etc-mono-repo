import Link from 'next/link';
import { Wallet, Github, ExternalLink, Mail, Twitter } from 'lucide-react';
import { trackOutboundLink } from '@/lib/analytics';

export function Footer() {
  return (
    <footer className="border-t border-slate-700/60 bg-slate-900/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <Wallet className="h-6 w-6 text-sky-400" />
              <span className="font-bold text-lg text-slate-100">Wallet Radar</span>
            </Link>
            <p className="text-sm text-slate-400">
              Developer-focused crypto wallet research and comparison.
            </p>
          </div>

          {/* Comparisons */}
          <div>
            <h3 className="font-semibold mb-3 text-slate-100">Comparisons</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/docs/software-wallets" className="text-slate-400 hover:text-sky-400 transition-colors">
                  Software Wallets
                </Link>
              </li>
              <li>
                <Link href="/docs/hardware-wallets" className="text-slate-400 hover:text-sky-400 transition-colors">
                  Hardware Wallets
                </Link>
              </li>
              <li>
                <Link href="/docs/crypto-cards" className="text-slate-400 hover:text-sky-400 transition-colors">
                  Crypto Cards
                </Link>
              </li>
              <li>
                <Link href="/docs/ramps" className="text-slate-400 hover:text-sky-400 transition-colors">
                  Ramps
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold mb-3 text-slate-100">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/docs/readme" className="text-slate-400 hover:text-sky-400 transition-colors">
                  Overview
                </Link>
              </li>
              <li>
                <Link href="/docs/about" className="text-slate-400 hover:text-sky-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/docs/data-sources" className="text-slate-400 hover:text-sky-400 transition-colors">
                  Data Sources
                </Link>
              </li>
              <li>
                <Link href="/docs/contributing" className="text-slate-400 hover:text-sky-400 transition-colors">
                  Contributing
                </Link>
              </li>
              <li>
                <a
                  href="https://walletbeat.fyi?utm_source=walletradar&utm_medium=comparison"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackOutboundLink('https://walletbeat.fyi', 'WalletBeat')}
                  className="text-slate-400 hover:text-sky-400 transition-colors inline-flex items-center gap-1"
                >
                  WalletBeat <ExternalLink className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* External */}
          <div>
            <h3 className="font-semibold mb-3 text-slate-100">External</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://ethereum.org/en/wallets/find-wallet/?utm_source=walletradar&utm_medium=comparison"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackOutboundLink('https://ethereum.org/en/wallets/find-wallet/', 'Ethereum.org Wallets')}
                  className="text-slate-400 hover:text-sky-400 transition-colors inline-flex items-center gap-1"
                >
                  Ethereum.org Wallets <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://chainlist.org?utm_source=walletradar&utm_medium=comparison"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackOutboundLink('https://chainlist.org', 'ChainList')}
                  className="text-slate-400 hover:text-sky-400 transition-colors inline-flex items-center gap-1"
                >
                  ChainList <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href="mailto:chimera_deFi@protonmail.com"
                  className="text-slate-400 hover:text-sky-400 transition-colors inline-flex items-center gap-1"
                >
                  Contact Us <Mail className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-700/60">
          <p className="text-sm text-slate-400 mb-4">
            Data from GitHub API, WalletBeat, and community research.
          </p>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="text-sm text-slate-400">
              <p><strong className="text-slate-300">Open Source:</strong> <a href="https://github.com/chimera-defi/Etc-mono-repo/tree/main/wallets?utm_source=walletradar&utm_medium=comparison" target="_blank" rel="noopener noreferrer" onClick={() => trackOutboundLink('https://github.com/chimera-defi/Etc-mono-repo/tree/main/wallets', 'View on GitHub')} className="text-sky-400 hover:text-sky-300 transition-colors">View on GitHub</a></p>
              <p><strong className="text-slate-300">Found an issue?</strong> <a href="https://github.com/chimera-defi/Etc-mono-repo/issues?utm_source=walletradar&utm_medium=comparison" target="_blank" rel="noopener noreferrer" onClick={() => trackOutboundLink('https://github.com/chimera-defi/Etc-mono-repo/issues', 'Report on GitHub Issues')} className="text-sky-400 hover:text-sky-300 transition-colors">Report on GitHub Issues</a></p>
            </div>
            <div className="flex items-center gap-6">
              <a
                href="mailto:chimera_deFi@protonmail.com"
                className="flex items-center gap-2 text-sm text-slate-400 hover:text-sky-400 transition-colors"
              >
                <Mail className="h-4 w-4" />
                Contact Us
              </a>
              <a
                href="https://x.com/chimeradefi?utm_source=walletradar&utm_medium=comparison"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackOutboundLink('https://x.com/chimeradefi', 'Twitter')}
                className="flex items-center gap-2 text-sm text-slate-400 hover:text-sky-400 transition-colors"
              >
                <Twitter className="h-4 w-4" />
                Twitter
              </a>
              <a
                href="https://github.com/chimera-defi/Etc-mono-repo/tree/main/wallets?utm_source=walletradar&utm_medium=comparison"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackOutboundLink('https://github.com/chimera-defi/Etc-mono-repo/tree/main/wallets', 'Source Code')}
                className="flex items-center gap-2 text-sm text-slate-400 hover:text-sky-400 transition-colors"
              >
                <Github className="h-4 w-4" />
                Source Code
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
