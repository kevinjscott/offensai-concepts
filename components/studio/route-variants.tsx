'use client'

import { motion } from 'motion/react'
import { useState } from 'react'
import { SectionHeading } from '@/components/brand/reveal'
import { cn } from '@/lib/utils'

type Pt = [number, number]

const entry: Pt = [60, 180]
const goal: Pt = [940, 180]

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
    pts: [entry, [250, 180], [480, 180], [700, 270], goal] as Pt[],
    generative: true,
  },
  {
    id: 'cloud',
    name: 'Across to another cloud',
    text: 'A federated credential in one cloud becomes a foothold in the next. No single tool sees it.',
    pts: [entry, [300, 300], [620, 310], goal] as Pt[],
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
  const [mode, setMode] = useState<'script' | 'generative'>('script')
  const [hover, setHover] = useState<string | null>(null)

  return (
    <section id="generate" className="px-6 py-24 md:py-32">
      <SectionHeading eyebrow="Generate" title="Same start. Same goal. Different chains.">
        Static rules replay what someone already wrote down. A generative engine invents new routes across APIs,
        identities and service relationships.
      </SectionHeading>

      <div className="mx-auto mt-10 flex w-fit gap-1 rounded-xl border border-border bg-secondary p-1" role="tablist" aria-label="Attack engine type">
        {(['script', 'generative'] as const).map((m) => (
          <button
            key={m}
            role="tab"
            aria-selected={mode === m}
            onClick={() => setMode(m)}
            className={cn(
              'rounded-lg px-4 py-2 text-sm font-semibold transition-colors',
              mode === m ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {m === 'script' ? 'Replayed script' : 'Generative engine'}
          </button>
        ))}
      </div>

      <div className="mx-auto mt-10 max-w-5xl rounded-3xl border border-border bg-card/50 p-4 md:p-8">
        <svg viewBox="0 0 1000 360" className="w-full" fill="none" role="img" aria-label="Three routes from an entry point to a crown jewel">
          {routes.map((r) => {
            const visible = mode === 'generative' || !r.generative
            const dim = hover && hover !== r.id
            return (
              <g key={r.id}>
                <motion.path
                  d={toPath(r.pts)}
                  stroke={r.generative ? '#b07cff' : '#4c93ff'}
                  strokeWidth={hover === r.id ? 4 : 3}
                  strokeLinecap="round"
                  initial={false}
                  animate={{ pathLength: visible ? 1 : 0, opacity: visible ? (dim ? 0.25 : 1) : 0 }}
                  transition={{ duration: 0.9, ease: 'easeInOut', delay: visible && r.generative ? 0.15 : 0 }}
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
                    animate={{ opacity: visible ? (dim ? 0.25 : 1) : 0, scale: visible ? 1 : 0.4 }}
                    transition={{ duration: 0.5, delay: visible ? 0.5 + i * 0.12 : 0 }}
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
          <text x={goal[0]} y={goal[1] - 36} textAnchor="middle" className="fill-muted-foreground" fontSize={22}>Crown jewel</text>
        </svg>

        <ul className="mt-6 grid gap-3 md:grid-cols-3">
          {routes.map((r) => {
            const visible = mode === 'generative' || !r.generative
            return (
              <li
                key={r.id}
                onMouseEnter={() => setHover(r.id)}
                onMouseLeave={() => setHover(null)}
                className={cn(
                  'rounded-2xl border p-4 transition-all duration-500',
                  visible ? 'border-border bg-card' : 'border-dashed border-border/60 opacity-35',
                )}
              >
                <p className={cn('mb-1.5 flex items-center gap-2 text-sm font-semibold', r.generative ? 'text-violet' : 'text-primary')}>
                  <span className={cn('size-2 rounded-full', r.generative ? 'bg-violet' : 'bg-primary')} aria-hidden />
                  {r.name}
                </p>
                <p className="text-sm leading-relaxed text-muted-foreground">{r.text}</p>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
