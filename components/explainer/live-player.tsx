'use client'

import { Player } from '@remotion/player'
import { Explainer } from '../../video/src/Explainer'
import { DURATION, FPS, H, W } from '../../video/src/theme'

export function LivePlayer() {
  return (
    <Player
      component={Explainer}
      inputProps={{ withAudio: true }}
      durationInFrames={DURATION}
      fps={FPS}
      compositionWidth={W}
      compositionHeight={H}
      controls
      clickToPlay
      doubleClickToFullscreen
      spaceKeyToPlayOrPause
      acknowledgeRemotionLicense
      posterFillMode="player-size"
      initiallyMuted={false}
      style={{ width: '100%', aspectRatio: `${W} / ${H}` }}
    />
  )
}
