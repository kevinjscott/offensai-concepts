'use client'

import dynamic from 'next/dynamic'

const LivePlayer = dynamic(() => import('./live-player').then((m) => m.LivePlayer), {
  ssr: false,
  loading: () => <div className="aspect-video w-full animate-pulse rounded-xl bg-card" aria-hidden />,
})

const videos = [
  { id: 'explainer', label: 'Video A', note: '60s explainer, with voiceover' },
  { id: 'breach', label: 'Video B', note: 'Hugging Face breach chain, with narration' },
] as const

export function VideoPair() {
  return (
    <section aria-label="Explainer videos" className="grid gap-4 md:grid-cols-2">
      {videos.map((v) => (
        <figure key={v.id} className="min-w-0">
          <div className="overflow-hidden rounded-xl border-2 border-slate-400/35 bg-black shadow-[0_0_0_4px_rgb(76_147_255/0.08),0_24px_60px_-20px_rgb(76_147_255/0.35)]">
            <LivePlayer variant={v.id} />
          </div>
          <figcaption className="mt-2 flex items-baseline gap-2 text-sm">
            <span className="font-semibold">{v.label}</span>
            <span className="text-muted-foreground">{v.note}</span>
          </figcaption>
        </figure>
      ))}
    </section>
  )
}
