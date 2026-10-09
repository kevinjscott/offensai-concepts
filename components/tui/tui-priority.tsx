'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { SectionHeading } from '@/components/brand/reveal'
import { cn } from '@/lib/utils'

type Mode = 'severity' | 'validated'

interface Row {
  id: string
  path: string
  findings: number
  worst: 'Critical' | 'High' | 'Medium' | 'Low'
  worstRank: number
  status: string
  statusRank: number
  priority: 'P0' | 'P1' | 'P3'
}

const rows: Row[] = [
  { id: 'vm', path: 'Unpatched VM, private subnet', findings: 14, worst: 'Critical', worstRank: 4, status: 'Not reachable', statusRank: 3, priority: 'P3' },
  { id: 'bucket', path: 'Public log bucket', findings: 1, worst: 'High', worstRank: 3, status: 'No sensitive path', statusRank: 2, priority: 'P3' },
  { id: 'key', path: 'Leaked key to data lake', findings: 2, worst: 'High', worstRank: 3, status: 'Exploitable', statusRank: 0, priority: 'P0' },
  { id: 'oidc', path: 'GitLab OIDC to Azure prod', findings: 3, worst: 'Medium', worstRank: 2, status: 'Exploitable', statusRank: 0, priority: 'P0' },
  { id: 'role', path: 'Overbroad deploy role', findings: 2, worst: 'Low', worstRank: 1, status: 'Exploitable, limited', statusRank: 1, priority: 'P1' },
]

function sorted(mode: Mode) {
  return [...rows].sort((a, b) =>
    mode === 'severity'
      ? b.worstRank - a.worstRank || b.findings - a.findings
      : a.statusRank - b.statusRank || b.worstRank - a.worstRank,
  )
}

const badge: Record<Row['priority'], string> = {
  P0: 'bg-ember text-background',
  P1: 'bg-violet text-background',
  P3: 'bg-border text-muted-foreground',
}

export function TuiPriority() {
  const [mode, setMode] = useState<Mode>('severity')
  const data = sorted(mode)

  return (
    <section id="priority" className="px-6 py-20 md:py-28">
      <SectionHeading eyebrow="Prioritize" title="Same findings. Different order.">
        Sort by raw severity and the loudest item wins. Sort by validated path and the thing an attacker can actually
        reach comes first.
      </SectionHeading>

      <div className="mx-auto mt-12 max-w-4xl">
        <div role="group" aria-label="Sort order" className="mx-auto mb-5 flex w-fit rounded-xl border border-border bg-card/60 p-1 font-mono text-xs">
          {(
            [
              ['severity', 'sort: severity'],
              ['validated', 'sort: validated path'],
            ] as const
          ).map(([m, label]) => (
            <button
              key={m}
              aria-pressed={mode === m}
              onClick={() => setMode(m)}
              className={cn(
                'rounded-lg px-4 py-2 transition-colors',
                mode === m ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="overflow-hidden rounded-2xl border border-primary/25 bg-ink/90 font-mono text-xs md:text-[13px]">
          <div className="grid grid-cols-[1fr_auto_auto] gap-4 border-b border-border bg-secondary/60 px-4 py-2.5 text-[11px] uppercase tracking-widest text-muted-foreground md:grid-cols-[1fr_90px_110px_170px_70px]">
            <span>Path</span>
            <span className="hidden text-right md:block">Findings</span>
            <span className="hidden md:block">Worst</span>
            <span>Validated</span>
            <span className="text-right">Rank</span>
          </div>
          <ul>
            {data.map((r, i) => (
              <motion.li
                key={r.id}
                layout
                transition={{ type: 'spring', stiffness: 380, damping: 36 }}
                className="grid grid-cols-[1fr_auto_auto] items-center gap-4 border-b border-border/60 px-4 py-3 last:border-b-0 md:grid-cols-[1fr_90px_110px_170px_70px]"
              >
                <span className="min-w-0 truncate text-foreground">{r.path}</span>
                <span className="hidden text-right text-muted-foreground md:block">{r.findings}</span>
                <span className={cn('hidden md:block', r.worstRank >= 3 ? 'text-ember' : 'text-muted-foreground')}>{r.worst}</span>
                <span className={cn(r.statusRank <= 1 ? 'text-primary' : 'text-muted-foreground')}>{r.status}</span>
                <span className="text-right">
                  {mode === 'validated' ? (
                    <span className={cn('rounded px-2 py-0.5 text-[11px] font-semibold', badge[r.priority])}>{r.priority}</span>
                  ) : (
                    <span className="text-muted-foreground">#{i + 1}</span>
                  )}
                </span>
              </motion.li>
            ))}
          </ul>
        </div>
        <p className="mt-3 text-center text-xs text-muted-foreground">Illustrative data.</p>
      </div>
    </section>
  )
}
