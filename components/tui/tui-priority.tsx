'use client'

import { motion } from 'motion/react'
import { SectionHeading } from '@/components/brand/reveal'
import { ScrollStage } from '@/components/brand/scroll-stage'
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
  return (
    <ScrollStage id="priority" label="Severity order versus validated-path order" heightSvh={230}>
      {({ progress }) => <PriorityBody mode={progress >= 0.4 ? 'validated' : 'severity'} />}
    </ScrollStage>
  )
}

function PriorityBody({ mode }: { mode: Mode }) {
  const data = sorted(mode)
  const rankOf = (id: string) => data.findIndex((r) => r.id === id) + 1

  return (
    <div>
      <SectionHeading eyebrow="Prioritize" title="Same findings. Different order." />

      <div className="mx-auto mt-8 max-w-4xl">
        <div className="mx-auto mb-3 flex w-fit rounded-xl border border-border bg-card/60 p-1 font-mono text-xs" aria-hidden>
          {(
            [
              ['severity', 'sort: severity'],
              ['validated', 'sort: validated path'],
            ] as const
          ).map(([m, label]) => (
            <span
              key={m}
              className={cn(
                'rounded-lg px-4 py-2 transition-colors duration-500',
                mode === m ? 'bg-primary text-primary-foreground' : 'text-muted-foreground',
              )}
            >
              {label}
            </span>
          ))}
        </div>
        <p className="mx-auto mb-5 min-h-12 max-w-2xl text-balance text-center text-base leading-relaxed text-muted-foreground md:text-lg" aria-live="polite">
          {mode === 'severity'
            ? `Sorted by raw severity, the loudest item wins. The paths an attacker can use sit at #${rankOf('key')} and #${rankOf('oidc')}, below a VM nobody can reach.`
            : 'Sorted by validated path, what an attacker can actually reach comes first. Both exploitable paths are P0 and the unreachable VM drops to P3.'}
        </p>

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
    </div>
  )
}
