import React from 'react'
import { Composition, registerRoot } from 'remotion'
import { Explainer } from './Explainer'
import { BREACH_DURATION, BreachCut } from './BreachCut'
import { DURATION, FPS, H, W } from './theme'

const Root: React.FC = () => (
  <>
    <Composition id="Explainer" component={Explainer} durationInFrames={DURATION} fps={FPS} width={W} height={H} defaultProps={{ withAudio: true }} />
    <Composition id="ExplainerSilent" component={Explainer} durationInFrames={DURATION} fps={FPS} width={W} height={H} defaultProps={{ withAudio: false }} />
    <Composition id="BreachCut" component={BreachCut} durationInFrames={BREACH_DURATION} fps={FPS} width={W} height={H} />
  </>
)

registerRoot(Root)
