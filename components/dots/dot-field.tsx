'use client'

import { motion, type MotionValue } from 'motion/react'
import { useMemo } from 'react'
import { cn } from '@/lib/utils'

function seeded(seed: number) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
}

/** Deterministic field of "findings". Same output on server and client. */
export function DotField({
  count = 80,
  seed = 7,
  opacity,
  className,
}: {
  count?: number
  seed?: number
  opacity?: MotionValue<number>
  className?: string
}) {
  const dots = useMemo(() => {
    const rand = seeded(seed)
    return Array.from({ length: count }, () => ({
      x: rand() * 100,
      y: rand() * 100,
      size: 2 + rand() * 4,
      delay: rand() * 4,
      hot: rand() > 0.88,
    }))
  }, [count, seed])

  return (
    <motion.div className={cn('pointer-events-none absolute inset-0', className)} style={{ opacity }} aria-hidden>
      {dots.map((d, i) => (
        <span
          key={i}
          className={cn('absolute animate-pulse rounded-full', d.hot ? 'bg-ember/80' : 'bg-primary/60')}
          style={{
            left: `${d.x}%`,
            top: `${d.y}%`,
            width: d.size,
            height: d.size,
            animationDelay: `${d.delay}s`,
            animationDuration: `${2.5 + d.delay}s`,
          }}
        />
      ))}
    </motion.div>
  )
}
