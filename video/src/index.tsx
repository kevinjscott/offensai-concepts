import React from 'react'
import { Composition, registerRoot } from 'remotion'
import { Explainer } from './Explainer'
import { DURATION, FPS, H, W } from './theme'

const Root: React.FC = () => (
  <>
    <Composition id="Explainer" component={Explainer} durationInFrames={DURATION} fps={FPS} width={W} height={H} defaultProps={{ withAudio: true }} />
    <Composition id="ExplainerSilent" component={Explainer} durationInFrames={DURATION} fps={FPS} width={W} height={H} defaultProps={{ withAudio: false }} />
  </>
)

registerRoot(Root)
