'use client'

import { AnimatePresence, motion, useInView } from 'motion/react'
import { Check, RotateCcw } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ChainGraph, ChainRail } from '@/components/brand/chain-graph'
import { chains } from '@/lib/chains'
import { cn } from '@/lib/utils'

export function ChainConsole() {
  const [chainIdx, setChainIdx] = useState(0)
  const [step, setStep] = useState(-1)
  const [running, setRunning] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.35 })

  const chain = chains[chainIdx]
  const last = chain.nodes.length - 1
  const done = step >= last

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => {
      setStep((s) => {
        if (s >= last) {
          setRunning(false)
          return s
        }
        return s + 1
      })
    }, 1150)
    return () => clearInterval(id)
  }, [running, last])

  const run = useCallback(() => {
    setStep(0)
    setRunning(true)
  }, [])

  useEffect(() => {
    if (inView) run()
  }, [inView, run])

  function pick(i: number) {
    setChainIdx(i)
    run()
  }

  const evidence = chain.hops.slice(0, Math.max(0, step))

  return (
    <div ref={ref} className="relative mx-auto w-full max-w-6xl rounded-3xl border border-primary/25 bg-ink/90 shadow-[0_0_80px_rgb(76_147_255/0.12)]">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3 border-b border-border px-5 py-4">
        <div className="flex items-center gap-1.5" aria-hidden>
          <span className="size-2.5 rounded-full bg-muted-foreground/30" />
          <span className="size-2.5 rounded-full bg-muted-foreground/30" />
          <span className="size-2.5 rounded-full bg-muted-foreground/30" />
        </div>
        <p className="font-mono text-xs text-muted-foreground">ATTACKSTUDIO / campaign</p>
        <div role="tablist" aria-label="Scenario" className="ml-auto flex gap-1 rounded-xl border border-border bg-secondary p-1">
          {chains.map((c, i) => (
            <button
              key={c.id}
              role="tab"
              aria-selected={i === chainIdx}
              onClick={() => pick(i)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors',
                i === chainIdx ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {c.cloud}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 pb-5 pt-6 md:px-8">
        <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-xl font-semibold">{chain.name}</h3>
          <p className="text-sm text-muted-foreground">{chain.summary}</p>
        </div>

        <div className="hidden py-6 lg:block">
          <ChainGraph chain={chain} step={step} showIdle />
        </div>
        <div className="py-4 lg:hidden">
          <ChainRail chain={chain} step={step} showHops={false} />
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <div className="min-h-44 rounded-2xl border border-border bg-black/60 p-4 font-mono text-xs leading-relaxed">
            <p className="mb-3 text-muted-foreground">Agent O: running the approved path &quot;{chain.name}&quot;, read-only</p>
            <AnimatePresence initial={false}>
              {evidence.map((h, i) => (
                <motion.p
                  key={`${chain.id}-${i}`}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex gap-2 text-foreground/90"
                >
                  <span className="text-primary">hop {i + 1}</span>
                  <span className="text-muted-foreground">{h.evidence}</span>
                </motion.p>
              ))}
            </AnimatePresence>
            {running && <span className="mt-2 inline-block h-3 w-1.5 animate-pulse bg-primary" aria-hidden />}
          </div>

          <div
            className={cn(
              'flex flex-col justify-between rounded-2xl border p-5 transition-colors duration-500',
              done ? 'border-ember/50 bg-ember/10' : 'border-border bg-card/60',
            )}
            aria-live="polite"
          >
            {done ? (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <p className="inline-flex items-center gap-2 rounded-full bg-ember px-3 py-1 text-xs font-bold text-primary-foreground">
                  <Check className="size-3.5" strokeWidth={3} aria-hidden /> Exploitable
                </p>
                <p className="mt-4 text-lg font-semibold leading-snug">{chain.impact}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {last} hops executed with evidence. Full report and remediation guidance attached.
                </p>
              </motion.div>
            ) : (
              <div>
                <p className="inline-flex items-center gap-2 text-sm font-semibold">
                  <span className="size-2 animate-pulse rounded-full bg-primary" aria-hidden />
                  Validating hop {Math.max(1, step + 1)} of {last}
                </p>
                <p className="mt-3 text-sm text-muted-foreground">A path is only a hypothesis until every hop has run.</p>
              </div>
            )}
            <div className="mt-5 flex items-center justify-between gap-3">
              <span className="text-[11px] text-muted-foreground">Illustrative scenario</span>
              <button
                onClick={run}
                disabled={running}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold transition-colors hover:border-primary disabled:opacity-40"
              >
                <RotateCcw className="size-3.5" aria-hidden /> Replay
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
