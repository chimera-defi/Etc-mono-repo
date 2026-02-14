'use client'

import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { CodeBlock } from '@/components/ui/CodeBlock'
import { INSTALL_COMMAND, SITE_CONFIG } from '@/lib/constants'
import { ArrowRight } from 'lucide-react'

export function CallToAction() {
  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Card className="relative overflow-hidden border-border/60 bg-muted/40 p-5 sm:p-8 md:p-10">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
          <div className="relative grid gap-6 sm:gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <Badge variant="primary">Ready to ship</Badge>
              <motion.h2
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.5 }}
                className="mt-4 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl md:text-4xl"
              >
                Launch your Ethereum node today
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="mt-3 sm:mt-4 text-base sm:text-lg text-muted-foreground"
              >
                Start with the one-line installer, then follow the guided wizard to pick
                clients, MEV, and monitoring.
              </motion.p>
              <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 sm:gap-4">
                <Button href="/quickstart" size="lg" className="justify-center">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="ghost" href={SITE_CONFIG.github} external size="lg" className="justify-center">
                  View Source
                </Button>
              </div>
            </div>

            <div>
              <div className="mb-3 text-xs font-mono uppercase tracking-wide text-muted-foreground">
                Install command
              </div>
              <div className="overflow-x-auto">
                <CodeBlock code={INSTALL_COMMAND} language="bash" />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  )
}
