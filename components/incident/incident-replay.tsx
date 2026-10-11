'use client'

import { useEffect, useRef, useState } from 'react'
import { Pause, Play, RotateCcw } from 'lucide-react'
import { motion, useInView } from 'motion/react'
import { ChainGraph, ChainRail } from '@/components/brand/chain-graph'
import { SectionHeading } from '@/components/brand/reveal'
import { TermRow } from '@/components/term/term-lines'
import { TerminalWindow } from '@/components/term/terminal-window'
import { huggingFaceChain as chain, hopFixes } from '@/lib/incident'
import type { TermLine } from '@/lib/terminal'
import { cn } from '@/lib/utils'

const LAST = chain.nodes.length - 1

type Mode = 'replay' | 'break'

export function IncidentReplay() {
  const [mode, setMode] = useState<Mode>('replay')
  const [step, setStep] = useState(-1)
  const [playing, setPlaying] = useState(false)
  const [cut, setCut] = useState<number | null>(null)

  useEffect(() => {
    if (!playing) return
    if (step >= LAST) {
      setPlaying(false)
      return
    }
    const t = setTimeout(() => setStep((s) => s + 1), 1500)
    return () => clearTimeout(t)
  }, [playing, step])

  const sectionRef = useRef<HTMLElement>(null)
  const inView = useInView(sectionRef, { once: true, amount: 0.5 })
  const touched = useRef(false)

  useEffect(() => {
    if (!inView || touched.current) return
    const t = setTimeout(() => {
      if (!touched.current) setPlaying(true)
    }, 900)
    return () => clearTimeout(t)
  }, [inView])

  const autoBreakAt = Math.min(2, hopFixes.length - 1)
  useEffect(() => {
    if (!inView || touched.current || mode !== 'replay' || step < LAST) return
    const toBreak = setTimeout(() => {
      if (touched.current) return
      setMode('break')
      setCut(null)
    }, 2200)
    return () => clearTimeout(toBreak)
  }, [inView, mode, step])

  useEffect(() => {
    if (!inView || touched.current || mode !== 'break' || cut !== null) return
    const cutIt = setTimeout(() => {
      if (!touched.current) setCut(autoBreakAt)
    }, 2000)
    return () => clearTimeout(cutIt)
  }, [inView, mode, cut, autoBreakAt])

  const toggle = () => {
    touched.current = true
    if (step >= LAST) {
      setStep(-1)
      setPlaying(true)
      return
    }
    setPlaying((p) => !p)
  }

  const switchMode = (next: Mode) => {
    touched.current = true
    setMode(next)
    setPlaying(false)
    if (next === 'break') setStep(LAST)
    else setStep(-1)
    setCut(null)
  }

  const graphStep = mode === 'break' ? (cut === null ? LAST : cut) : step
  const blocked = mode === 'break' && cut !== null ? [cut] : []

  const lines: TermLine[] = []
  if (step >= 0) lines.push({ k: 'cmd', t: 'replay --incident huggingface-2026-07 --step' })
  chain.hops.forEach((hop, i) => {
    if (step > i) {
      lines.push({ k: 'ok', t: `hop ${i + 1}/${chain.hops.length}  ${hop.title}` })
      lines.push({ k: 'dim', t: hop.evidence })
    }
  })
  if (step >= 3) lines.push({ k: 'warn', t: 'side channel: output smuggled through the platform API and dead-drop datasets' })
  if (step >= LAST) lines.push({ k: 'err', t: `impact: ${chain.impact}` })

  return (
    <section ref={sectionRef} id="replay" className="px-6 py-20 md:py-28">
      <SectionHeading eyebrow="Replay" title="Walk the path, then break it">
        Built from public reporting. Watch the intrusion play out hop by hop, then watch one fix stop the chain. Once
        it finishes, the controls are yours.
      </SectionHeading>

      <div className="mx-auto mt-14 max-w-6xl">
        <div className="rounded-3xl border border-border bg-card/60 p-4 md:p-8">
          <div role="tablist" aria-label="Mode" className="mb-6 inline-flex rounded-xl border border-border bg-background/60 p-1">
            {(['replay', 'break'] as const).map((m) => (
              <button
                key={m}
                role="tab"
                aria-selected={mode === m}
                onClick={() => switchMode(m)}
                className={cn(
                  'rounded-lg px-4 py-1.5 text-sm font-medium transition-colors',
                  mode === m ? 'bg-primary/15 text-foreground' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {m === 'replay' ? 'Replay it' : 'Break it'}
              </button>
            ))}
          </div>

          <div className="hidden md:block">
            <ChainGraph chain={chain} step={graphStep} blocked={blocked} />
          </div>
          <div className="md:hidden">
            <ChainRail chain={chain} step={graphStep} blocked={blocked} />
          </div>

          {mode === 'replay' ? (
            <div className="mt-6 flex items-center gap-4 border-t border-border pt-5">
              <button
                onClick={toggle}
                className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-primary/40 bg-gradient-to-b from-[#0d1730] to-[#050a18] px-4 py-2 text-sm font-semibold hover:border-primary focus-visible:outline-2"
              >
                {step >= LAST ? (
                  <RotateCcw className="size-4" aria-hidden />
                ) : playing ? (
                  <Pause className="size-4" aria-hidden />
                ) : (
                  <Play className="size-4" aria-hidden />
                )}
                {step >= LAST ? 'Replay' : playing ? 'Pause' : 'Play'}
              </button>
              <label className="flex min-w-0 flex-1 items-center gap-3 text-xs text-muted-foreground">
                <span className="sr-only">Hop</span>
                <input
                  type="range"
                  min={-1}
                  max={LAST}
                  value={step}
                  onChange={(e) => {
                    touched.current = true
                    setPlaying(false)
                    setStep(Number(e.target.value))
                  }}
                  className="h-1 w-full cursor-pointer accent-primary"
                />
                <span className="w-16 shrink-0 text-right font-mono">
                  {Math.max(step, 0)} / {LAST}
                </span>
              </label>
            </div>
          ) : (
            <div className="mt-6 border-t border-border pt-5">
              <div role="group" aria-label="Controls" className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <button
                  aria-pressed={cut === null}
                  onClick={() => {
                    touched.current = true
                    setCut(null)
                  }}
                  className={cn(
                    'rounded-xl border px-4 py-3 text-left text-sm transition-colors',
                    cut === null ? 'border-ember/60 bg-ember/10 text-foreground' : 'border-border bg-card/60 text-muted-foreground hover:border-primary/50',
                  )}
                >
                  No control changed
                  <span className="mt-0.5 block text-xs text-muted-foreground">The chain runs end to end.</span>
                </button>
                {hopFixes.map((fix, i) => (
                  <button
                    key={fix}
                    aria-pressed={cut === i}
                    onClick={() => {
                      touched.current = true
                      setCut(i)
                    }}
                    className={cn(
                      'rounded-xl border px-4 py-3 text-left text-sm transition-colors',
                      cut === i ? 'border-primary bg-primary/10 text-foreground' : 'border-border bg-card/60 text-muted-foreground hover:border-primary/50',
                    )}
                  >
                    <span className="font-mono text-xs text-primary">hop {i + 1}</span>
                    <span className="block text-foreground">{fix}</span>
                  </button>
                ))}
              </div>
              <p aria-live="polite" className="mt-5 font-mono text-xs leading-relaxed md:text-sm">
                {cut === null ? (
                  <span className="text-ember">x {chain.impact}</span>
                ) : (
                  <span className="text-primary">
                    + chain stops at hop {cut + 1}. Everything after it is unreachable by this route.
                  </span>
                )}
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
          {mode === 'replay' ? (
            <TerminalWindow title="replay.log" bodyClassName="min-h-64">
              {lines.length === 0 ? (
                <TermRow line={{ k: 'dim', t: 'press play to start the replay' }} />
              ) : (
                <div className="flex flex-col gap-1">
                  {lines.map((l, i) => (
                    <motion.div key={`${l.t}-${i}`} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}>
                      <TermRow line={l} />
                    </motion.div>
                  ))}
                </div>
              )}
            </TerminalWindow>
          ) : (
            <div className="flex flex-col justify-center rounded-2xl border border-border bg-card/60 p-6 md:p-8">
              <h3 className="text-xl font-semibold">Which control first?</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
                In your own cloud there are many chains, and most share hops. One control can cut several of them.
                Another cuts none. That is what OFFENSAI&apos;s prioritization is for.
              </p>
            </div>
          )}

          <div className="flex flex-col justify-center rounded-2xl border border-border bg-card/60 p-6 md:p-8">
            <h3 className="text-xl font-semibold">What a finding list would have shown</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
              A cache proxy bug. A parser that follows file references. A template engine fed user input. A pod that
              could read its own secrets. Service credentials that were a little too broad. Five separate tickets in
              five separate queues, each reasonable to defer.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-foreground md:text-base">
              Chained, they were an intrusion. The risk lived in the edges between findings, and a list has no edges.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
