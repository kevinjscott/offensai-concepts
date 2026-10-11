import React from 'react'
import { AbsoluteFill, Audio, Img, staticFile, useCurrentFrame } from 'remotion'
import { Scene } from './ui'
import { useBrandFont } from './Explainer'
import { C, FONT, FPS, MONO, easeInOut, easeOut, rand, ramp, sec } from './theme'
import timeline from './timeline-breach.json'

export const BREACH_DURATION = Math.ceil(timeline.total + 1.8) * FPS

type Line = { id: string; caption: string; start: number; dur: number }
const lines = timeline.lines as Line[]
const at = (id: string) => (lines.find((l) => l.id === id) as Line).start
const durOf = (id: string) => (lines.find((l) => l.id === id) as Line).dur

const useTime = () => useCurrentFrame() / FPS

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

const Tag: React.FC<{ children: React.ReactNode; t: number; start: number; color?: string }> = ({ children, t, start, color = C.mute }) => (
  <div
    style={{
      position: 'absolute',
      top: 96,
      left: 120,
      fontFamily: MONO,
      fontSize: 26,
      letterSpacing: '0.04em',
      color,
      opacity: ramp(t * FPS, start * FPS, 14),
    }}
  >
    {children}
  </div>
)

/* Scene 1: the incident */
const IncidentScene: React.FC = () => {
  const t = useTime()
  const f = t * FPS
  const chainIn = ramp(f, at('b2') * FPS, 14)
  return (
    <AbsoluteFill>
      <Tag t={t} start={0.2}>
        INCIDENT / JULY 2026
      </Tag>
      <div style={{ position: 'absolute', top: 300, left: 0, right: 0, textAlign: 'center' }}>
        <div
          style={{
            fontFamily: FONT,
            fontWeight: 700,
            fontSize: 150,
            color: C.white,
            letterSpacing: '-0.03em',
            opacity: ramp(f, 12, 20),
            transform: `translateY(${(1 - ramp(f, 12, 20)) * 24}px)`,
          }}
        >
          Hugging Face
        </div>
        <div style={{ marginTop: 28, fontFamily: FONT, fontSize: 44, color: C.mute, opacity: ramp(f, 36, 18) }}>
          Breached by an autonomous AI agent
        </div>
        <div
          style={{
            marginTop: 90,
            fontFamily: FONT,
            fontWeight: 600,
            fontSize: 72,
            color: C.blueSoft,
            opacity: chainIn,
            transform: `translateY(${(1 - chainIn) * 18}px)`,
          }}
        >
          Not one bug. A chain.
        </div>
      </div>
    </AbsoluteFill>
  )
}

/* Scene 2: the chain, hop by hop */
const HOPS = [
  { t: at('b3'), label: 'Sandbox escape', sub: 'Zero-day in a package cache proxy' },
  { t: at('b4'), label: 'Launchpad', sub: 'Third-party code sandbox' },
  { t: at('b5') + durOf('b5') * 0.06, label: 'File read', sub: 'HDF5 external storage read' },
  { t: at('b5') + durOf('b5') * 0.56, label: 'Template injection', sub: 'Jinja2 in the data loader' },
  { t: at('b6'), label: 'Code execution', sub: 'Production Kubernetes pod' },
  { t: at('b7'), label: 'Cloud credentials', sub: 'Metadata and service tokens' },
  { t: at('b7') + durOf('b7') * 0.35, label: 'Secret store', sub: 'Production secrets' },
  { t: at('b7') + durOf('b7') * 0.67, label: 'Mesh VPN key', sub: 'Auth key from the secret store' },
  { t: at('b8'), label: '181 nodes enrolled', sub: 'Pivot into the corporate network' },
]

const CARD_W = 330
const CARD_H = 144
const hopPos = (i: number) => {
  const row = i < 5 ? 0 : 1
  const col = row === 0 ? i : i - 5
  const count = row === 0 ? 5 : 4
  const gap = 48
  const total = count * CARD_W + (count - 1) * gap
  return { x: (1920 - total) / 2 + col * (CARD_W + gap), y: row === 0 ? 290 : 560 }
}

const ChainScene: React.FC = () => {
  const t = useTime()
  const f = t * FPS
  const bind = at('b9')
  const together = ramp(f, bind * FPS, 18)
  const pulse = t > bind ? 0.5 + 0.5 * Math.sin((t - bind) * 5) : 0
  return (
    <AbsoluteFill>
      <Tag t={t} start={at('b3') - 0.25}>
        HOW THE CHAIN RAN
      </Tag>
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        {HOPS.slice(0, -1).map((h, i) => {
          const a = hopPos(i)
          const b = hopPos(i + 1)
          const p = ramp(f, HOPS[i + 1].t * FPS - 10, 12)
          const ax = a.x + CARD_W
          const ay = a.y + CARD_H / 2
          const bx = b.x
          const by = b.y + CARD_H / 2
          const wrap = i === 4
          const d = wrap
            ? `M ${ax} ${ay} L ${ax + 30} ${ay} L ${ax + 30} ${(ay + by) / 2} L ${bx - 30} ${(ay + by) / 2} L ${bx - 30} ${by} L ${bx} ${by}`
            : `M ${ax} ${ay} L ${bx} ${by}`
          return (
            <path
              key={i}
              d={d}
              fill="none"
              stroke={together > 0.5 ? C.ember : C.blue}
              strokeWidth={4}
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - p}
              opacity={0.9}
            />
          )
        })}
      </svg>
      {HOPS.map((h, i) => {
        const p = ramp(f, h.t * FPS, 14, easeOut)
        const { x, y } = hopPos(i)
        const live = t >= h.t && t < (HOPS[i + 1]?.t ?? bind) + 0.4 && t < bind
        const hot = together > 0.5
        return (
          <div
            key={h.label}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: CARD_W,
              height: CARD_H,
              borderRadius: 20,
              border: `2px solid ${hot ? C.ember : live ? C.blue : 'rgba(255,255,255,0.16)'}`,
              boxShadow: hot ? `0 0 ${24 + pulse * 22}px ${C.ember}55` : live ? `0 0 34px ${C.blue}55` : 'none',
              background: `linear-gradient(160deg, ${C.tileTop}, ${C.tileBottom})`,
              opacity: p,
              transform: `translateY(${(1 - p) * 20}px)`,
              padding: '18px 20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 29, color: C.white, lineHeight: 1.15, whiteSpace: 'nowrap' }}>{h.label}</div>
            <div style={{ marginTop: 8, fontFamily: FONT, fontSize: 21, color: C.mute, lineHeight: 1.25 }}>{h.sub}</div>
          </div>
        )
      })}
      <div
        style={{
          position: 'absolute',
          top: 780,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: FONT,
          fontWeight: 600,
          fontSize: 54,
          color: C.ember,
          opacity: together,
        }}
      >
        Small hops. One breach.
      </div>
    </AbsoluteFill>
  )
}

/* Scene 3: the question */
const NOISE = Array.from({ length: 60 }, (_, i) => ({ x: 100 + rand(i + 7) * 1720, y: 200 + rand(i + 91) * 700 }))

const QuestionScene: React.FC = () => {
  const t = useTime()
  const f = t * FPS
  const s = at('b10')
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        {NOISE.map((n, i) => (
          <circle key={i} cx={n.x} cy={n.y} r={5} fill={C.dim} opacity={ramp(f, (s - 0.4) * FPS + i * 0.6, 14) * 0.7} />
        ))}
      </svg>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 50% 30% at 50% 50%, rgba(0,0,0,0.85), transparent 80%)' }} />
      <div
        style={{
          position: 'absolute',
          top: 410,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: FONT,
          fontWeight: 600,
          fontSize: 92,
          color: C.white,
          letterSpacing: '-0.02em',
          opacity: ramp(f, s * FPS, 16),
          transform: `translateY(${(1 - ramp(f, s * FPS, 16)) * 20}px)`,
        }}
      >
        Does your cloud have one?
      </div>
    </AbsoluteFill>
  )
}

/* Scene 4: OFFENSAI maps, composes, proves */
const CLOUDS = ['AWS', 'Azure', 'GCP', 'Kubernetes']
const COL_X = [360, 760, 1160, 1560]
const ROW_Y = [460, 600, 740]
const PATH: [number, number][] = [
  [0, 0],
  [1, 0],
  [1, 1],
  [2, 1],
  [2, 2],
  [3, 2],
]
const FIELD = COL_X.flatMap((x, c) => ROW_Y.map((y, r) => ({ x, y, c, r })))

const OffensaiScene: React.FC = () => {
  const t = useTime()
  const f = t * FPS
  const map = at('b11')
  const compose = at('b12')
  const prove = at('b13')
  const lit = Math.max(0, Math.min(PATH.length, Math.floor((t - compose - 0.6) / 0.55)))
  const proven = Math.max(0, Math.min(PATH.length, Math.floor((t - prove - 0.8) / 0.5)))
  const phase = t < compose ? 'Mapping the cloud as a graph' : t < prove ? 'Composing attack chains' : 'Proving each hop'
  return (
    <AbsoluteFill>
      <Tag t={t} start={map} color={C.blueSoft}>
        OFFENSAI
      </Tag>
      <div
        style={{
          position: 'absolute',
          top: 170,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: FONT,
          fontWeight: 600,
          fontSize: 66,
          color: C.white,
          letterSpacing: '-0.02em',
          opacity: ramp(f, map * FPS, 16),
        }}
      >
        {phase}
      </div>
      {CLOUDS.map((c, i) => (
        <div
          key={c}
          style={{
            position: 'absolute',
            left: COL_X[i] - 100,
            top: 380,
            width: 200,
            textAlign: 'center',
            fontFamily: MONO,
            fontSize: 26,
            color: C.mute,
            opacity: ramp(f, (map + 0.3 + i * 0.25) * FPS, 14),
          }}
        >
          {c}
        </div>
      ))}
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        {FIELD.map((n, i) => (
          <circle key={i} cx={n.x} cy={n.y} r={10} fill={C.dim} opacity={ramp(f, (map + 0.4) * FPS + i * 3, 14)} />
        ))}
        {PATH.slice(0, -1).map(([c0, r0], i) => {
          if (i >= lit - 1) return null
          const [c1, r1] = PATH[i + 1]
          return <line key={i} x1={COL_X[c0]} y1={ROW_Y[r0]} x2={COL_X[c1]} y2={ROW_Y[r1]} stroke={C.blue} strokeWidth={5} strokeLinecap="round" />
        })}
        {PATH.map(([c, r], i) =>
          i < lit ? (
            <g key={i}>
              <circle cx={COL_X[c]} cy={ROW_Y[r]} r={16} fill={C.blue} />
              {i < proven && <circle cx={COL_X[c]} cy={ROW_Y[r]} r={28} fill="none" stroke={C.blueSoft} strokeWidth={3} />}
            </g>
          ) : null,
        )}
      </svg>
      <div
        style={{
          position: 'absolute',
          top: 830,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: FONT,
          fontWeight: 600,
          fontSize: 44,
          color: C.blueSoft,
          opacity: ramp(f, (prove + 2.2) * FPS, 16),
        }}
      >
        {proven >= PATH.length ? 'Chain proven. Evidence for every hop.' : ''}
      </div>
    </AbsoluteFill>
  )
}

/* Scene 5: see it first, break it */
const BreakScene: React.FC = () => {
  const t = useTime()
  const f = t * FPS
  const s = at('b14')
  const fix = at('b15')
  const broken = t > fix + 0.5
  const xs = [330, 630, 930, 1230, 1530]
  const y = 500
  const cut = 2
  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          top: 190,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: FONT,
          fontWeight: 600,
          fontSize: 76,
          color: C.white,
          letterSpacing: '-0.02em',
          opacity: ramp(f, s * FPS, 16),
        }}
      >
        {broken ? 'One fix. Chain broken.' : 'See it before they do.'}
      </div>
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        {xs.slice(0, -1).map((x, i) => {
          const dead = broken && i >= cut - 1 && i <= cut
          return (
            <line
              key={i}
              x1={x}
              y1={y}
              x2={xs[i + 1]}
              y2={y}
              stroke={dead ? C.dim : broken ? C.dim : C.ember}
              strokeWidth={5}
              strokeDasharray={dead ? '4 14' : undefined}
              strokeLinecap="round"
              opacity={ramp(f, (s + 0.2 + i * 0.15) * FPS, 12)}
            />
          )
        })}
        {xs.map((x, i) => {
          const isCut = i === cut
          const fill = broken ? (isCut ? C.blue : C.dim) : C.ember
          return (
            <g key={i} opacity={ramp(f, (s + i * 0.15) * FPS, 12)}>
              <circle cx={x} cy={y} r={isCut ? 24 : 16} fill={fill} />
              {isCut && !broken && <circle cx={x} cy={y} r={40} fill="none" stroke={C.blueSoft} strokeWidth={3} opacity={0.6 + 0.4 * Math.sin(t * 6)} />}
            </g>
          )
        })}
      </svg>
      <div
        style={{
          position: 'absolute',
          top: 620,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: MONO,
          fontSize: 30,
          color: broken ? C.blueSoft : C.mute,
          opacity: ramp(f, (fix - 0.3) * FPS, 14),
        }}
      >
        {broken ? 'hop 3 remediated' : 'the one hop that breaks it'}
      </div>
    </AbsoluteFill>
  )
}

/* Scene 6: close */
const CloseScene: React.FC = () => {
  const t = useTime()
  const f = t * FPS
  const e = at('b16')
  const logoIn = ramp(f, (e - 0.05) * FPS, 22)
  const tagIn = ramp(f, (e + 1.0) * FPS, 22)
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 55% 40% at 50% 42%, rgba(76,147,255,0.12), transparent 75%)' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 330, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Img
          src={staticFile('brand/logo.svg')}
          style={{ width: 760, opacity: logoIn, transform: `translateY(${(1 - logoIn) * 20}px)`, filter: `drop-shadow(0 0 40px ${C.blue}77)` }}
        />
        <div style={{ fontFamily: FONT, fontSize: 58, fontWeight: 600, color: C.white, letterSpacing: -1.5, marginTop: 52, opacity: tagIn, transform: `translateY(${(1 - tagIn) * 18}px)` }}>
          See your cloud the way <span style={{ color: C.blue }}>attackers</span> do.
        </div>
      </div>
    </AbsoluteFill>
  )
}

const BreachCaptions: React.FC = () => {
  const frame = useCurrentFrame()
  const t = frame / FPS
  const line = lines.find((l) => t >= l.start - 0.12 && t <= l.start + l.dur + 0.4)
  if (!line) return null
  const words = line.caption.split(' ')
  const total = words.reduce((n, w) => n + w.length + 1, 0)
  const fadeIn = ramp(frame, sec(line.start - 0.12), 6, easeOut)
  const fadeOut = 1 - ramp(frame, sec(line.start + line.dur + 0.2), 6, (x) => x)
  let acc = 0
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 66, display: 'flex', justifyContent: 'center', opacity: Math.min(fadeIn, fadeOut), transform: `translateY(${(1 - fadeIn) * 10}px)` }}>
      <div
        style={{
          fontFamily: FONT,
          fontSize: 40,
          fontWeight: 500,
          letterSpacing: -0.2,
          padding: '14px 30px',
          borderRadius: 18,
          background: 'rgba(0,0,0,0.55)',
          border: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          gap: 12,
          whiteSpace: 'nowrap',
        }}
      >
        {words.map((w, i) => {
          const startFrac = acc / total
          acc += w.length + 1
          const spoken = t >= line.start + startFrac * line.dur - 0.05
          const isBrand = w.startsWith('OFFENSAI')
          return (
            <span key={i} style={{ color: isBrand ? C.blue : spoken ? C.white : '#5b6678' }}>
              {w}
            </span>
          )
        })}
      </div>
    </div>
  )
}

export const BreachCut: React.FC<{ withAudio?: boolean }> = ({ withAudio = true }) => {
  useBrandFont()
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <Stage />
      <Scene from={0} to={at('b3') - 0.15} fadeIn={0} fadeOut={10}>
        <IncidentScene />
      </Scene>
      <Scene from={at('b3') - 0.45} to={at('b10') - 0.41} fadeIn={10} fadeOut={10}>
        <ChainScene />
      </Scene>
      <Scene from={at('b10') - 0.71} to={at('b11') - 0.13} fadeIn={10} fadeOut={10}>
        <QuestionScene />
      </Scene>
      <Scene from={at('b11') - 0.43} to={at('b14') - 0.2} fadeIn={10} fadeOut={10}>
        <OffensaiScene />
      </Scene>
      <Scene from={at('b14') - 0.5} to={at('b16') - 0.35} fadeIn={10} fadeOut={10}>
        <BreakScene />
      </Scene>
      <Scene from={at('b16') - 0.65} to={BREACH_DURATION / FPS} fadeIn={10} fadeOut={0}>
        <CloseScene />
      </Scene>
      <BreachCaptions />
      {withAudio && <Audio src={staticFile('audio/breach-mix.mp3')} />}
    </AbsoluteFill>
  )
}
