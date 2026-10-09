'use client'

import { motion } from 'motion/react'
import { AgentsVideo } from '@/components/brand/agents-video'
import { DemoButton, SandboxButton } from '@/components/brand/cta-buttons'
import { DotField } from './dot-field'

export function DotsHero() {
  return (
    <section className="relative isolate overflow-hidden px-6 pb-16 pt-32 md:pb-24 md:pt-44">
      <div
        className="absolute inset-0 -z-20 bg-cover bg-top opacity-90"
        style={{ backgroundImage: 'url(/brand/hero-bg.png)' }}
        aria-hidden
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-transparent to-background" aria-hidden />
      <DotField count={70} className="-z-10 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />

      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 font-mono text-xs uppercase tracking-[0.2em] text-primary"
          >
            Cloud exploit validation
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-balance text-5xl font-semibold leading-[1.04] tracking-tight md:text-6xl"
          >
            Findings are dots.
            <span className="text-gradient block">Attackers draw the line.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-foreground/80"
          >
            OFFENSAI watches your live cloud, chains the dots into real attack paths, and proves which ones actually
            work. Proof, not alerts.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-9 flex flex-wrap items-center gap-3"
          >
            <DemoButton />
            <SandboxButton />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="relative mx-auto w-full max-w-md lg:max-w-none"
        >
          <AgentsVideo className="relative z-10 w-full origin-center scale-125 lg:scale-[1.45]" />
        </motion.div>
      </div>
    </section>
  )
}
