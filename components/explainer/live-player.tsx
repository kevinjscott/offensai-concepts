'use client'

import { Player } from '@remotion/player'
import { Play } from 'lucide-react'
import { Explainer } from '../../video/src/Explainer'
import { BreachCut, BREACH_DURATION } from '../../video/src/BreachCut'
import { DURATION, FPS, H, W } from '../../video/src/theme'

const variants = {
  explainer: { component: Explainer, frames: DURATION, props: { withAudio: true }, poster: 'Breaches are chains, not findings' },
  breach: { component: BreachCut, frames: BREACH_DURATION, props: { withAudio: true }, poster: 'Hugging Face, July 2026. Not one bug. A chain.' },
} as const

export function LivePlayer({ variant }: { variant: keyof typeof variants }) {
  const v = variants[variant]
  return (
    <Player
      component={v.component as React.ComponentType<Record<string, unknown>>}
      inputProps={v.props}
      durationInFrames={v.frames}
      fps={FPS}
      compositionWidth={W}
      compositionHeight={H}
      controls
      clickToPlay
      doubleClickToFullscreen
      spaceKeyToPlayOrPause
      acknowledgeRemotionLicense
      posterFillMode="player-size"
      showPosterWhenUnplayed
      renderPoster={() => (
        <div className="flex size-full flex-col items-center justify-center gap-5 bg-[radial-gradient(ellipse_70%_80%_at_50%_100%,rgb(76_147_255/0.28),transparent_70%),linear-gradient(180deg,#0d1424,#05070d)] px-6 text-center">
          <span className="flex size-16 items-center justify-center rounded-full border border-white/30 bg-white/10 backdrop-blur">
            <Play className="ml-1 size-7 fill-white text-white" aria-hidden />
          </span>
          <span className="max-w-md text-balance text-lg font-semibold text-white md:text-2xl">{v.poster}</span>
        </div>
      )}
      initiallyMuted={false}
      style={{ width: '100%', aspectRatio: `${W} / ${H}` }}
    />
  )
}
