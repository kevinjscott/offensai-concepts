'use client'

import { useEffect, useState } from 'react'
import { Pause, Play, RotateCcw } from 'lucide-react'
import { motion } from 'motion/react'
import { ChainGraph, ChainRail } from '@/components/brand/chain-graph'
import { SectionHeading } from '@/components/brand/reveal'
import { TermRow } from '@/components/term/term-lines'
import { TerminalWindow } from '@/components/term/terminal-window'
import { huggingFaceChain as chain } from '@/lib/incident'
import type { TermLine } from '@/lib/terminal'

const LAST = chain.nodes.length - 1

export function IncidentReplay() {
  const [step, setStep] = useState(-1)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    if (!playing) return
    if (step >= LAST) {
      setPlaying(false)
      return
    }
    const t = setTimeout(() => setStep((s) => s + 1), 1500)
    return () => clearTimeout(t)
  }, [playing, step])

  const toggle = () => {
    if (step >= LAST) {
      setStep(-1)
      setPlaying(true)
      return
    }
    setPlaying((p) => !p)
  }

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
    <section id="replay" className="px-6 py-20 md:py-28">
      <SectionHeading eyebrow="Replay" title="Scrub through the path, hop by hop">
        Built from public reporting. Press play, or drag to any hop. Notice that no single step looks like an
        emergency on its own.
      </SectionHeading>

      <div className="mx-auto mt-14 max-w-6xl">
        <div className="rounded-3xl border border-border bg-card/60 p-4 md:p-8">
          <div className="hidden md:block">
            <ChainGraph chain={chain} step={step} />
          </div>
          <div className="md:hidden">
            <ChainRail chain={chain} step={step} />
          </div>

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
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
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
