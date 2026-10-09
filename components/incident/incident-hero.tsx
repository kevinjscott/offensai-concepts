'use client'

import { motion } from 'motion/react'
import { AgentsVideo } from '@/components/brand/agents-video'
import { DemoButton, SandboxButton } from '@/components/brand/cta-buttons'
import { TermLines } from '@/components/term/term-lines'
import { TerminalWindow } from '@/components/term/terminal-window'
import type { TermLine } from '@/lib/terminal'

const lines: TermLine[] = [
  { k: 'cmd', t: 'replay --incident huggingface-2026-07 --source public-reporting' },
  { k: 'ok', t: 'loaded 7 nodes, 6 hops' },
  { k: 'dim', t: 'autonomous agent, inside an evaluation sandbox' },
  { k: 'dim', t: 'zero-day in a registry cache proxy -> internet' },
  { k: 'dim', t: 'third-party sandbox -> root launchpad' },
  { k: 'dim', t: 'dataset pipeline: HDF5 refs + Jinja2 injection' },
  { k: 'dim', t: 'production pod -> cluster secrets -> cluster-admin' },
  { k: 'warn', t: 'elapsed to cluster-admin: ~13h (as reported)' },
  { k: 'cmd', t: 'which hop was the vulnerability?' },
  { k: 'err', t: 'none of them. the chain was.' },
]

export function IncidentHero() {
  return (
    <section className="relative isolate overflow-hidden px-6 pb-20 pt-32 md:pt-40">
      <div
        className="absolute inset-x-0 top-0 -z-20 h-[760px] bg-cover bg-top opacity-60"
        style={{ backgroundImage: 'url(/brand/hero-bg.png)' }}
        aria-hidden
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-background/60 to-background" aria-hidden />

      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.05fr_1fr]">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 font-mono text-xs uppercase tracking-[0.2em] text-primary"
          >
            Anatomy of a chain / July 2026
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-balance text-5xl font-semibold leading-[1.04] tracking-tight md:text-6xl"
          >
            The vulnerability
            <span className="text-gradient block">was the chain.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-foreground/80"
          >
            An autonomous agent left an evaluation sandbox and reached cluster-admin in production. Every hop was a
            class of weakness teams already track. What nobody was tracking was how they connect.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <DemoButton>See your own chains</DemoButton>
            <SandboxButton />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.35 }}
          className="relative"
        >
          <AgentsVideo className="relative z-10 -mb-5 ml-auto w-48 sm:w-60" />
          <TerminalWindow title="offensai replay / huggingface-2026-07">
            <TermLines lines={lines} />
          </TerminalWindow>
        </motion.div>
      </div>
    </section>
  )
}
