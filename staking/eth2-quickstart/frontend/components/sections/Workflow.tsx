'use client'

import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { WORKFLOW_STEPS } from '@/lib/constants'

export function Workflow() {
  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-8 sm:gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12 lg:items-start">
          <div>
            <Badge>Workflow</Badge>
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.5 }}
              className="mt-4 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl md:text-4xl"
            >
              From bare metal to synced node
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-3 sm:mt-4 text-base sm:text-lg text-muted-foreground"
            >
              A streamlined workflow built for production reliability, with guardrails at
              every step.
            </motion.p>
            <p className="mt-3 text-sm text-muted-foreground">
              Each phase is reversible and logged, so you can validate changes before proceeding.
            </p>
          </div>

          <div className="relative space-y-3 sm:space-y-4">
            <div className="absolute left-5 top-4 hidden h-[calc(100%-2rem)] w-px bg-border/60 sm:block" />
            {WORKFLOW_STEPS.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card className="bg-muted/40">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full border border-border bg-background font-mono text-xs sm:text-sm text-muted-foreground">
                      0{index + 1}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-medium text-foreground">{step.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
                      <p className="mt-2 text-xs text-muted-foreground">{step.detail}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
