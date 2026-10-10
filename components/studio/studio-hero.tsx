'use client'

import { motion } from 'motion/react'
import { AgentsVideo } from '@/components/brand/agents-video'
import { DemoButton, SandboxButton } from '@/components/brand/cta-buttons'
import { ChainConsole } from './chain-console'

export function StudioHero() {
  return (
    <section className="relative isolate overflow-hidden px-6 pb-20 pt-32 md:pt-40">
      <div
        className="absolute inset-x-0 top-0 -z-20 h-[760px] bg-cover bg-top opacity-80"
        style={{ backgroundImage: 'url(/brand/hero-bg.png)' }}
        aria-hidden
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-background/40 to-background" aria-hidden />

      <div className="mx-auto max-w-4xl text-center">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 font-mono text-xs uppercase tracking-[0.2em] text-primary"
        >
          Attack paths, validated
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-balance text-5xl font-semibold leading-[1.04] tracking-tight md:text-7xl"
        >
          Findings are noise.
          <span className="text-gradient block">Chains are breaches.</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25 }}
          className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-foreground/80"
        >
          Attackers hop from identity to trust to secret to data. OFFENSAI does the same, safely, and shows you every
          hop that works. Pick a scenario below and watch it run.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <DemoButton />
          <SandboxButton />
        </motion.div>
      </div>

      <div className="relative mx-auto mt-6 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="relative z-10 mx-auto -mb-2 w-full max-w-xs sm:-mb-10 sm:max-w-sm md:-mb-14 md:max-w-md"
        >
          <AgentsVideo className="w-full scale-125" />
        </motion.div>
        <ChainConsole />
      </div>
    </section>
  )
}
