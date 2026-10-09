'use client'

import { AnimatePresence, motion } from 'motion/react'
import { Check } from 'lucide-react'
import { useState } from 'react'
import { SectionHeading } from '@/components/brand/reveal'
import { cn } from '@/lib/utils'

const stages = [
  {
    name: 'Model',
    icon: 'cloud-attack-model-stage-icon.png',
    headline: 'One persistent graph, one attack language.',
    bullets: [
      'Identities, permissions and trust relationships across every cloud, not one provider.',
      'Anonymized before analysis, so understanding your cloud never means exposing it.',
      'Stays current as your cloud changes.',
    ],
    gives: 'A living attacker-eye map',
  },
  {
    name: 'Generate',
    icon: 'generate-cloud-attack-chains-icon.png',
    headline: 'Chains no playbook has.',
    bullets: [
      'New path variations across APIs, identities and service relationships.',
      'Beyond static rules and replayed scripts.',
      'Compose your own in ATTACKSTUDIO.',
    ],
    gives: 'Multi-step chains to test',
  },
  {
    name: 'Validate',
    icon: 'validate-cloud-exploitability-icon.png',
    headline: 'Run it, with your approval.',
    bullets: [
      'Human-initiated. Nothing runs until you say so.',
      'Read-only native cloud APIs. No host agents to deploy.',
      'A configurable evasion engine stress-tests your detections.',
    ],
    gives: 'Execution evidence per hop',
  },
  {
    name: 'Prioritize',
    icon: 'prioritize-validated-attack-paths-icon.png',
    headline: 'Fix what an attacker could actually use.',
    bullets: [
      'Only validated paths make the list, ranked by impact.',
      'Mapped to MITRE ATT&CK and structured for audit.',
      'Clear remediation guidance, not just detection output.',
    ],
    gives: 'A short list that is real',
  },
]

export function StageTabs() {
  const [active, setActive] = useState(0)
  const s = stages[active]

  return (
    <section id="how" className="px-6 py-24 md:py-32">
      <SectionHeading eyebrow="How it works" title="Model. Generate. Validate. Prioritize." />
      <div className="mx-auto mt-14 grid max-w-6xl gap-6 lg:grid-cols-[320px_1fr]">
        <div role="tablist" aria-label="Stages" className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
          {stages.map((st, i) => (
            <button
              key={st.name}
              role="tab"
              aria-selected={i === active}
              onClick={() => setActive(i)}
              className={cn(
                'relative flex shrink-0 items-center gap-4 rounded-2xl border px-4 py-3 text-left transition-colors lg:py-4',
                i === active ? 'border-primary/60 bg-accent' : 'border-border bg-card/50 hover:border-primary/30',
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/brand/${st.icon}`} alt="" className="size-10" />
              <span>
                <span className="block font-mono text-[11px] text-muted-foreground">Stage {i + 1}</span>
                <span className="block text-base font-semibold">{st.name}</span>
              </span>
              {i === active && (
                <motion.span layoutId="stage-pill" className="absolute inset-y-3 left-0 w-0.5 rounded-full bg-primary" />
              )}
            </button>
          ))}
        </div>

        <div className="relative min-h-[360px] overflow-hidden rounded-3xl border border-border bg-card/60 p-6 md:p-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={s.name}
              role="tabpanel"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-6 md:flex-row md:items-center"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/brand/${s.icon}`} alt="" className="size-32 shrink-0 drop-shadow-[0_0_32px_rgb(76_147_255/0.4)] md:size-44" />
              <div>
                <h3 className="text-balance text-2xl font-semibold md:text-3xl">{s.headline}</h3>
                <ul className="mt-5 flex flex-col gap-3">
                  {s.bullets.map((b) => (
                    <li key={b} className="flex gap-3 text-sm leading-relaxed text-muted-foreground md:text-base">
                      <Check className="mt-1 size-4 shrink-0 text-primary" aria-hidden />
                      {b}
                    </li>
                  ))}
                </ul>
                <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
                  You get: {s.gives}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
