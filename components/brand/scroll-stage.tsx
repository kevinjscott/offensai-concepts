'use client'

import { useMotionValueEvent, useScroll } from 'motion/react'
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { cn } from '@/lib/utils'

const PIN_QUERY = '(min-width: 1024px) and (min-height: 740px)'

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(PIN_QUERY)
  mq.addEventListener('change', onChange)
  return () => mq.removeEventListener('change', onChange)
}

function usePinned() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(PIN_QUERY).matches,
    () => false,
  )
}

export type StageApi = {
  progress: number
  pinned: boolean
  jumpTo: (fraction: number) => void
}

/**
 * Scroll-driven section. On large, tall viewports the content pins to the screen while the page
 * scrolls and `progress` runs 0 to 1. Elsewhere it flows normally and `progress` follows the
 * section as it passes through the viewport, so the story still plays without any clicking.
 */
export function ScrollStage({
  id,
  label,
  heightSvh = 300,
  children,
}: {
  id?: string
  label: string
  heightSvh?: number
  children: (api: StageApi) => React.ReactNode
}) {
  const ref = useRef<HTMLElement>(null)
  const pinned = usePinned()
  const [progress, setProgress] = useState(0)
  const { scrollY } = useScroll()

  const measure = useCallback(() => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const vh = window.innerHeight
    const raw = pinned
      ? -rect.top / Math.max(1, rect.height - vh)
      : (vh * 0.8 - rect.top) / (rect.height + vh * 0.3)
    setProgress(Math.round(Math.min(1, Math.max(0, raw)) * 200) / 200)
  }, [pinned])

  useMotionValueEvent(scrollY, 'change', measure)

  useEffect(() => {
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [measure])

  const jumpTo = useCallback(
    (fraction: number) => {
      const el = ref.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight
      const topWhenAtFraction = pinned
        ? -fraction * (rect.height - vh)
        : vh * 0.8 - fraction * (rect.height + vh * 0.3)
      window.scrollTo({ top: window.scrollY + rect.top - topWhenAtFraction, behavior: 'smooth' })
    },
    [pinned],
  )

  return (
    <section
      ref={ref}
      id={id}
      aria-label={label}
      style={pinned ? { height: `${heightSvh}svh` } : undefined}
      className="relative"
    >
      <div className={cn(pinned ? 'sticky top-0 flex h-svh flex-col justify-center overflow-hidden px-6 py-6' : 'px-6 py-24')}>
        {children({ progress, pinned, jumpTo })}
        {pinned && (
          <>
            <p
              className={cn(
                'pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2 font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground transition-opacity duration-500',
                progress < 0.04 ? 'opacity-100' : 'opacity-0',
              )}
              aria-hidden
            >
              Keep scrolling
            </p>
            <div className="absolute inset-x-6 bottom-4 mx-auto h-px max-w-6xl bg-border" aria-hidden>
              <div className="h-px origin-left bg-primary" style={{ transform: `scaleX(${progress})` }} />
            </div>
          </>
        )}
      </div>
    </section>
  )
}
