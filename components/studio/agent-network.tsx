'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView, useReducedMotion } from 'motion/react'
import { SectionHeading } from '@/components/brand/reveal'
import { cn } from '@/lib/utils'

const loop = [
  {
    name: 'Discover',
    title: 'Persistent cloud intelligence',
    text: 'OFFENSAI finds exploitable cloud changes across AWS, Azure, GCP, and Kubernetes, feeding a persistent graph instead of resetting with each prompt.',
  },
  {
    name: 'Prove',
    title: 'Formal proof engine',
    text: 'Mathematically proves which attack paths exist in your environment using z3 Datalog, delivering deterministic validation instead of probabilistic answers.',
  },
  {
    name: 'Execute',
    title: 'Operator-driven or autonomous',
    text: 'ATTACKSTUDIO lets operators build and control campaigns, while Agent O runs proven paths end to end, on demand with full reports and no hallucinations.',
  },
  {
    name: 'Learn',
    title: 'Compounding attack graph collection',
    text: 'Curates verified patterns into a compounding knowledge graph that sharpens every future discovery cycle, unlike frontier models with no persistent state.',
  },
]

const clouds = ['AWS', 'Azure', 'GCP', 'Kubernetes']
const colX = [60, 180, 300, 420]
const rowY = [80, 130, 180]
// One chain that crosses all four clouds by stepping through shared primitives.
const crossPath: [number, number][] = [
  [60, 80],
  [180, 80],
  [180, 130],
  [300, 130],
  [300, 180],
  [420, 180],
]

function AgentLoop() {
  const [active, setActive] = useState(0)
  const [auto, setAuto] = useState(true)
  const reduce = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { amount: 0.5 })

  useEffect(() => {
    if (!auto || reduce || !inView) return
    const id = setInterval(() => setActive((a) => (a + 1) % loop.length), 4200)
    return () => clearInterval(id)
  }, [auto, reduce, inView])

  const s = loop[active]

  return (
    <div ref={ref} className="rounded-3xl border border-border bg-card/60 p-5 md:p-8">
      <p className="mb-5 text-sm text-muted-foreground">
        Connect discovery, proof, execution, and learning into a loop that improves with every validated attack path.
      </p>
      <div role="tablist" aria-label="Agent network loop" className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {loop.map((l, i) => (
          <button
            key={l.name}
            role="tab"
            aria-selected={i === active}
            onClick={() => {
              setAuto(false)
              setActive(i)
            }}
            className={cn(
              'relative rounded-xl border px-4 py-3 text-left transition-colors',
              i === active ? 'border-primary/60 bg-accent' : 'border-border bg-card/50 hover:border-primary/30',
            )}
          >
            <span className="block font-mono text-[11px] text-muted-foreground">Step {i + 1}</span>
            <span className="block text-base font-semibold">{l.name}</span>
            {i === active && !reduce && auto && (
              <motion.span
                key={`bar-${active}`}
                className="absolute inset-x-3 bottom-1.5 h-0.5 origin-left rounded-full bg-primary"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 4.2, ease: 'linear' }}
              />
            )}
          </button>
        ))}
      </div>
      <motion.div
        key={s.name}
        role="tabpanel"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-5 min-h-28 rounded-2xl border border-border bg-black/40 p-5"
      >
        <h3 className="text-lg font-semibold">{s.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground md:text-base">{s.text}</p>
      </motion.div>
      <p className="mt-3 text-center font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
        Learn feeds the next Discover
      </p>
    </div>
  )
}

function OntologyDemo() {
  const [uoo, setUoo] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.6 })
  const touched = useRef(false)

  useEffect(() => {
    if (!inView) return
    const t = setTimeout(() => {
      if (!touched.current) setUoo(true)
    }, 2400)
    return () => clearTimeout(t)
  }, [inView])

  const d = crossPath.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ')

  return (
    <div ref={ref} className="rounded-3xl border border-border bg-card/60 p-5 md:p-8">
      <div role="group" aria-label="Reasoning model" className="mb-5 flex w-fit rounded-xl border border-border bg-secondary p-1">
        {(
          [
            [false, 'One cloud at a time'],
            [true, 'Universal Offensive Ontology'],
          ] as const
        ).map(([v, label]) => (
          <button
            key={label}
            aria-pressed={uoo === v}
            onClick={() => {
              touched.current = true
              setUoo(v)
            }}
            className={cn(
              'rounded-lg px-3 py-2 text-xs font-semibold transition-colors md:text-sm',
              uoo === v ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <svg viewBox="0 0 480 215" className="w-full" fill="none" role="img" aria-label="Attack paths across AWS, Azure, GCP and Kubernetes">
        {clouds.map((c, i) => (
          <g key={c}>
            <text x={colX[i]} y={26} textAnchor="middle" className="fill-muted-foreground" fontSize={13}>
              {c}
            </text>
            <line x1={colX[i]} y1={rowY[0]} x2={colX[i]} y2={rowY[2]} stroke="#4c93ff" strokeOpacity={0.18} strokeWidth={2} />
            {rowY.map((y) => (
              <circle key={y} cx={colX[i]} cy={y} r={7} fill="#04060d" stroke="#4c93ff" strokeOpacity={0.5} strokeWidth={2} />
            ))}
          </g>
        ))}
        <motion.path
          d={d}
          stroke="#b07cff"
          strokeWidth={4}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={false}
          animate={{ pathLength: uoo ? 1 : 0, opacity: uoo ? 1 : 0 }}
          transition={{ duration: 1, ease: 'easeInOut' }}
        />
        {crossPath.map((p, i) => (
          <motion.circle
            key={i}
            cx={p[0]}
            cy={p[1]}
            r={9}
            fill="#04060d"
            stroke="#b07cff"
            strokeWidth={3}
            initial={false}
            animate={{ opacity: uoo ? 1 : 0, scale: uoo ? 1 : 0.4 }}
            transition={{ delay: uoo ? 0.15 * i : 0, duration: 0.3 }}
          />
        ))}
      </svg>

      <p className="mt-2 text-sm leading-relaxed text-muted-foreground md:text-base" aria-live="polite">
        {uoo
          ? 'UOO maps thousands of cloud-specific actions into 11 universal attack primitives. Techniques connect through shared primitives, not provider logic, so one chain can span AWS, Azure, GCP, and Kubernetes.'
          : 'Single-platform logic sees each cloud on its own, so a path that crosses clouds stays invisible.'}
      </p>
    </div>
  )
}

export function AgentNetwork() {
  return (
    <section id="agent-network" className="px-6 py-24 md:py-32">
      <SectionHeading eyebrow="Agent network" title="General AI understands text. OFFENSAI understands cloud attacks.">
        Its model reasons over a Universal Offensive Ontology, a shared attack language linking identities, permissions,
        and services into real cross-cloud chains, each validated in live environments.
      </SectionHeading>
      <div className="mx-auto mt-14 grid max-w-6xl gap-6 lg:grid-cols-2">
        <AgentLoop />
        <OntologyDemo />
      </div>
    </section>
  )
}
