import type { Metadata } from 'next'
import { CodeBlock } from '@/components/ui/CodeBlock'
import { Button } from '@/components/ui/Button'
import { 
  DOCUMENTATION_LINKS, 
  EXECUTION_CLIENTS, 
  CONSENSUS_CLIENTS, 
  SITE_CONFIG 
} from '@/lib/constants'
import { ExternalLink, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Learn - ETH2 Quick Start',
  description: 'Documentation for Ethereum node setup, client options, and configuration.',
}

const configExamples = [
  {
    title: 'Basic Setup',
    code: `# exports.sh
export ETH_NETWORK='mainnet'
export FEE_RECIPIENT='0xYourAddress'`,
  },
  {
    title: 'Client Selection',
    code: `export EXEC_CLIENT='geth'
export CONS_CLIENT='prysm'`,
  },
  {
    title: 'MEV Configuration',
    code: `export MEV_RELAYS='https://relay1,https://relay2'
export MIN_BID=0.002`,
  },
]

export default function LearnPage() {
  return (
    <div className="min-h-screen py-12 sm:py-16 md:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        {/* Header */}
        <header>
          <p className="font-mono text-sm text-muted-foreground uppercase tracking-wide">
            Documentation
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl md:text-4xl">
            Learn & Explore
          </h1>
          <p className="mt-3 sm:mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl">
            Guides, client comparisons, and configuration examples.
          </p>
        </header>
        
        {/* Documentation Links */}
        <section className="mt-10 sm:mt-16">
          <h2 className="text-lg sm:text-xl font-semibold text-foreground">
            Documentation
          </h2>
          <div className="mt-4 sm:mt-6 grid gap-3 sm:gap-4 sm:grid-cols-2">
            {DOCUMENTATION_LINKS.map((doc) => (
              <a
                key={doc.path}
                href={`${SITE_CONFIG.github}/blob/main/${doc.path}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-3 sm:gap-4 rounded-xl border border-border p-3 sm:p-4 transition-colors hover:border-primary/20 hover:bg-muted/30"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="flex items-center gap-2 font-medium text-foreground">
                    {doc.title}
                    <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {doc.description}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </section>
        
        {/* Clients - Execution */}
        <section className="mt-10 sm:mt-16">
          <h2 className="text-lg sm:text-xl font-semibold text-foreground">
            Execution Clients
          </h2>
          {/* Desktop table */}
          <div className="mt-4 sm:mt-6 hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-3 font-medium text-muted-foreground">Client</th>
                  <th className="pb-3 font-medium text-muted-foreground">Language</th>
                  <th className="pb-3 font-medium text-muted-foreground">Best For</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {EXECUTION_CLIENTS.map((client) => (
                  <tr key={client.name}>
                    <td className="py-3 font-medium text-foreground">{client.name}</td>
                    <td className="py-3 text-muted-foreground">{client.language}</td>
                    <td className="py-3 text-muted-foreground">{client.bestFor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Mobile cards */}
          <div className="mt-4 space-y-3 sm:hidden">
            {EXECUTION_CLIENTS.map((client) => (
              <div key={client.name} className="rounded-lg border border-border p-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground">{client.name}</span>
                  <span className="text-xs text-muted-foreground font-mono">{client.language}</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{client.bestFor}</p>
              </div>
            ))}
          </div>
        </section>
        
        {/* Clients - Consensus */}
        <section className="mt-8 sm:mt-12">
          <h2 className="text-lg sm:text-xl font-semibold text-foreground">
            Consensus Clients
          </h2>
          {/* Desktop table */}
          <div className="mt-4 sm:mt-6 hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-3 font-medium text-muted-foreground">Client</th>
                  <th className="pb-3 font-medium text-muted-foreground">Language</th>
                  <th className="pb-3 font-medium text-muted-foreground">Best For</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {CONSENSUS_CLIENTS.map((client) => (
                  <tr key={client.name}>
                    <td className="py-3 font-medium text-foreground">{client.name}</td>
                    <td className="py-3 text-muted-foreground">{client.language}</td>
                    <td className="py-3 text-muted-foreground">{client.bestFor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Mobile cards */}
          <div className="mt-4 space-y-3 sm:hidden">
            {CONSENSUS_CLIENTS.map((client) => (
              <div key={client.name} className="rounded-lg border border-border p-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground">{client.name}</span>
                  <span className="text-xs text-muted-foreground font-mono">{client.language}</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{client.bestFor}</p>
              </div>
            ))}
          </div>
        </section>
        
        {/* Configuration */}
        <section className="mt-10 sm:mt-16">
          <h2 className="text-lg sm:text-xl font-semibold text-foreground">
            Configuration Examples
          </h2>
          <div className="mt-4 sm:mt-6 space-y-5 sm:space-y-6">
            {configExamples.map((example) => (
              <div key={example.title}>
                <h3 className="text-sm font-medium text-foreground">{example.title}</h3>
                <div className="mt-2 overflow-x-auto">
                  <CodeBlock code={example.code} language="bash" />
                </div>
              </div>
            ))}
          </div>
        </section>
        
        {/* GitHub CTA */}
        <section className="mt-10 sm:mt-16 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-border p-4 sm:p-6">
          <div>
            <h2 className="font-medium text-foreground">
              Contribute on GitHub
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Found an issue? Contributions are welcome.
            </p>
          </div>
          <Button href={SITE_CONFIG.github} external size="sm" className="shrink-0 self-start sm:self-center">
            View Repository
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </section>
      </div>
    </div>
  )
}
