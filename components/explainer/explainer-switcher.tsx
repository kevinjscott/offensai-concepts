'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { VideoPlayer } from './video-player'

const LivePlayer = dynamic(() => import('./live-player').then((m) => m.LivePlayer), {
  ssr: false,
  loading: () => <div className="aspect-video w-full animate-pulse rounded-xl bg-card" aria-hidden />,
})

const MODES = [
  { id: 'video', label: 'Video', hint: 'Rendered MP4 with chapters' },
  { id: 'live', label: 'Live animation', hint: 'React scenes and audio, running in your browser' },
] as const

type Mode = (typeof MODES)[number]['id']

export function ExplainerSwitcher({ className }: { className?: string }) {
  const [mode, setMode] = useState<Mode>('video')
  const active = MODES.find((m) => m.id === mode)

  return (
    <div className={cn('w-full', className)}>
      <div className="mb-3 flex flex-col items-center gap-2">
        <div role="tablist" aria-label="Explainer format" className="inline-flex rounded-full border border-border bg-card/70 p-1">
          {MODES.map((m) => (
            <button
              key={m.id}
              role="tab"
              type="button"
              aria-selected={mode === m.id}
              onClick={() => setMode(m.id)}
              className={cn(
                'rounded-full px-4 py-1.5 text-sm font-semibold transition-colors',
                mode === m.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">{active?.hint}</p>
      </div>

      {mode === 'video' ? (
        <VideoPlayer />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-black">
          <LivePlayer />
        </div>
      )}
    </div>
  )
}
