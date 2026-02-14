'use client'

import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { CodeBlock } from '@/components/ui/CodeBlock'
import { Terminal } from '@/components/ui/Terminal'
import { INSTALL_COMMAND, SITE_CONFIG, STATS } from '@/lib/constants'
import { ArrowRight, CheckCircle2 } from 'lucide-react'

const terminalCode = `$ ${INSTALL_COMMAND}

[✓] System requirements verified
[✓] Firewall configured
[✓] Dependencies installed
[✓] Ready for client selection

Run './run_2.sh' to continue setup.`

export function Hero() {
  return (
    <section className="relative min-h-[80vh] flex items-center overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-radial from-primary/[0.03] via-transparent to-transparent" />
      <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-gradient-to-l from-primary/10 via-transparent to-transparent lg:block" />
      
      {/* Content */}
      <div className="relative w-full mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-16 md:py-20 lg:py-28">
        <div className="grid gap-8 sm:gap-10 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Left column - Content */}
          <div className="max-w-xl space-y-5 sm:space-y-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="flex flex-wrap items-center gap-2 sm:gap-3"
            >
              <Badge variant="primary">Zero-downtime onboarding</Badge>
              <span className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
                Ethereum infrastructure
              </span>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-2 font-mono text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl"
            >
              <span className="text-foreground">Node Setup</span>
              <br />
              <span className="text-gradient">In Minutes</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg text-muted-foreground leading-relaxed"
            >
              Transform a fresh server into a fully-configured Ethereum node. 
              One command handles security hardening, client installs, MEV, and monitoring.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="grid gap-2.5 sm:gap-3 text-sm text-muted-foreground"
            >
              {[
                'Two-phase hardened workflow with guided wizard',
                'Execution + consensus clients from all major teams',
                'MEV-Boost, monitoring, and service management included',
              ].map((item) => (
                <div key={item} className="flex items-start sm:items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-primary mt-0.5 sm:mt-0" />
                  <span>{item}</span>
                </div>
              ))}
            </motion.div>
            
            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 sm:gap-4"
            >
              <Button href="/quickstart" size="lg" className="justify-center">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="secondary" href="#install" size="lg" className="justify-center">
                One-line Install
              </Button>
              <Button
                variant="ghost"
                href={SITE_CONFIG.github}
                external
                size="lg"
                className="justify-center"
              >
                View Source
              </Button>
            </motion.div>
            
            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="grid grid-cols-2 gap-3 sm:gap-4"
            >
              {STATS.map((stat) => (
                <Card key={stat.label} padding="sm" className="bg-muted/30">
                  <div className="font-mono text-xl sm:text-2xl font-semibold text-foreground">
                    {stat.value}
                  </div>
                  <div className="mt-1 text-xs sm:text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </Card>
              ))}
            </motion.div>

            {/* Mobile/Tablet terminal preview */}
            <div className="lg:hidden">
              <Card className="border-border/60 bg-muted/40">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-mono uppercase tracking-wide">Installer preview</span>
                  <span>Phase 1</span>
                </div>
                <div className="mt-3 overflow-x-auto">
                  <CodeBlock code={INSTALL_COMMAND} language="bash" />
                </div>
              </Card>
            </div>
          </div>
          
          {/* Right column - Terminal (desktop only) */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="hidden lg:block"
          >
            <div className="rounded-2xl border border-border/60 bg-muted/40 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
              <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-mono uppercase tracking-wide">Installer preview</span>
                <span>Phase 1</span>
              </div>
              <Terminal 
                code={terminalCode} 
                language="bash"
                title="terminal"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
