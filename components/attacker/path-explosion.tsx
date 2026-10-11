'use client'

import { useEffect, useRef, useState } from 'react'
import { animate, useInView, useMotionValue } from 'motion/react'
import { SectionHeading } from '@/components/brand/reveal'

const HOPS = 7

function formatDuration(minutes: number) {
  const hours = minutes / 60
  if (hours < 48) return `${Math.round(hours)} hours`
  const days = hours / 24
  if (days < 730) return `${Math.round(days)} days`
  return `${(days / 365).toFixed(1)} years`
}

export function PathExplosion() {
  const [branching, setBranching] = useState(2)
  const sectionRef = useRef<HTMLElement>(null)
  const inView = useInView(sectionRef, { once: true, amount: 0.6 })
  const userTookOver = useRef(false)

  useEffect(() => {
    if (!inView) return
    const ramp = animate(2, 10, {
      duration: 4,
      delay: 0.8,
      ease: 'easeInOut',
      onUpdate: (v) => {
        if (!userTookOver.current) setBranching(Math.round(v))
      },
    })
    return () => ramp.stop()
  }, [inView])

  const paths = branching ** HOPS
  const value = useMotionValue(paths)
  const [shown, setShown] = useState(paths)

  useEffect(() => {
    const controls = animate(value, paths, { duration: 0.6, ease: 'easeOut' })
    const unsub = value.on('change', (v) => setShown(Math.round(v)))
    return () => {
      controls.stop()
      unsub()
    }
  }, [paths, value])

  return (
    <section ref={sectionRef} id="explosion" className="px-6 py-20 md:py-28">
      <SectionHeading eyebrow="Why it's hard" title="Every hop multiplies the routes">
        You found one path in seven moves. Each hop usually offers several onward options. Watch how quickly that grows.
      </SectionHeading>

      <div className="mx-auto mt-12 max-w-3xl rounded-3xl border border-border bg-card/60 p-6 md:p-10">
        <label htmlFor="branching" className="flex items-baseline justify-between gap-4 text-sm">
          <span className="text-foreground">Onward options per hop</span>
          <span className="font-mono text-primary">{branching}</span>
        </label>
        <input
          id="branching"
          type="range"
          min={2}
          max={12}
          value={branching}
          onChange={(e) => {
            userTookOver.current = true
            setBranching(Number(e.target.value))
          }}
          className="mt-3 h-1 w-full cursor-pointer accent-primary"
        />
        <p className="mt-2 text-xs text-muted-foreground">Roles you could assume, secrets you could read, services you could reach.</p>

        <div className="mt-10 grid gap-6 border-t border-border pt-8 sm:grid-cols-2">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Possible {HOPS}-hop routes</p>
            <p className="mt-2 font-mono text-5xl font-semibold tabular-nums text-gradient md:text-6xl" aria-live="polite">
              {shown.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">At one try a minute</p>
            <p className="mt-2 font-mono text-3xl font-semibold tabular-nums text-foreground md:text-4xl">
              {formatDuration(paths)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">to try every route once, by hand.</p>
          </div>
        </div>

        <p className="mt-8 text-sm leading-relaxed text-muted-foreground md:text-base">
          That is the arithmetic of branching: options per hop, raised to the number of hops. Real clouds are bigger
          and the options are uneven, but the shape is the same. OFFENSAI&apos;s agents explore the routes for you, then
          prove only the ones that hold.
        </p>
      </div>
    </section>
  )
}
