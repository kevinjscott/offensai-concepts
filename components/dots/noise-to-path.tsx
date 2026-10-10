'use client'

import { AnimatePresence, motion, useMotionValueEvent, useScroll, useTransform } from 'motion/react'
import { useRef, useState } from 'react'
import { ChainGraph, ChainRail } from '@/components/brand/chain-graph'
import { azureChain } from '@/lib/chains'
import { DotField } from './dot-field'

const chips = [
  { t: 'Public bucket', x: 6, y: 14 },
  { t: 'Unused role', x: 70, y: 9 },
  { t: 'Stale access key', x: 18, y: 86 },
  { t: 'Open port 22', x: 78, y: 88 },
  { t: 'Wildcard policy', x: 50, y: 5 },
  { t: 'No MFA', x: 3, y: 52 },
  { t: 'Old snapshot', x: 90, y: 50 },
  { t: 'Overbroad scope', x: 36, y: 94 },
]

const LAST = azureChain.nodes.length - 1

function stepFor(v: number) {
  if (v < 0.3) return -1
  return Math.min(LAST, Math.floor(((v - 0.3) / 0.62) * (LAST + 1)))
}

function captionFor(v: number, step: number) {
  if (step >= 0) {
    if (step === 0) return { key: 's0', eyebrow: 'Entry point', title: 'An attacker finds a way in.', body: azureChain.nodes[0].sub + ' can run code in CI.' }
    if (step === LAST)
      return { key: 'sl', eyebrow: `Hop ${step} of ${LAST}`, title: 'Production data. Proven.', body: `${azureChain.impact}. Evidence attached.` }
    return {
      key: `s${step}`,
      eyebrow: `Hop ${step} of ${LAST}`,
      title: azureChain.nodes[step].label,
      body: azureChain.hops[step - 1].title + '.',
    }
  }
  if (v < 0.15)
    return { key: 'p0', eyebrow: 'Your dashboard today', title: 'Thousands of cloud changes. Every day.', body: 'Most are noise. The few that matter are the combinations that collapse a trust boundary or enable lateral movement.' }
  return { key: 'p1', eyebrow: 'Attackers do not read lists', title: 'They chain what you only list.', body: 'Keep scrolling and watch a real attack path form.' }
}

export function NoiseToPath() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const [state, setState] = useState({ v: 0, step: -1 })

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const step = stepFor(v)
    setState((s) => (s.step === step && Math.abs(s.v - v) < 0.02 ? s : { v, step }))
  })

  const dotOpacity = useTransform(scrollYProgress, [0.1, 0.45], [1, 0.12])
  const chipOpacity = useTransform(scrollYProgress, [0.12, 0.34], [1, 0])
  const progressScale = useTransform(scrollYProgress, [0, 1], [0, 1])

  const caption = captionFor(state.v, state.step)

  return (
    <section ref={ref} id="why" className="relative h-[480vh]" aria-label="From findings to a proven attack path">
      <div className="sticky top-0 flex h-screen min-h-[560px] flex-col justify-center overflow-hidden px-6">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 lg:gap-10">
          <div className="min-h-[148px] max-w-2xl md:min-h-[168px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={caption.key}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35 }}
              >
                <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-primary">{caption.eyebrow}</p>
                <h2 className="text-balance text-3xl font-semibold leading-tight md:text-5xl">{caption.title}</h2>
                <p className="mt-3 text-pretty text-base text-muted-foreground md:text-lg">{caption.body}</p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="relative">
            <div className="absolute -inset-x-6 -inset-y-10 hidden lg:block">
              <DotField count={110} seed={21} opacity={dotOpacity} />
              {chips.map((c) => (
                <motion.span
                  key={c.t}
                  style={{ left: `${c.x}%`, top: `${c.y}%`, opacity: chipOpacity }}
                  className="absolute rounded-md border border-border bg-card/80 px-2 py-1 font-mono text-[11px] text-muted-foreground"
                >
                  {c.t}
                </motion.span>
              ))}
            </div>
            <div className="relative hidden lg:block">
              <ChainGraph chain={azureChain} step={state.step} showIdle={state.step >= 0} />
            </div>
            <div className="relative lg:hidden">
              <DotField count={40} seed={21} opacity={dotOpacity} className="opacity-60" />
              <ChainRail chain={azureChain} step={state.step} showHops={false} className="relative" />
            </div>
          </div>
        </div>

        <div className="absolute inset-x-6 bottom-6 mx-auto h-px max-w-6xl bg-border" aria-hidden>
          <motion.div className="h-px origin-left bg-primary" style={{ scaleX: progressScale }} />
        </div>
      </div>
    </section>
  )
}
