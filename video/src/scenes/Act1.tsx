import React from 'react'
import { interpolate, useCurrentFrame } from 'remotion'
import { azureChain, awsChain, crossCloudChain, type Chain } from '../../../lib/chains'
import { C, FONT, FPS, H, MONO, W, easeInOut, easeOut, rand, ramp, sec } from '../theme'
import { at, endOf, lines } from '../cues'
import { ChainView, chainPoints } from '../ChainView'
import { bezierPath, routeAt } from '../geom'
import { Pulse } from '../ui'

/* ========================================================================== */
/* HOOK                                                                        */
/* ========================================================================== */

const Word: React.FC<{ children: React.ReactNode; at: number; style?: React.CSSProperties }> = ({ children, at: t, style }) => {
  const frame = useCurrentFrame()
  const p = ramp(frame, sec(t), 12, easeOut)
  return (
    <span
      style={{
        display: 'inline-block',
        opacity: p,
        transform: `translateY(${(1 - p) * 28}px)`,
        filter: p < 1 ? `blur(${(1 - p) * 10}px)` : undefined,
        marginRight: '0.26em',
        ...style,
      }}
    >
      {children}
    </span>
  )
}

export const Hook: React.FC = () => {
  const frame = useCurrentFrame()
  const t = frame / FPS
  const h1 = lines.find((l) => l.id === 'hook1')!
  const h2 = lines.find((l) => l.id === 'hook2')!
  const w1 = ['Your', 'cloud', "doesn't", 'have', 'a', 'vulnerability', 'problem.']
  const w2 = ['It', 'has', 'a', 'chain', 'problem.']
  const time1 = (i: number) => h1.start - 0.05 + (i / w1.length) * h1.dur * 0.92
  const time2 = (i: number) => h2.start - 0.02 + (i / w2.length) * h2.dur * 0.85

  const dimFirst = 1 - 0.72 * ramp(frame, sec(h2.start - 0.1), 14)
  const strike = ramp(frame, sec(h2.start - 0.05), 10, easeInOut)
  const cursorOn = t < h1.start - 0.05 && Math.floor(t * 3) % 2 === 0

  const lineStart = h2.start + h2.dur - 0.25
  const lineProg = ramp(frame, sec(lineStart), 26, easeInOut)
  const lineY = 800

  return (
    <div style={{ position: 'absolute', inset: 0, fontFamily: FONT, color: C.white }}>
      {cursorOn && <div style={{ position: 'absolute', left: 150, top: 318, width: 22, height: 84, background: C.blue, boxShadow: `0 0 30px ${C.blue}` }} />}

      <div style={{ position: 'absolute', left: 150, top: 290, opacity: dimFirst, fontSize: 108, fontWeight: 600, letterSpacing: -3, lineHeight: '120px' }}>
        <div>
          {w1.slice(0, 5).map((w, i) => (
            <Word key={i} at={time1(i)}>
              {w}
            </Word>
          ))}
        </div>
        <div>
          <Word at={time1(5)}>
            <span style={{ position: 'relative', display: 'inline-block' }}>
              <span style={{ color: strike > 0.5 ? C.mute : C.white }}>vulnerability</span>
              <span
                style={{
                  position: 'absolute',
                  left: -6,
                  top: '54%',
                  height: 7,
                  width: `${strike * 104}%`,
                  background: C.ember,
                  borderRadius: 4,
                  boxShadow: `0 0 24px ${C.ember}`,
                }}
              />
            </span>
          </Word>
          <Word at={time1(6)}>{w1[6]}</Word>
        </div>
      </div>

      <div style={{ position: 'absolute', left: 150, top: 590, fontSize: 150, fontWeight: 700, letterSpacing: -5, lineHeight: '170px' }}>
        {w2.map((w, i) => (
          <Word
            key={i}
            at={time2(i)}
            style={i === 3 ? { color: C.blue, textShadow: `0 0 60px ${C.blue}aa, 0 0 18px ${C.blue}88` } : undefined}
          >
            {w}
          </Word>
        ))}
      </div>

      {lineProg > 0.01 && (
        <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
          <path d={`M 150 ${lineY} L ${W} ${lineY}`} stroke={C.blue} strokeOpacity={0.2} strokeWidth={14} strokeLinecap="round" pathLength={1} strokeDasharray={`${lineProg} 1`} fill="none" />
          <path d={`M 150 ${lineY} L ${W} ${lineY}`} stroke={C.blue} strokeWidth={3} strokeLinecap="round" pathLength={1} strokeDasharray={`${lineProg} 1`} fill="none" />
        </svg>
      )}
      {lineProg > 0.02 && lineProg < 0.995 && <Pulse x={150 + (W - 150) * lineProg} y={lineY} size={16} />}
    </div>
  )
}

/* ========================================================================== */
/* FINDINGS: the flood, then five of them quietly connect                      */
/* ========================================================================== */

const SEV = [C.mute, C.mute, C.mute, C.blue, C.violet, C.ember]
const PREFIX = ['CVE-26', 'IAM', 'S3-PUB', 'KV-ACC', 'NSG', 'EC2-SG', 'CVE-25', 'RBAC', 'TLS']

const COLS = 12
const ROWS = 7
const CW = 148
const CH = 120
const OX = (W - COLS * CW) / 2 + 10
const OY = 118

const Chip: React.FC<{ x: number; y: number; label: string; color: string; appear: number; lit?: number }> = ({ x, y, label, color, appear, lit = 0 }) => {
  if (appear <= 0.01) return null
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y - 28,
        minWidth: 132,
        height: 56,
        borderRadius: 14,
        background: lit > 0 ? `linear-gradient(160deg, #1b2a45, #101a2e)` : 'linear-gradient(160deg, #1b1e25, #121419)',
        border: `1.5px solid ${lit > 0 ? C.blue : 'rgba(255,255,255,0.09)'}`,
        boxShadow: lit > 0 ? `0 0 ${34 * lit}px ${C.blue}77` : 'none',
        opacity: appear,
        transform: `translateX(-50%) scale(${0.82 + 0.18 * appear + lit * 0.1})`,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '0 16px',
        boxSizing: 'border-box',
        fontFamily: MONO,
        fontSize: 15,
        color: lit > 0 ? C.white : C.mute,
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{ width: 9, height: 9, borderRadius: 5, background: lit > 0 ? C.blue : color, flex: 'none' }} />
      {label}
    </div>
  )
}

export const Findings: React.FC = () => {
  const frame = useCurrentFrame()
  const p1 = at('p1')
  const p3 = at('p3')
  const p4 = at('p4')
  const pts = chainPoints(azureChain, CHAIN_LIFT).slice(1)

  const dimAll = ramp(frame, sec(p3 + 0.1), 18)
  const fadeRest = ramp(frame, sec(p4 + 0.1), 22)
  const lit = ramp(frame, sec(p4 - 0.02), 14)

  const count = Math.round(14382 * ramp(frame, sec(p1 + 0.05), 40, easeOut))
  const counterOpacity = 1 - ramp(frame, sec(p4 + 0.2), 14)

  const chips: React.ReactNode[] = []
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const x = OX + c * CW + CW / 2
      const y = OY + r * CH + CH / 2 + (c % 2) * 14
      if (pts.some((q) => Math.hypot(q.x - x, q.y - y) < 120)) continue
      const k = r * COLS + c
      const prefix = PREFIX[Math.floor(rand(k + 3) * PREFIX.length)]
      const num = 100 + Math.floor(rand(k + 9) * 8900)
      const appear = ramp(frame, sec(p1 + rand(k) * 1.0), 10)
      const op = appear * (1 - 0.6 * dimAll) * (1 - fadeRest)
      chips.push(<Chip key={k} x={x} y={y} label={`${prefix}-${num}`} color={SEV[Math.floor(rand(k + 5) * SEV.length)]} appear={op} />)
    }
  }

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {chips}

      {pts.map((q, i) => (
        <Chip
          key={`k${i}`}
          x={q.x}
          y={q.y}
          label={['CI-TOKEN-0418', 'IAM-TRUST-77', 'AZ-ROLE-2210', 'KV-ACC-0993', 'ST-PUB-3170'][i]}
          color={C.mute}
          appear={ramp(frame, sec(p1 + 0.2 + i * 0.12), 10) * (1 - 0.6 * dimAll * (1 - lit))}
          lit={lit}
        />
      ))}

      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        {pts.slice(0, -1).map((q, i) => {
          const prog = ramp(frame, sec(p4 + 0.1 + i * 0.14), 16, easeInOut)
          if (prog < 0.01) return null
          return (
            <path
              key={i}
              d={bezierPath(q, pts[i + 1])}
              fill="none"
              stroke={C.blue}
              strokeWidth={3}
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray={`${prog} 1`}
              style={{ filter: `drop-shadow(0 0 8px ${C.blue})` }}
            />
          )
        })}
      </svg>

      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 130, background: 'linear-gradient(#000 40%, transparent)', opacity: 0.85 }} />
      <div style={{ position: 'absolute', left: 96, top: 36, opacity: counterOpacity, fontFamily: FONT, display: 'flex', alignItems: 'baseline', gap: 18 }}>
        <span style={{ fontSize: 64, fontWeight: 700, color: C.white, letterSpacing: -2, fontVariantNumeric: 'tabular-nums' }}>{count.toLocaleString('en-US')}</span>
        <span style={{ fontSize: 26, color: C.mute, fontWeight: 500 }}>open findings</span>
      </div>
    </div>
  )
}

/* ========================================================================== */
/* CHAIN: the Azure chain, node by node                                        */
/* ========================================================================== */

const CHAIN_LIFT = -60

export const chainReveal = (chain: Chain, ids: ('c1' | 'c2' | 'c3' | 'c4' | 'c5')[]) => [
  sec(at('c1', -0.55)),
  ...ids.map((id) => sec(at(id, 0))),
]

export const ChainScene: React.FC = () => {
  const frame = useCurrentFrame()
  const reveal = chainReveal(azureChain, ['c1', 'c2', 'c3', 'c4', 'c5'])
  const breach = sec(at('c5', 0.15))
  const emberAt = (i: number) => frame >= breach + i * 3
  const impact = ramp(frame, sec(at('c5', 0.35)), 14)

  return (
    <>
      <div style={{ position: 'absolute', left: 96, top: 70, fontFamily: FONT, opacity: ramp(frame, sec(at('c1', -0.4)), 14) }}>
        <div style={{ fontSize: 22, letterSpacing: 4, color: C.blue, fontWeight: 600 }}>ATTACK CHAIN</div>
        <div style={{ fontSize: 46, fontWeight: 600, color: C.white, marginTop: 6, letterSpacing: -1 }}>{azureChain.name}</div>
      </div>

      <ChainView
        chain={azureChain}
        reveal={reveal}
        tile={150}
        offsetY={CHAIN_LIFT}
        stateOf={(i) => (i === 0 || emberAt(i) ? 'ember' : 'normal')}
        connectorColor={(i) => (emberAt(i + 1) ? C.ember : C.blue)}
        runner={{ start: breach + 14, hopFrames: 10, loop: true, color: C.ember, gapFrames: 14 }}
      />

      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 862,
          textAlign: 'center',
          fontFamily: FONT,
          fontSize: 38,
          fontWeight: 600,
          color: '#ff9d92',
          opacity: impact,
          transform: `translateY(${(1 - impact) * 14}px)`,
        }}
      >
        {azureChain.impact}
      </div>
    </>
  )
}

/* ========================================================================== */
/* MACHINES: zoom out to a world of chains, all being walked at once           */
/* ========================================================================== */

const CELLS = 5
const chainsPool = [azureChain, awsChain, crossCloudChain]
const BREACH_FRAME_CENTER = () => sec(at('c5', 0.15))

export const Machines: React.FC = () => {
  const frame = useCurrentFrame()
  const t0 = sec(at('m1', 0))
  const zoom = interpolate(frame, [t0, t0 + sec(2.4)], [5, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easeInOut,
  })

  const cells: React.ReactNode[] = []
  for (let r = 0; r < CELLS; r++) {
    for (let c = 0; c < CELLS; c++) {
      const k = r * CELLS + c
      const center = r === 2 && c === 2
      const chain = center ? azureChain : chainsPool[Math.floor(rand(k + 1) * 3)]
      const ember = center ? BREACH_FRAME_CENTER() : t0 + sec(0.6 + rand(k + 20) * 2.9)
      const isEmber = (i: number) => frame >= ember + i * 2
      cells.push(
        <div
          key={k}
          style={{
            position: 'absolute',
            left: c * (W / CELLS),
            top: r * (H / CELLS),
            width: W,
            height: H,
            transform: `scale(${1 / CELLS})`,
            transformOrigin: '0 0',
          }}
        >
          <ChainView
            chain={chain}
            reveal={[-100, -100, -100, -100, -100, -100]}
            tile={150}
            offsetY={center ? CHAIN_LIFT : 0}
            labels={center}
            stateOf={(i) => (isEmber(i) ? 'ember' : 'normal')}
            connectorColor={(i) => (isEmber(i + 1) ? C.ember : C.blue)}
            runner={{
              start: center ? BREACH_FRAME_CENTER() + 14 : t0 - Math.floor(rand(k + 40) * 60),
              hopFrames: center ? 10 : 7 + Math.floor(rand(k + 50) * 6),
              loop: true,
              color: C.ember,
              gapFrames: center ? 14 : 6,
            }}
          />
        </div>,
      )
    }
  }

  const fadeCells = ramp(frame, t0 + 8, 30)
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, transform: `scale(${zoom})`, transformOrigin: `${W / 2}px ${H / 2}px` }}>
        <div style={{ position: 'absolute', inset: 0 }}>{cells}</div>
      </div>
    </div>
  )
}

export { endOf, routeAt }
