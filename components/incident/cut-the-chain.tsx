'use client'

import { useState } from 'react'
import { ChainGraph, ChainRail } from '@/components/brand/chain-graph'
import { SectionHeading } from '@/components/brand/reveal'
import { huggingFaceChain as chain, hopFixes } from '@/lib/incident'
import { cn } from '@/lib/utils'

export function CutTheChain() {
  const [cut, setCut] = useState<number | null>(null)
  const step = cut === null ? chain.nodes.length - 1 : cut
  const blocked = cut === null ? [] : [cut]

  return (
    <section id="cut" className="px-6 py-20 md:py-28">
      <SectionHeading eyebrow="Break it" title="Fix any one hop and the chain stops">
        Pick a control. The path dies at that edge. The hard question is which control to pick first, and you can only
        answer that when you can see the whole chain.
      </SectionHeading>

      <div className="mx-auto mt-14 flex max-w-6xl flex-col-reverse gap-6">
        <div role="group" aria-label="Controls" className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <button
            aria-pressed={cut === null}
            onClick={() => setCut(null)}
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
              onClick={() => setCut(i)}
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

        <div className="rounded-3xl border border-border bg-card/60 p-4 md:p-8">
          <div className="hidden md:block">
            <ChainGraph chain={chain} step={step} blocked={blocked} />
          </div>
          <div className="md:hidden">
            <ChainRail chain={chain} step={step} blocked={blocked} />
          </div>
          <p aria-live="polite" className="mt-6 border-t border-border pt-5 font-mono text-xs leading-relaxed md:text-sm">
            {cut === null ? (
              <span className="text-ember">x {chain.impact}</span>
            ) : (
              <span className="text-primary">
                + chain stops at hop {cut + 1}. Everything after it is unreachable by this route.
              </span>
            )}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            In your own cloud there are many chains, and most share hops. One control can cut several of them. Another
            cuts none. That is what OFFENSAI&apos;s prioritization is for.
          </p>
        </div>
      </div>
    </section>
  )
}
