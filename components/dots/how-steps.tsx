'use client'

import { motion } from 'motion/react'
import { Reveal, SectionHeading } from '@/components/brand/reveal'

const steps = [
  {
    name: 'Model',
    icon: 'cloud-attack-model-stage-icon.png',
    line: 'Map every identity, permission and trust relationship as one attacker-eye graph.',
  },
  {
    name: 'Generate',
    icon: 'generate-cloud-attack-chains-icon.png',
    line: 'Invent multi-step chains across APIs and services. Not a rule library. Not a replayed script.',
  },
  {
    name: 'Validate',
    icon: 'validate-cloud-exploitability-icon.png',
    line: 'Run them in a controlled way, read-only, on your approval. Keep the evidence.',
  },
  {
    name: 'Prioritize',
    icon: 'prioritize-validated-attack-paths-icon.png',
    line: 'Rank only the paths that worked by impact, with remediation guidance attached.',
  },
]

export function HowSteps() {
  return (
    <section id="how" className="relative px-6 py-24 md:py-32">
      <SectionHeading eyebrow="How it works" title="Four moves from the whole graph to one proven path." />
      <div className="relative mx-auto mt-16 max-w-6xl">
        <motion.div
          className="absolute left-0 right-0 top-[52px] hidden h-px origin-left bg-gradient-to-r from-primary/0 via-primary to-primary/0 lg:block"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 1.6, ease: 'easeInOut' }}
          aria-hidden
        />
        <ol className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <li key={s.name}>
              <Reveal delay={0.2 + i * 0.25} className="flex flex-col items-start gap-5 lg:items-center lg:text-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/brand/${s.icon}`} alt="" className="relative size-[104px] drop-shadow-[0_0_24px_rgb(76_147_255/0.35)]" />
                <div>
                  <h3 className="text-xl font-semibold">{s.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.line}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
