'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { chains as baseChains } from '@/lib/chains'
import { huggingFaceChain } from '@/lib/incident'
import { cn } from '@/lib/utils'
import { SectionHeading } from '@/components/brand/reveal'
import { TermRow } from '@/components/term/term-lines'
import type { TermLine } from '@/lib/terminal'

const list = [...baseChains, huggingFaceChain]

type Phase = 'idle' | 'approve' | 'running' | 'done'

function Key({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded border border-border bg-secondary px-1.5 py-0.5 font-mono text-[11px] text-foreground">
      {children}
    </kbd>
  )
}

export function TuiApp() {
  const [sel, setSel] = useState(0)
  const [phase, setPhase] = useState<Phase>('idle')
  const [step, setStep] = useState(-1)
  const [focused, setFocused] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const chain = list[sel]
  const last = chain.nodes.length - 1

  useEffect(() => {
    if (phase !== 'running') return
    if (step >= last) {
      setPhase('done')
      return
    }
    const t = setTimeout(() => setStep((s) => s + 1), 950)
    return () => clearTimeout(t)
  }, [phase, step, last])

  const select = (i: number) => {
    setSel(i)
    setStep(-1)
    setPhase('idle')
  }
  const run = () => {
    setStep(0)
    setPhase('running')
  }
  const cancel = () => setPhase('idle')

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (phase === 'approve') {
      if (e.key === 'y' || e.key === 'Y') run()
      if (e.key === 'n' || e.key === 'N' || e.key === 'Escape') cancel()
      return
    }
    if (phase === 'running') return
    if (e.key === 'ArrowDown' || e.key === 'j') {
      e.preventDefault()
      select((sel + 1) % list.length)
    } else if (e.key === 'ArrowUp' || e.key === 'k') {
      e.preventDefault()
      select((sel - 1 + list.length) % list.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      setPhase('approve')
    } else if (e.key === 'r') {
      select(sel)
    }
  }

  const hopsDone = Math.max(step, 0)
  const bar = '#'.repeat(hopsDone) + '.'.repeat(last - hopsDone)

  const log: TermLine[] = []
  if (step >= 0) log.push({ k: 'cmd', t: `validate ${chain.id} --read-only` })
  chain.hops.forEach((hop, i) => {
    if (step > i) log.push({ k: 'ok', t: `hop ${i + 1}  ${hop.evidence}` })
  })
  if (phase === 'done') log.push({ k: 'err', t: `EXPLOITABLE  ${chain.impact}` })

  return (
    <section id="tui" className="px-6 py-20 md:py-28">
      <SectionHeading eyebrow="Try it" title="A console built for chains">
        Pick a path with the arrow keys, approve a read-only validation, and watch the evidence arrive. Click the
        window to focus it, or use the buttons.
      </SectionHeading>

      <div className="mx-auto mt-14 max-w-6xl">
        <div
          ref={root}
          tabIndex={0}
          role="application"
          aria-label="Chain validation console. Use arrow keys to select, Enter to validate."
          onKeyDown={onKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onClick={() => root.current?.focus()}
          className={cn(
            'overflow-hidden rounded-2xl border bg-ink/90 font-mono text-xs outline-none transition-shadow md:text-[13px]',
            focused ? 'border-primary shadow-[0_0_0_1px_rgb(76_147_255/0.6),0_0_60px_rgb(76_147_255/0.2)]' : 'border-primary/25',
          )}
        >
          <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
            <span className="flex gap-1.5" aria-hidden>
            <span className="size-3 rounded-full bg-[#ff5f57]" />
            <span className="size-3 rounded-full bg-[#febc2e]" />
            <span className="size-3 rounded-full bg-[#28c840]" />
            </span>
            <span className="ml-2 text-xs text-muted-foreground">offensai console</span>
            <span className="ml-auto text-[11px] text-muted-foreground">{focused ? 'focused' : 'click to focus'}</span>
          </div>

          <div className="grid md:grid-cols-[230px_1fr_1fr] md:divide-x md:divide-border">
            <div className="border-b border-border p-3 md:border-b-0">
              <p className="mb-2 px-2 text-[11px] uppercase tracking-widest text-muted-foreground">Chains</p>
              <ul className="flex flex-col gap-0.5">
                {list.map((c, i) => (
                  <li key={c.id}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        if (phase !== 'running') select(i)
                        root.current?.focus()
                      }}
                      aria-current={i === sel}
                      className={cn(
                        'flex w-full items-start gap-2 rounded px-2 py-1.5 text-left transition-colors',
                        i === sel ? 'bg-primary text-primary-foreground' : 'text-foreground/80 hover:bg-secondary',
                      )}
                    >
                      <span aria-hidden>{i === sel ? '>' : '\u00a0'}</span>
                      <span className="min-w-0">
                        <span className="block truncate">{c.name}</span>
                        <span className={cn('block text-[11px]', i === sel ? 'text-primary-foreground/70' : 'text-muted-foreground')}>
                          {c.cloud} / {c.hops.length} hops
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative min-h-[420px] p-4">
              <p className="mb-3 text-[11px] uppercase tracking-widest text-muted-foreground">Path</p>
              <ol>
                {chain.nodes.map((node, i) => {
                  const lit = i <= step
                  const isLast = i === last
                  const hop = i > 0 ? chain.hops[i - 1] : null
                  return (
                    <li key={node.id}>
                      {hop && (
                        <div className="flex gap-3">
                          <span className={cn('w-8 shrink-0 text-center', i <= step ? 'text-primary' : 'text-border')} aria-hidden>
                            |
                          </span>
                          <span className={cn('py-1 text-[11px] leading-snug', i <= step ? 'text-foreground/70' : 'text-muted-foreground/50')}>
                            {hop.title}
                          </span>
                        </div>
                      )}
                      <motion.div
                        initial={false}
                        animate={{ opacity: lit || step < 0 ? 1 : 0.45 }}
                        className="flex items-baseline gap-3"
                      >
                        <span
                          className={cn(
                            'w-8 shrink-0 whitespace-nowrap text-center',
                            lit ? (node.kind === 'attacker' || (isLast && phase === 'done') ? 'text-ember' : 'text-primary') : 'text-muted-foreground',
                          )}
                          aria-hidden
                        >
                          {lit ? '(*)' : '( )'}
                        </span>
                        <span className={cn(lit ? 'text-foreground' : 'text-muted-foreground')}>{node.label}</span>
                        <span className="truncate text-[11px] text-muted-foreground">{node.sub}</span>
                      </motion.div>
                    </li>
                  )
                })}
              </ol>

              {phase === 'approve' && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute inset-x-3 bottom-3 rounded-lg border border-violet/60 bg-ink p-3"
                >
                  <p className="text-violet">? Run a read-only validation on this chain?</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">Nothing runs without your approval.</p>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        run()
                      }}
                      className="rounded bg-primary px-3 py-1 font-semibold text-primary-foreground"
                    >
                      y approve
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        cancel()
                      }}
                      className="rounded border border-border px-3 py-1 text-foreground/80 hover:bg-secondary"
                    >
                      n cancel
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            <div className="border-t border-border p-4 md:border-t-0">
              <p className="mb-3 text-[11px] uppercase tracking-widest text-muted-foreground">Evidence</p>
              {log.length === 0 ? (
                <TermRow line={{ k: 'dim', t: 'select a chain, press enter' }} />
              ) : (
                <div className="flex flex-col gap-1.5">
                  {log.map((l, i) => (
                    <motion.div key={`${chain.id}-${i}`} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}>
                      <TermRow line={l} />
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border bg-secondary/60 px-4 py-2 text-[11px]">
            <span
              className={cn(
                'rounded px-2 py-0.5 font-semibold',
                phase === 'done' ? 'bg-ember text-background' : phase === 'running' ? 'bg-primary text-primary-foreground' : 'bg-border text-foreground',
              )}
            >
              {phase === 'done' ? 'EXPLOITABLE' : phase === 'running' ? 'VALIDATING' : phase === 'approve' ? 'AWAITING APPROVAL' : 'READY'}
            </span>
            <span className="text-primary" aria-label={`${hopsDone} of ${last} hops`}>
              [{bar}] {hopsDone}/{last}
            </span>
            <span className="ml-auto hidden items-center gap-2 text-muted-foreground sm:flex">
              <Key>j</Key>/<Key>k</Key> select <Key>Enter</Key> validate <Key>y</Key>/<Key>n</Key> approve <Key>r</Key> reset
            </span>
            <span className="ml-auto flex items-center gap-2 sm:hidden">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  if (phase === 'idle' || phase === 'done') setPhase('approve')
                }}
                className="rounded border border-primary/50 px-2 py-1 text-primary"
              >
                validate
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  if (phase !== 'running') select(sel)
                }}
                className="rounded border border-border px-2 py-1 text-muted-foreground"
              >
                reset
              </button>
            </span>
          </div>
        </div>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Concept visual. Chains shown are illustrative; the last one is summarised from public reporting.
        </p>
      </div>
    </section>
  )
}
