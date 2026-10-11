'use client'

import { AnimatePresence, motion, useInView } from 'motion/react'
import { GitMerge, RotateCcw } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { ChainGraph, ChainRail } from '@/components/brand/chain-graph'
import { SectionHeading } from '@/components/brand/reveal'
import { azureChain } from '@/lib/chains'
import { cn } from '@/lib/utils'

const LAST = azureChain.nodes.length - 1
type Phase = 'safe' | 'revalidating' | 'exploitable'

export function ShipAChange() {
  const [phase, setPhase] = useState<Phase>('safe')
  const [step, setStep] = useState(1)

  useEffect(() => {
    if (phase !== 'revalidating') return
    const id = setInterval(() => {
      setStep((s) => {
        if (s >= LAST) {
          setPhase('exploitable')
          return s
        }
        return s + 1
      })
    }, 900)
    return () => clearInterval(id)
  }, [phase])

  function ship() {
    setStep(1)
    setPhase('revalidating')
  }

  const sectionRef = useRef<HTMLElement>(null)
  const inView = useInView(sectionRef, { once: true, amount: 0.6 })
  useEffect(() => {
    if (!inView) return
    const t = setTimeout(() => {
      setStep(1)
      setPhase('revalidating')
    }, 1800)
    return () => clearTimeout(t)
  }, [inView])
  function revert() {
    setPhase('safe')
    setStep(1)
  }

  const changed = phase !== 'safe'
  const status =
    phase === 'safe'
      ? { tone: 'text-muted-foreground', text: 'Trust rule is scoped. The chain stops at the federated exchange.' }
      : phase === 'revalidating'
        ? { tone: 'text-primary', text: 'Change signal received. Revalidating affected paths…' }
        : { tone: 'text-ember', text: 'New exploitable path validated. Evidence attached.' }

  return (
    <section ref={sectionRef} id="change" className="px-6 py-24 md:py-32">
      <SectionHeading eyebrow="Watch it" title="One merged line. One new path.">
        Same chain, same environment. Watch what a single loosened trust rule does, and how validation follows it.
      </SectionHeading>

      <div className="mx-auto mt-14 max-w-6xl rounded-3xl border border-primary/25 bg-ink/90 p-5 shadow-[0_0_80px_rgb(76_147_255/0.12)] md:p-8">
        <div className="flex flex-col gap-6">
          <div className="grid gap-4 lg:grid-cols-[1fr_1fr] lg:gap-6">
            <div className="overflow-hidden rounded-2xl border border-border bg-black/60 font-mono text-xs leading-relaxed">
              <p className="border-b border-border px-4 py-2.5 text-muted-foreground">infra/federated-credential.tf</p>
              <div className="px-4 py-3">
                <p className="text-muted-foreground">  issuer = &quot;https://gitlab.com&quot;</p>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={changed ? 'after' : 'before'}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    {changed ? (
                      <p className="-mx-4 overflow-x-auto bg-ember/15 px-4 py-0.5 text-ember">
                        + subject = &quot;project_path:acme/*:ref:*&quot;
                      </p>
                    ) : (
                      <p className="-mx-4 overflow-x-auto bg-primary/10 px-4 py-0.5 text-primary">
                        {'  '}subject = &quot;project_path:acme/api:ref:main&quot;
                      </p>
                    )}
                  </motion.div>
                </AnimatePresence>
                <p className="text-muted-foreground">  audience = &quot;api://AzureADTokenExchange&quot;</p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
            <button
              onClick={changed ? revert : ship}
              disabled={phase === 'revalidating'}
              className={cn(
                'inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition-colors disabled:opacity-50',
                changed ? 'border-border hover:border-primary' : 'border-primary/50 bg-primary text-primary-foreground hover:bg-primary/90',
              )}
            >
              {changed ? <RotateCcw className="size-4" aria-hidden /> : <GitMerge className="size-4" aria-hidden />}
              {changed ? 'Revert the change' : 'Merge this change'}
            </button>

            <p className={cn('min-h-12 text-sm leading-relaxed transition-colors', status.tone)} aria-live="polite">
              {status.text}
            </p>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Illustrative. In OFFENSAI, validation runs on change signals for resources you have reviewed and accepted,
              and only with your approval.
            </p>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card/40 p-4 md:p-6">
            <div className="hidden lg:block">
              <ChainGraph chain={azureChain} step={step} blocked={phase === 'safe' ? [1] : []} showIdle />
            </div>
            <div className="lg:hidden">
              <ChainRail chain={azureChain} step={step} blocked={phase === 'safe' ? [1] : []} showHops={false} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
