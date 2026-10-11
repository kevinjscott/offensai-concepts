'use client'

import { motion } from 'motion/react'
import { SectionHeading } from '@/components/brand/reveal'
import { ScrollStage } from '@/components/brand/scroll-stage'
import { TermRow } from '@/components/term/term-lines'
import { TerminalWindow } from '@/components/term/terminal-window'
import { externalChain } from '@/lib/chains'
import type { TermLine } from '@/lib/terminal'
import { cn } from '@/lib/utils'

const hops = externalChain.hops

const steps: { title: string; text: string; lines: TermLine[] }[] = [
  {
    title: 'Start from the outside',
    text: 'Begin with a domain, account ID, or bucket and run reconnaissance using only public signals, no credentials required.',
    lines: [
      { k: 'dim', t: 'start: a domain, account ID, or bucket' },
      { k: 'ok', t: 'public signals only. no credentials required.' },
    ],
  },
  {
    title: 'Expand the attack surface',
    text: 'Use OSINT to uncover subdomains, cloud resources, and leaked infrastructure references attackers can discover.',
    lines: [
      { k: 'cmd', t: 'OSINT: domains, code repositories, public records' },
      { k: 'ok', t: hops[0].evidence },
    ],
  },
  {
    title: 'Enumerate and classify exposure',
    text: 'Identify public cloud assets across accounts and assess their real-world risk and attacker value.',
    lines: [
      { k: 'cmd', t: 'enumerate public cloud resources' },
      { k: 'ok', t: hops[1].evidence },
      { k: 'warn', t: 'classified: exposed bucket, high attacker value' },
    ],
  },
  {
    title: 'Validate real attack paths',
    text: 'Chain findings into realistic attacks and run controlled validation to prove which exposures lead to impact.',
    lines: [
      { k: 'cmd', t: 'Agent O: validate chain (approved, read-only)' },
      ...hops.slice(2).map((h, i): TermLine => ({ k: 'ok', t: `hop ${i + 3}  ${h.evidence}` })),
      { k: 'err', t: `EXPLOITABLE  ${externalChain.impact}` },
    ],
  },
]

const starts = ['Domain', 'Account ID', 'Bucket']

export function ExternalSteps() {
  return (
    <ScrollStage id="external" label="From external recon to proven exposure" heightSvh={340}>
      {({ progress, jumpTo }) => (
        <ExternalBody active={Math.min(steps.length - 1, Math.floor(progress * steps.length))} onPick={(i) => jumpTo((i + 0.5) / steps.length)} />
      )}
    </ScrollStage>
  )
}

function ExternalBody({ active, onPick }: { active: number; onPick: (i: number) => void }) {
  const step = steps[active]

  return (
    <div>
      <SectionHeading eyebrow="External attack validation" title="From external recon to proven exposure" />

      <div className="mx-auto mt-10 grid max-w-6xl gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
            <span className="font-mono uppercase tracking-widest text-muted-foreground">Start with</span>
            {starts.map((s) => (
              <span key={s} className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 font-semibold text-primary">
                {s}
              </span>
            ))}
          </div>
          <div role="tablist" aria-label="External validation steps" className="flex flex-col gap-2">
            {steps.map((s, i) => (
              <button
                key={s.title}
                role="tab"
                aria-selected={i === active}
                onClick={() => onPick(i)}
                className={cn(
                  'rounded-2xl border p-4 text-left transition-colors',
                  i === active ? 'border-primary/60 bg-accent' : 'border-border bg-card/50 hover:border-primary/30',
                )}
              >
                <span className="flex items-baseline gap-3">
                  <span className="font-mono text-xs text-primary">{i + 1}</span>
                  <span className="text-base font-semibold">{s.title}</span>
                </span>
                {i === active && (
                  <motion.span
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 block pl-6 text-sm leading-relaxed text-muted-foreground"
                  >
                    {s.text}
                  </motion.span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="min-w-0">
          <TerminalWindow title="ATTACKSTUDIO / external validation" bodyClassName="min-h-72">
            <div className="flex flex-col gap-1.5" aria-live="polite">
              {step.lines.map((l, i) => (
                <motion.div key={`${active}-${i}`} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.12 }}>
                  <TermRow line={l} />
                </motion.div>
              ))}
            </div>
          </TerminalWindow>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Illustrative example. Validations only run on your approval, with read-only access and no host agents.
          </p>
        </div>
      </div>
    </div>
  )
}
