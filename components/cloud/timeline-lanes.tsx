'use client'

import { animate, motion, useInView } from 'motion/react'
import { Check } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

const changes = [7, 15, 24, 31, 40, 49, 57, 66, 74, 83, 91]
const STAGGER = 0.4

export function TimelineLanes() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.4 })
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!inView) return
    const controls = animate(0, changes.length, {
      duration: changes.length * STAGGER,
      ease: 'linear',
      onUpdate: (v) => setCount(Math.floor(v)),
    })
    return () => controls.stop()
  }, [inView])

  return (
    <div ref={ref} className="mx-auto w-full max-w-5xl rounded-3xl border border-border bg-ink/90 p-5 md:p-8">
      <div className="flex flex-col gap-10">
        <Lane
          title="A point-in-time test"
          note="One report, then the cloud keeps moving."
          stat={`${count} changes since the report`}
          statTone="text-ember"
          inView={inView}
          variant="snapshot"
        />
        <Lane
          title="Continuous validation"
          note="Each change signal triggers revalidation of the affected paths."
          stat="Paths revalidated as the cloud changes"
          statTone="text-primary"
          inView={inView}
          variant="continuous"
        />
      </div>
      <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-2">
          <span className="size-2.5 rotate-45 bg-ember" aria-hidden /> Cloud change, not yet validated
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="size-2.5 rotate-45 bg-primary" aria-hidden /> Cloud change, revalidated
        </span>
      </div>
    </div>
  )
}

function Lane({
  title,
  note,
  stat,
  statTone,
  inView,
  variant,
}: {
  title: string
  note: string
  stat: string
  statTone: string
  inView: boolean
  variant: 'snapshot' | 'continuous'
}) {
  const snapshot = variant === 'snapshot'
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{note}</p>
        </div>
        <p className={`font-mono text-xs ${statTone}`} aria-live="polite">
          {stat}
        </p>
      </div>
      <div className="relative h-14">
        <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-border" />
        <motion.div
          className={`absolute left-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full ${
            snapshot ? 'bg-gradient-to-r from-primary via-primary/30 to-transparent' : 'bg-gradient-to-r from-primary to-[#8fb8ff]'
          }`}
          initial={{ width: '0%' }}
          animate={{ width: inView ? (snapshot ? '100%' : '100%') : '0%' }}
          transition={{ duration: changes.length * STAGGER, ease: 'linear' }}
        />
        {snapshot && (
          <span className="absolute left-0 top-0 -translate-y-1 rounded-md border border-primary/50 bg-card px-2 py-0.5 font-mono text-[10px] text-primary">
            report
          </span>
        )}
        {changes.map((x, i) => (
          <motion.span
            key={x}
            className="absolute top-1/2"
            style={{ left: `${x}%` }}
            initial={{ opacity: 0, scale: 0 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: i * STAGGER, type: 'spring', stiffness: 400, damping: 18 }}
          >
            <span
              className={`block size-3.5 -translate-x-1/2 -translate-y-1/2 rotate-45 ${snapshot ? 'bg-ember' : 'bg-primary'}`}
            />
            {!snapshot && (
              <motion.span
                className="absolute left-3 top-0 flex size-4 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground"
                initial={{ opacity: 0, scale: 0 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: i * STAGGER + 0.45 }}
              >
                <Check className="size-2.5" strokeWidth={4} aria-hidden />
              </motion.span>
            )}
          </motion.span>
        ))}
      </div>
    </div>
  )
}
