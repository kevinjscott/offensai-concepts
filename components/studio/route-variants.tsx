'use client'

import { motion } from 'motion/react'
import { SectionHeading } from '@/components/brand/reveal'
import { ScrollStage } from '@/components/brand/scroll-stage'
import { cn } from '@/lib/utils'

type Pt = [number, number]

const entry: Pt = [60, 170]
const goal: Pt = [940, 170]

const routes = [
  {
    id: 'known',
    name: 'The known playbook',
    text: 'A CI token is exchanged through a loose trust rule. Every rule library has this one.',
    pts: [entry, [330, 90], [640, 90], goal] as Pt[],
    generative: false,
  },
  {
    id: 'function',
    name: 'Through a function role',
    text: 'A forgotten function is handed a stronger role, which unlocks a secret store.',
    pts: [entry, [250, 170], [480, 170], [700, 250], goal] as Pt[],
    generative: true,
  },
  {
    id: 'cloud',
    name: 'Across to another cloud',
    text: 'A federated credential in one cloud becomes a foothold in the next. No single tool sees it.',
    pts: [entry, [300, 280], [620, 290], goal] as Pt[],
    generative: true,
  },
]

function toPath(pts: Pt[]) {
  return pts
    .map((p, i) => {
      if (i === 0) return `M ${p[0]} ${p[1]}`
      const prev = pts[i - 1]
      const mx = (prev[0] + p[0]) / 2
      return `C ${mx} ${prev[1]}, ${mx} ${p[1]}, ${p[0]} ${p[1]}`
    })
    .join(' ')
}

export function RouteVariants() {
  return (
    <ScrollStage id="generate" label="Replayed scripts versus a generative engine" heightSvh={260}>
      {({ progress }) => <Body generative={progress >= 0.32} />}
    </ScrollStage>
  )
}

function Body({ generative }: { generative: boolean }) {
  return (
    <div>
      <SectionHeading eyebrow="Generate" title="Same start. Same goal. Different chains." />

      <div className="mx-auto mt-6 flex w-fit gap-1 rounded-xl border border-border bg-secondary p-1" aria-hidden>
        {[false, true].map((g) => (
          <span
            key={String(g)}
            className={cn(
              'rounded-lg px-4 py-2 text-sm font-semibold transition-colors duration-500',
              generative === g ? 'bg-primary text-primary-foreground' : 'text-muted-foreground',
            )}
          >
            {g ? 'Generative engine' : 'Replayed script'}
          </span>
        ))}
      </div>
      <p className="mx-auto mt-4 min-h-12 max-w-2xl text-balance text-center text-base leading-relaxed text-muted-foreground md:text-lg" aria-live="polite">
        {generative
          ? 'A generative engine invents new routes across APIs, identities and service relationships.'
          : 'A replayed script follows what someone already wrote down: one route, and every rule library has it.'}
      </p>

      <div className="mx-auto mt-4 max-w-4xl rounded-3xl border border-border bg-card/50 p-4 md:p-6">
        <svg viewBox="0 0 1000 340" className="w-full overflow-visible" fill="none" role="img" aria-label="Routes from an entry point to a crown jewel">
          {routes.map((r) => {
            const visible = generative || !r.generative
            return (
              <g key={r.id}>
                <motion.path
                  d={toPath(r.pts)}
                  stroke={r.generative ? '#b07cff' : '#4c93ff'}
                  strokeWidth={3}
                  strokeLinecap="round"
                  initial={false}
                  animate={{ pathLength: visible ? 1 : 0, opacity: visible ? 1 : 0 }}
                  transition={{ duration: 0.9, ease: 'easeInOut', delay: visible && r.generative ? (r.id === 'cloud' ? 0.45 : 0.1) : 0 }}
                />
                {r.pts.slice(1, -1).map((p, i) => (
                  <motion.circle
                    key={i}
                    cx={p[0]}
                    cy={p[1]}
                    r={9}
                    fill="#04060d"
                    stroke={r.generative ? '#b07cff' : '#4c93ff'}
                    strokeWidth={3}
                    initial={false}
                    animate={{ opacity: visible ? 1 : 0, scale: visible ? 1 : 0.4 }}
                    transition={{ duration: 0.5, delay: visible ? 0.5 + i * 0.12 + (r.id === 'cloud' ? 0.35 : 0) : 0 }}
                  />
                ))}
              </g>
            )
          })}
          <circle cx={entry[0]} cy={entry[1]} r={20} fill="#04060d" stroke="#ff5b4a" strokeWidth={3} />
          <circle cx={entry[0]} cy={entry[1]} r={7} fill="#ff5b4a" />
          <circle cx={goal[0]} cy={goal[1]} r={20} fill="#04060d" stroke="#ff5b4a" strokeWidth={3} />
          <circle cx={goal[0]} cy={goal[1]} r={7} fill="#ff5b4a" />
          <text x={entry[0]} y={entry[1] - 36} textAnchor="middle" className="fill-muted-foreground" fontSize={22}>Entry</text>
          <text x={goal[0] + 20} y={goal[1] - 36} textAnchor="end" className="fill-muted-foreground" fontSize={22}>Crown jewel</text>
        </svg>

        <ul className="mt-4 grid gap-3 md:grid-cols-3">
          {routes.map((r) => {
            const visible = generative || !r.generative
            return (
              <li
                key={r.id}
                className={cn(
                  'rounded-2xl border p-3 transition-all duration-500',
                  visible ? 'border-border bg-card' : 'border-dashed border-border/60 opacity-35',
                )}
              >
                <p className={cn('mb-1 flex items-center gap-2 text-sm font-semibold', r.generative ? 'text-violet' : 'text-primary')}>
                  <span className={cn('size-2 rounded-full', r.generative ? 'bg-violet' : 'bg-primary')} aria-hidden />
                  {r.name}
                </p>
                <p className="text-xs leading-relaxed text-muted-foreground md:text-[13px]">{r.text}</p>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
