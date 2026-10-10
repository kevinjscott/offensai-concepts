import React, { useEffect, useState } from 'react'
import { AbsoluteFill, Audio, Sequence, cancelRender, continueRender, delayRender, staticFile } from 'remotion'
import { Backdrop, Captions, Scene, Vignette } from './ui'
import { lines } from './cues'
import { sec } from './theme'
import { ChainScene, Findings, Hook, Machines } from './scenes/Act1'
import { Agents, GraphCompose, Validate } from './scenes/Act2'
import { BreakChain, Close, Evidence, Prioritize } from './scenes/Act3'

const WEIGHTS: [string, string][] = [
  ['400', 'silka-regular'],
  ['500', 'silka-medium'],
  ['600', 'silka-semibold'],
  ['700', 'silka-bold'],
]

const useBrandFont = () => {
  const [handle] = useState(() => delayRender('Loading Silka'))
  useEffect(() => {
    const faces = [
      ...WEIGHTS.map(([weight, file]) => new FontFace('Silka', `url(${staticFile(`fonts/${file}.woff2`)})`, { weight })),
      new FontFace('Geist Mono', `url(${staticFile('mono/geist-mono-latin-400-normal.woff2')})`, { weight: '400' }),
      new FontFace('Geist Mono', `url(${staticFile('mono/geist-mono-latin-500-normal.woff2')})`, { weight: '500' }),
    ]
    Promise.all(
      faces.map(async (face) => {
        await face.load()
        document.fonts.add(face)
      }),
    )
      .then(() => continueRender(handle))
      .catch((e) => cancelRender(e))
  }, [handle])
}

export const Explainer: React.FC<{ withAudio?: boolean }> = ({ withAudio = true }) => {
  useBrandFont()
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <Backdrop />

      <Scene from={0} to={6.2} fadeIn={0} fadeOut={10}>
        <Hook />
      </Scene>
      <Scene from={5.9} to={13.35} fadeIn={10} fadeOut={8}>
        <Findings />
      </Scene>
      <Scene from={13.0} to={22.9} fadeIn={8} fadeOut={0}>
        <ChainScene />
      </Scene>
      <Scene from={22.9} to={27.75} fadeIn={0} fadeOut={10}>
        <Machines />
      </Scene>
      <Scene from={27.35} to={31.95} fadeIn={10} fadeOut={10}>
        <Agents start={27.35} />
      </Scene>
      <Scene from={31.55} to={38.1} fadeIn={10} fadeOut={10}>
        <GraphCompose />
      </Scene>
      <Scene from={37.8} to={42.7} fadeIn={10} fadeOut={10}>
        <Validate />
      </Scene>
      <Scene from={42.4} to={48.4} fadeIn={10} fadeOut={10}>
        <Prioritize />
      </Scene>
      <Scene from={48.1} to={51.5} fadeIn={8} fadeOut={8}>
        <BreakChain />
      </Scene>
      <Scene from={51.2} to={54.4} fadeIn={8} fadeOut={8}>
        <Evidence />
      </Scene>
      <Scene from={54.1} to={60} fadeIn={10} fadeOut={0}>
        <Close start={54.1} />
      </Scene>

      <Vignette />
      <Captions />

      {withAudio && (
        <>
          {lines.map((l) => (
            <Sequence key={l.id} from={l.startFrame} durationInFrames={l.durFrames + 6} layout="none">
              <Audio src={staticFile(l.file)} volume={0.8} />
            </Sequence>
          ))}
          <Audio src={staticFile('audio/music.wav')} volume={0.85} />
          <Audio src={staticFile('audio/sfx.wav')} volume={0.9} />
        </>
      )}
    </AbsoluteFill>
  )
}
