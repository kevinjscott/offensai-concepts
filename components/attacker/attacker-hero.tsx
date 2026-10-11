'use client'

import { ArrowDown } from 'lucide-react'
import { motion } from 'motion/react'
import { AgentsVideo } from '@/components/brand/agents-video'
import { SandboxButton } from '@/components/brand/cta-buttons'

export function AttackerHero() {
  return (
    <section className="relative isolate overflow-hidden px-6 pb-16 pt-32 md:pt-40">
      <div
        className="absolute inset-x-0 top-0 -z-20 h-[720px] bg-cover bg-top opacity-60"
        style={{ backgroundImage: 'url(/brand/hero-bg.png)' }}
        aria-hidden
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-background/60 to-background" aria-hidden />

      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 font-mono text-xs uppercase tracking-[0.2em] text-primary"
          >
            Think like the path
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-balance text-5xl font-semibold leading-[1.04] tracking-tight md:text-6xl"
          >
            You have a domain name.
            <span className="text-gradient block">Can you reach the data?</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-foreground/80"
          >
            Start from the outside with no credentials, using only public signals. Cloud attacks unfold as multi-step
            chains across identities, services and trust, so walk one yourself in a simulated company.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <a
              href="#play"
              className="group inline-flex items-center gap-3 rounded-xl border border-primary/40 bg-gradient-to-b from-[#0d1730] to-[#050a18] py-2 pl-5 pr-2 text-sm font-semibold text-foreground transition-colors hover:border-primary"
            >
              Start the simulation
              <span className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <ArrowDown className="size-4" aria-hidden />
              </span>
            </a>
            <SandboxButton />
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.3 }}
        >
          <AgentsVideo className="mx-auto w-full max-w-md origin-center scale-110" />
        </motion.div>
      </div>
    </section>
  )
}
