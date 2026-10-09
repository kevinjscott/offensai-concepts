'use client'

import { motion } from 'motion/react'
import { AgentsVideo } from '@/components/brand/agents-video'
import { DemoButton, SandboxButton } from '@/components/brand/cta-buttons'
import { TermLines } from '@/components/term/term-lines'
import { TerminalWindow } from '@/components/term/terminal-window'
import type { TermLine } from '@/lib/terminal'

const lines: TermLine[] = [
  { k: 'cmd', t: 'findings export --all' },
  { k: 'warn', t: '2,847 rows written. good luck.' },
  { k: 'cmd', t: 'show me the chain' },
  { k: 'ok', t: 'attacker -> gitlab ci -> federated trust' },
  { k: 'ok', t: '         -> service principal -> key vault' },
  { k: 'ok', t: '         -> production tenant' },
  { k: 'err', t: 'EXPLOITABLE. 5 hops. evidence attached.' },
]

export function TuiHero() {
  return (
    <section className="relative isolate overflow-hidden px-6 pb-16 pt-32 md:pt-40">
      <div
        className="absolute inset-x-0 top-0 -z-20 h-[720px] scale-x-[-1] bg-cover bg-top opacity-60"
        style={{ backgroundImage: 'url(/brand/hero-bg.png)' }}
        aria-hidden
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-background/60 to-background" aria-hidden />

      <div className="mx-auto max-w-4xl text-center">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 font-mono text-xs uppercase tracking-[0.2em] text-primary"
        >
          Built for operators
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-balance text-5xl font-semibold leading-[1.04] tracking-tight md:text-7xl"
        >
          Show me <span className="text-gradient">the chain.</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25 }}
          className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-foreground/80"
        >
          Skip the export. Pick a path, approve a read-only validation, and read the evidence hop by hop.
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

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.5 }}
        className="relative mx-auto mt-10 max-w-3xl"
      >
        <AgentsVideo className="relative z-10 -mb-5 mx-auto w-56 sm:w-72" />
        <TerminalWindow title="~/cloud" bodyClassName="min-h-52">
          <TermLines lines={lines} />
        </TerminalWindow>
      </motion.div>
    </section>
  )
}
