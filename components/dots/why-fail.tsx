'use client'

import { motion } from 'motion/react'
import { ArrowRight } from 'lucide-react'
import { Reveal, SectionHeading } from '@/components/brand/reveal'

const bars = [38, 62, 46, 78, 54, 70, 42, 66]

function SnapshotVisual() {
  return (
    <div className="relative flex h-24 items-end gap-1.5" aria-hidden>
      {bars.map((h, i) => (
        <div key={i} className="relative flex-1">
          <div className="absolute bottom-0 w-full rounded-sm border border-dashed border-muted-foreground/40" style={{ height: `${h}%` }} />
          <motion.div
            className="absolute bottom-0 w-full rounded-sm bg-primary/70"
            animate={{ height: [`${h}%`, `${Math.min(100, h + 28 - (i % 3) * 18)}%`, `${h}%`] }}
            transition={{ duration: 3 + i * 0.35, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      ))}
    </div>
  )
}

function ContextVisual() {
  return (
    <div className="relative h-24" aria-hidden>
      <div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 items-center justify-between">
        {Array.from({ length: 11 }).map((_, i) => (
          <motion.span
            key={i}
            className="size-3 rounded-full bg-primary"
            initial={{ opacity: 0.2 }}
            whileInView={{ opacity: i < 4 ? 1 : 0.25 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
          />
        ))}
      </div>
      <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-border" />
      <motion.div
        className="absolute left-0 top-2 h-20 rounded-lg border border-dashed border-primary/70"
        initial={{ width: 0 }}
        whileInView={{ width: '38%' }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.3 }}
      >
        <span className="absolute -top-2 left-2 bg-card px-1 font-mono text-[10px] text-primary">context window</span>
      </motion.div>
    </div>
  )
}

function SignalVisual() {
  return (
    <div className="flex h-24 items-center justify-between gap-2 text-xs" aria-hidden>
      <span className="rounded-lg border border-border bg-secondary px-3 py-2 text-muted-foreground">Suspicious role</span>
      <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
      <motion.span
        className="rounded-lg border border-dashed border-muted-foreground/50 px-3 py-2 font-mono text-muted-foreground"
        animate={{ opacity: [1, 0.3, 1] }}
        transition={{ duration: 2.4, repeat: Infinity }}
      >
        so what?
      </motion.span>
    </div>
  )
}

const reasons = [
  {
    title: 'No persistent attack memory',
    text: 'Each scan or prompt starts from zero. Without persistent intelligence of live environment signals and current adversary tradecraft, multi-step attack chains cannot be built or evolved.',
    Visual: SnapshotVisual,
  },
  {
    title: 'Context windows break on cloud-scale graphs',
    text: 'Frontier models reason within a session. Real cloud attack paths span millions of relationships and require a persistent graph.',
    Visual: ContextVisual,
  },
  {
    title: 'No deterministic proof of exploitability',
    text: 'Frontier models generate answers, not validated outcomes. They cannot prove attack paths, leaving assumptions instead of evidence.',
    Visual: SignalVisual,
  },
]

export function WhyFail() {
  return (
    <section className="px-6 py-24 md:py-32">
      <SectionHeading eyebrow="Why existing tools fall short" title="Security teams see the noise. Attackers see the paths.">
        Detection tools guess at risk. As AI compresses time to exploit, probability is no longer enough.
      </SectionHeading>
      <ul className="mx-auto mt-14 grid max-w-6xl gap-4 lg:grid-cols-3">
        {reasons.map(({ title, text, Visual }, i) => (
          <li key={title}>
            <Reveal delay={i * 0.1} className="flex h-full flex-col gap-6 rounded-2xl border border-border bg-card/70 p-6">
              <Visual />
              <div>
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
              </div>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  )
}
