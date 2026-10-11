'use client'

import { Player } from '@remotion/player'
import { Explainer } from '../../video/src/Explainer'
import { ProofCut, PROOF_DURATION } from '../../video/src/ProofCut'
import { DURATION, FPS, H, W } from '../../video/src/theme'

const variants = {
  explainer: { component: Explainer, frames: DURATION, props: { withAudio: true }, poster: 'Breaches are chains, not findings' },
  proof: { component: ProofCut, frames: PROOF_DURATION, props: {}, poster: 'A cloud is a graph.' },
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
        <div className="flex size-full items-center justify-center bg-black px-4 text-center text-balance text-lg font-semibold text-white md:text-2xl">
          {v.poster}
        </div>
      )}
      initiallyMuted={false}
      style={{ width: '100%', aspectRatio: `${W} / ${H}` }}
    />
  )
}
