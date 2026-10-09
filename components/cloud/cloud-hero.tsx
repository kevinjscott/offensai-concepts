'use client'

import { motion } from 'motion/react'
import { DemoButton, SandboxButton } from '@/components/brand/cta-buttons'
import { TimelineLanes } from './timeline-lanes'

export function CloudHero() {
  return (
    <section className="relative isolate overflow-hidden px-6 pb-20 pt-32 md:pt-44">
      <div
        className="absolute inset-x-0 top-0 -z-20 h-[720px] scale-x-[-1] bg-cover bg-top opacity-70"
        style={{ backgroundImage: 'url(/brand/hero-bg.png)' }}
        aria-hidden
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-background/50 to-background" aria-hidden />

      <div className="mx-auto max-w-5xl">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 font-mono text-xs uppercase tracking-[0.2em] text-primary"
        >
          Continuous cloud security validation
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="max-w-4xl text-balance text-5xl font-semibold leading-[1.04] tracking-tight md:text-7xl"
        >
          You are defending a cloud
          <span className="text-gradient block">that no longer exists.</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25 }}
          className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-foreground/80"
        >
          Pipelines merge. Roles get created. Trust rules loosen. Every change can open a new attack path, and a
          snapshot cannot see it. OFFENSAI keeps chaining and proving as your cloud moves.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-8 flex flex-wrap items-center gap-3"
        >
          <DemoButton />
          <SandboxButton />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.55 }}
        className="mt-14"
      >
        <TimelineLanes />
      </motion.div>
    </section>
  )
}
