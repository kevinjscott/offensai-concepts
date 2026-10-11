import React from 'react'
import { AbsoluteFill, useCurrentFrame } from 'remotion'
import { Scene } from './ui'
import { useBrandFont } from './Explainer'
import { C, FONT, FPS, MONO, easeInOut, easeOut, rand, ramp } from './theme'

export const PROOF_DURATION = 30 * FPS

const useT = (start = 0) => useCurrentFrame() / FPS - start

const Stage: React.FC = () => (
  <AbsoluteFill style={{ background: C.bg }}>
    <AbsoluteFill
      style={{
        backgroundImage: 'radial-gradient(rgba(148,163,184,0.2) 1.2px, transparent 1.2px)',
        backgroundSize: '40px 40px',
        maskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, #000 20%, transparent 85%)',
        WebkitMaskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, #000 20%, transparent 85%)',
      }}
    />
    <AbsoluteFill style={{ background: 'radial-gradient(ellipse 60% 45% at 50% 108%, rgba(76,147,255,0.14), transparent 70%)' }} />
  </AbsoluteFill>
)

const Headline: React.FC<{ children: React.ReactNode; sub?: string; t: number }> = ({ children, sub, t }) => {
  const p = ramp(t * FPS, 0, 18)
  return (
    <div style={{ position: 'absolute', top: 120, left: 0, right: 0, textAlign: 'center', opacity: p, transform: `translateY(${(1 - p) * 18}px)` }}>
      <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 84, color: C.white, letterSpacing: '-0.02em' }}>{children}</div>
      {sub && <div style={{ marginTop: 20, fontFamily: FONT, fontSize: 34, color: C.mute }}>{sub}</div>}
    </div>
  )
}

/* Scene 1: a cloud is a graph, one chain in the noise */
const NODES = Array.from({ length: 70 }, (_, i) => ({
  x: 120 + rand(i + 1) * 1680,
  y: 470 + rand(i + 101) * 480,
}))
const CHAIN = [4, 17, 29, 41, 52, 63].map((i) => NODES[i])

const GraphScene: React.FC = () => {
  const t = useT(0)
  const lit = Math.max(0, Math.min(CHAIN.length, Math.floor((t - 3) / 0.45)))
  return (
    <AbsoluteFill>
      <Headline t={t} sub="Millions of relationships. Most of them are noise.">
        A cloud is a graph.
      </Headline>
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        {NODES.map((n, i) => (
          <circle key={i} cx={n.x} cy={n.y} r={5} fill={C.dim} opacity={ramp(t * FPS, 20 + i * 1.2, 18) * 0.8} />
        ))}
        {CHAIN.slice(0, -1).map((a, i) => {
          if (i >= lit - 1) return null
          const b = CHAIN[i + 1]
          return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={C.blue} strokeWidth={4} strokeLinecap="round" />
        })}
        {CHAIN.map((n, i) => (i < lit ? <circle key={i} cx={n.x} cy={n.y} r={13} fill={C.blue} /> : null))}
      </svg>
    </AbsoluteFill>
  )
}

/* Scene 2: answers vs proof */
const Panel: React.FC<{ title: string; tone: string; children: React.ReactNode; foot: string; footTone: string; p: number }> = ({
  title,
  tone,
  children,
  foot,
  footTone,
  p,
}) => (
  <div
    style={{
      width: 780,
      height: 500,
      borderRadius: 28,
      border: `2px solid ${tone}55`,
      background: `linear-gradient(160deg, ${C.tileTop}, ${C.tileBottom})`,
      padding: 40,
      opacity: p,
      transform: `translateY(${(1 - p) * 24}px)`,
      display: 'flex',
      flexDirection: 'column',
    }}
  >
    <div style={{ fontFamily: MONO, fontSize: 24, color: tone }}>{title}</div>
    <div style={{ flex: 1, marginTop: 28, fontFamily: MONO, fontSize: 30, color: C.text, lineHeight: 1.9 }}>{children}</div>
    <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 40, color: footTone }}>{foot}</div>
  </div>
)

const ProofScene: React.FC = () => {
  const t = useT(6.2)
  const f = t * FPS
  const show = (at: number) => ramp(f, at * FPS, 10)
  const checks = ['trust policy allows the user', 'iam:PassRole is permitted', 'secret value is readable']
  return (
    <AbsoluteFill>
      <Headline t={t}>Answers are not outcomes.</Headline>
      <div style={{ position: 'absolute', top: 340, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 60 }}>
        <Panel title="Frontier model" tone={C.ember} p={ramp(f, 14, 20)} foot="An answer." footTone={C.ember}>
          <div style={{ opacity: show(1.4) }}>{'> this path looks exploitable'}</div>
          <div style={{ opacity: show(2.6) }}>{'> confidence: probably'}</div>
          <div style={{ opacity: show(3.8), color: C.mute }}>{'> no persistent state'}</div>
        </Panel>
        <Panel title="Proof engine / z3 Datalog" tone={C.blue} p={ramp(f, 24, 20)} foot={t > 5.6 ? 'Path proven.' : 'Checking...'} footTone={t > 5.6 ? C.blueSoft : C.mute}>
          {checks.map((c, i) => (
            <div key={c} style={{ opacity: show(1.8 + i * 1.1) }}>
              <span style={{ color: C.blue }}>{'[ok] '}</span>
              {c}
            </div>
          ))}
        </Panel>
      </div>
    </AbsoluteFill>
  )
}

/* Scene 3: the loop */
const LOOP = [
  { name: 'Discover', sub: 'Persistent cloud intelligence' },
  { name: 'Prove', sub: 'Formal proof engine' },
  { name: 'Execute', sub: 'Agent O runs proven paths' },
  { name: 'Learn', sub: 'Compounding attack graph' },
]

const LoopScene: React.FC = () => {
  const t = useT(14.2)
  const f = t * FPS
  const cx = 960
  const cy = 640
  const rx = 520
  const ry = 250
  const pos = (i: number) => {
    const a = (i / 4) * Math.PI * 2 - Math.PI / 2
    return { x: cx + Math.cos(a) * rx, y: cy + Math.sin(a) * ry }
  }
  const phase = Math.max(0, (t - 1) / 2.0)
  const active = Math.floor(phase) % 4
  const travel = (phase % 1)
  const from = pos(active)
  const to = pos((active + 1) % 4)
  const e = easeInOut(travel)
  const dot = { x: from.x + (to.x - from.x) * e, y: from.y + (to.y - from.y) * e }
  return (
    <AbsoluteFill>
      <Headline t={t} sub="Every validated path sharpens the next discovery cycle.">
        A loop that compounds.
      </Headline>
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke={C.line} strokeWidth={3} strokeDasharray="6 10" />
        {t > 1 && <circle cx={dot.x} cy={dot.y} r={12} fill={C.blue} />}
      </svg>
      {LOOP.map((s, i) => {
        const p = pos(i)
        const on = t > 1 && i === (active + (travel > 0.85 ? 1 : 0)) % 4
        const enter = ramp(f, 10 + i * 6, 16, easeOut)
        return (
          <div
            key={s.name}
            style={{
              position: 'absolute',
              left: p.x - 190,
              top: p.y - 60,
              width: 380,
              height: 120,
              borderRadius: 22,
              border: `2px solid ${on ? C.blue : 'rgba(255,255,255,0.14)'}`,
              boxShadow: on ? `0 0 40px ${C.blue}55` : 'none',
              background: `linear-gradient(160deg, ${C.tileTop}, ${C.tileBottom})`,
              opacity: enter,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              transform: `scale(${on ? 1.05 : 1})`,
            }}
          >
            <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 40, color: on ? C.white : C.text }}>{s.name}</div>
            <div style={{ marginTop: 6, fontFamily: FONT, fontSize: 24, color: C.mute }}>{s.sub}</div>
          </div>
        )
      })}
    </AbsoluteFill>
  )
}

/* Scene 4: one ontology, one chain across clouds */
const CLOUDS = ['AWS', 'Azure', 'GCP', 'Kubernetes']

const OntologyScene: React.FC = () => {
  const t = useT(23)
  const f = t * FPS
  const colX = [380, 760, 1140, 1520]
  const rowY = [520, 680, 840]
  const path: [number, number][] = [
    [0, 0],
    [1, 0],
    [1, 1],
    [2, 1],
    [2, 2],
    [3, 2],
  ]
  const lit = Math.max(0, Math.min(path.length, Math.floor((t - 2.2) / 0.5)))
  return (
    <AbsoluteFill>
      <Headline t={t} sub="11 universal attack primitives, one ontology across every cloud.">
        One chain. Every cloud.
      </Headline>
      {CLOUDS.map((c, i) => (
        <div
          key={c}
          style={{
            position: 'absolute',
            left: colX[i] - 100,
            top: 420,
            width: 200,
            textAlign: 'center',
            fontFamily: MONO,
            fontSize: 26,
            color: C.mute,
            opacity: ramp(f, 8 + i * 5, 14),
          }}
        >
          {c}
        </div>
      ))}
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        {colX.map((x, i) =>
          rowY.map((y, j) => <circle key={`${i}-${j}`} cx={x} cy={y} r={10} fill={C.dim} opacity={ramp(f, 12 + i * 5 + j * 3, 14)} />),
        )}
        {path.slice(0, -1).map(([c0, r0], i) => {
          if (i >= lit - 1) return null
          const [c1, r1] = path[i + 1]
          return <line key={i} x1={colX[c0]} y1={rowY[r0]} x2={colX[c1]} y2={rowY[r1]} stroke={C.blue} strokeWidth={5} strokeLinecap="round" />
        })}
        {path.map(([c, r], i) => (i < lit ? <circle key={i} cx={colX[c]} cy={rowY[r]} r={16} fill={C.blue} /> : null))}
      </svg>
      <div
        style={{
          position: 'absolute',
          bottom: 190,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: FONT,
          fontWeight: 600,
          fontSize: 46,
          color: C.blueSoft,
          opacity: ramp(f, 5.2 * FPS, 16),
        }}
      >
        Proven paths. Evidence for every hop.
      </div>
    </AbsoluteFill>
  )
}

export const ProofCut: React.FC = () => {
  useBrandFont()
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <Stage />
      <Scene from={0} to={6.6} fadeIn={0} fadeOut={10}>
        <GraphScene />
      </Scene>
      <Scene from={6.2} to={14.6} fadeIn={10} fadeOut={10}>
        <ProofScene />
      </Scene>
      <Scene from={14.2} to={23.4} fadeIn={10} fadeOut={10}>
        <LoopScene />
      </Scene>
      <Scene from={23} to={30} fadeIn={10} fadeOut={0}>
        <OntologyScene />
      </Scene>
    </AbsoluteFill>
  )
}
