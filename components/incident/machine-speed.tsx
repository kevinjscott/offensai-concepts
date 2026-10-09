'use client'

import { motion } from 'motion/react'
import { Reveal, SectionHeading } from '@/components/brand/reveal'

// 90 days in hours, versus roughly 13 hours reported for the incident.
const QUARTER_HOURS = 90 * 24
const INCIDENT_HOURS = 13

export function MachineSpeed() {
  return (
    <section className="px-6 py-20 md:py-28">
      <SectionHeading eyebrow="Why now" title="Chaining is getting cheap">
        Attackers no longer need patience or a large team to try thousands of routes. Defenders need to see the same
        routes first.
      </SectionHeading>

      <div className="mx-auto mt-14 max-w-5xl">
        <Reveal className="rounded-3xl border border-border bg-card/60 p-6 md:p-8">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">Same scale, two clocks</p>
          <div className="mt-6 flex flex-col gap-5">
            <div>
              <div className="mb-2 flex items-baseline justify-between gap-4 text-sm">
                <span className="text-foreground">Gap between two quarterly tests</span>
                <span className="font-mono text-muted-foreground">~{QUARTER_HOURS.toLocaleString()} h</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-secondary">
                <motion.div
                  className="h-full rounded-full bg-muted-foreground/60"
                  initial={{ width: 0 }}
                  whileInView={{ width: '100%' }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.4, ease: 'easeOut' }}
                />
              </div>
            </div>
            <div>
              <div className="mb-2 flex items-baseline justify-between gap-4 text-sm">
                <span className="text-foreground">Sandbox to cluster-admin, as reported</span>
                <span className="font-mono text-ember">~{INCIDENT_HOURS} h</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-secondary">
                <motion.div
                  className="h-full rounded-full bg-ember"
                  initial={{ width: 0 }}
                  whileInView={{ width: `${(INCIDENT_HOURS / QUARTER_HOURS) * 100}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.4, delay: 0.3, ease: 'easeOut' }}
                />
              </div>
            </div>
          </div>
          <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
            The red sliver is the whole intrusion. A review cycle measured in quarters cannot be the thing that keeps
            up with it.
          </p>
        </Reveal>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <Reveal className="rounded-2xl border border-border bg-card/60 p-6">
            <p className="font-mono text-xs text-primary">Hugging Face, July 2026</p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
              The team detected the activity with AI-assisted telemetry and rebuilt the timeline with an open-weights
              model. Credit where it is due: the response was as modern as the attack. The lesson is about the path, not
              the people.
            </p>
          </Reveal>
          <Reveal delay={0.08} className="rounded-2xl border border-border bg-card/60 p-6">
            <p className="font-mono text-xs text-primary">Frontier models, June 2026</p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
              Researchers showed that Anthropic&apos;s newest models could be steered into finding and exploiting
              software flaws. U.S. export controls followed, and access was suspended worldwide for 18 days. Whatever
              you think of that call, the premise is now public: finding and chaining weaknesses is becoming a commodity.
            </p>
          </Reveal>
        </div>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Summarised from public reporting. Check primary sources before quoting figures or dates.
        </p>
      </div>
    </section>
  )
}
