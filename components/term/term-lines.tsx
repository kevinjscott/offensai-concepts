'use client'

import { useEffect, useRef, useState } from 'react'
import { useInView, useReducedMotion } from 'motion/react'
import type { TermKind, TermLine } from '@/lib/terminal'
import { cn } from '@/lib/utils'

export const termColor: Record<TermKind, string> = {
  cmd: 'text-foreground',
  out: 'text-foreground/80',
  ok: 'text-primary',
  warn: 'text-violet',
  err: 'text-ember',
  dim: 'text-muted-foreground',
}

export const termPrefix: Record<TermKind, string> = {
  cmd: '$',
  out: '\u00a0',
  ok: '+',
  warn: '!',
  err: 'x',
  dim: '-',
}

/** A static line, for logs that are driven by state instead of typed on a timer. */
export function TermRow({ line, className }: { line: TermLine; className?: string }) {
  return (
    <div className={cn('flex gap-2', termColor[line.k], className)}>
      <span className={cn('shrink-0', line.k === 'cmd' && 'text-primary')} aria-hidden>
        {termPrefix[line.k]}
      </span>
      <span className="min-w-0 whitespace-pre-wrap break-words">{line.t}</span>
    </div>
  )
}

/**
 * Types commands and reveals output line by line once scrolled into view.
 * Every line is rendered up front (hidden) so the terminal never changes height.
 * Pass a module-level array so the effect does not restart.
 */
export function TermLines({ lines, className }: { lines: TermLine[]; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const reduce = useReducedMotion()
  const [pos, setPos] = useState({ line: 0, chars: 0 })

  useEffect(() => {
    if (!inView) return
    if (reduce) {
      setPos({ line: lines.length, chars: 0 })
      return
    }
    let cancelled = false
    let timer: ReturnType<typeof setTimeout>
    const tick = (line: number, chars: number) => {
      if (cancelled) return
      if (line >= lines.length) {
        setPos({ line: lines.length, chars: 0 })
        return
      }
      const l = lines[line]
      if (l.k === 'cmd' && chars < l.t.length) {
        setPos({ line, chars: chars + 1 })
        timer = setTimeout(() => tick(line, chars + 1), 24)
        return
      }
      setPos({ line: line + 1, chars: 0 })
      timer = setTimeout(() => tick(line + 1, 0), l.k === 'cmd' ? 380 : 190)
    }
    tick(0, 0)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [inView, lines, reduce])

  const done = pos.line >= lines.length

  return (
    <div ref={ref} className={className}>
      <div className="sr-only">
        {lines.map((l, i) => (
          <p key={i}>{l.t}</p>
        ))}
      </div>
      <div aria-hidden>
        {lines.map((l, i) => {
          const typing = i === pos.line && l.k === 'cmd' && pos.chars > 0
          const shown = i < pos.line ? l.t : typing ? l.t.slice(0, pos.chars) : ''
          const rest = l.t.slice(shown.length)
          const started = i < pos.line || typing
          return (
            <div key={i} className={cn('flex gap-2', termColor[l.k])}>
              <span className={cn('shrink-0', !started && 'invisible', l.k === 'cmd' && 'text-primary')}>
                {termPrefix[l.k]}
              </span>
              <span className="min-w-0 whitespace-pre-wrap break-words">
                {shown}
                {typing && <span className="text-primary">_</span>}
                <span className="invisible">{rest}</span>
                {done && i === lines.length - 1 && <span className="animate-pulse text-primary">_</span>}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
