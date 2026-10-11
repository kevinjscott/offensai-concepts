import React from 'react'
import { AbsoluteFill, Html5Video, Img, Sequence, staticFile, useCurrentFrame } from 'remotion'
import { Check, Cpu, Database, Fingerprint, GitBranch, KeyRound, MousePointer2, ShieldCheck, UserCog, VenetianMask, type LucideIcon } from 'lucide-react'
import { crossCloudChain } from '../../../lib/chains'
import { C, FONT, FPS, H, MONO, W, easeInOut, easeOut, ramp, sec } from '../theme'
import { at, endOf } from '../cues'
import { bezierPath, routeAt, type Pt } from '../geom'
import { Chip, Pulse, Tile, Window, type TileState } from '../ui'

/* ========================================================================== */
/* AGENTS                                                                      */
/* ========================================================================== */

export const Agents: React.FC<{ start: number }> = ({ start }) => {
  const frame = useCurrentFrame()
  const s1 = at('s1')
  const ring = ramp(frame, sec(s1 - 0.15), 34, easeOut)
  const logoIn = ramp(frame, sec(s1 + 0.35), 18)
  const subIn = ramp(frame, sec(s1 + 1.2), 18)
  return (
    <AbsoluteFill>
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        {[0, 0.18, 0.36].map((d, i) => {
          const p = Math.max(0, Math.min(1, ring * 1.3 - d))
          return <circle key={i} cx={W / 2} cy={H * 0.62} r={80 + p * 1100} fill="none" stroke={C.blue} strokeWidth={3} opacity={(1 - p) * 0.55} />
        })}
      </svg>

      <Sequence from={sec(start)} layout="none">
        <AbsoluteFill style={{ mixBlendMode: 'screen' }}>
          <Html5Video
            src={staticFile('brand/offensai-autonomous-cloud-attack-agents.webm')}
            muted
            style={{ position: 'absolute', left: 0, top: 120, width: W, height: H, objectFit: 'cover', transform: 'scale(1)', transformOrigin: '50% 70%' }}
          />
        </AbsoluteFill>
      </Sequence>

      <div style={{ position: 'absolute', left: 0, right: 0, top: 64, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
        <Img
          src={staticFile('brand/logo.svg')}
          style={{ width: 460, opacity: logoIn, transform: `translateY(${(1 - logoIn) * 16}px)`, filter: `drop-shadow(0 0 30px ${C.blue}66)` }}
        />
        <div
          style={{
            fontFamily: FONT,
            fontSize: 28,
            letterSpacing: 8,
            color: C.blueSoft,
            fontWeight: 500,
            opacity: subIn,
            transform: `translateY(${(1 - subIn) * 12}px)`,
          }}
        >
          AUTONOMOUS CLOUD ATTACK AGENTS
        </div>
      </div>
    </AbsoluteFill>
  )
}

/* ========================================================================== */
/* GRAPH + COMPOSE                                                             */
/* ========================================================================== */

interface GNode {
  id: string
  x: number
  y: number
  Icon: LucideIcon
  /** index into crossCloudChain.nodes when part of the composed path */
  path?: number
}

const NODES: GNode[] = [
  { id: 'atk', x: 420, y: 235, Icon: VenetianMask, path: 0 },
  { id: 'repo', x: 330, y: 470, Icon: GitBranch, path: 1 },
  { id: 'ci', x: 205, y: 650, Icon: Cpu },
  { id: 'vars', x: 440, y: 720, Icon: KeyRound },
  { id: 'role', x: 800, y: 400, Icon: UserCog, path: 2 },
  { id: 'iam', x: 790, y: 650, Icon: Fingerprint },
  { id: 'lambda', x: 1060, y: 400, Icon: Cpu },
  { id: 's3', x: 1180, y: 640, Icon: Database },
  { id: 'cred', x: 980, y: 650, Icon: Fingerprint, path: 3 },
  { id: 'app', x: 1500, y: 520, Icon: Cpu, path: 4 },
  { id: 'kv', x: 1500, y: 780, Icon: KeyRound },
  { id: 'store', x: 1730, y: 480, Icon: Database },
  { id: 'tenant', x: 1700, y: 700, Icon: Database, path: 5 },
]
const EDGES: [string, string][] = [
  ['repo', 'ci'],
  ['repo', 'vars'],
  ['ci', 'vars'],
  ['role', 'iam'],
  ['role', 'lambda'],
  ['iam', 'cred'],
  ['lambda', 's3'],
  ['s3', 'cred'],
  ['app', 'kv'],
  ['app', 'store'],
  ['kv', 'tenant'],
  ['store', 'tenant'],
  ['atk', 'repo'],
  ['repo', 'role'],
  ['cred', 'app'],
]
const CLUSTERS = [
  { label: 'GitLab', x: 110, y: 300, w: 450, h: 580 },
  { label: 'AWS account', x: 660, y: 270, w: 610, h: 520 },
  { label: 'Azure tenant', x: 1370, y: 380, w: 470, h: 520 },
]
const byId = (id: string) => NODES.find((n) => n.id === id)!
const PATH = NODES.filter((n) => n.path !== undefined).sort((a, b) => a.path! - b.path!)

export const GraphCompose: React.FC = () => {
  const frame = useCurrentFrame()
  const s2 = at('s2')
  const s3 = at('s3')
  const composeStart = sec(s3 + 0.1)
  const pathPts: Pt[] = PATH.map((n) => ({ x: n.x, y: n.y }))
  const dim = ramp(frame, composeStart, 16)
  const hopFrames = sec(0.55)

  const runT = (frame - (composeStart + hopFrames * 5 + 10)) / 9
  const hops = pathPts.length - 1
  const runPos = runT >= 0 ? routeAt(pathPts, ((runT % (hops + 1.6)) + (hops + 1.6)) % (hops + 1.6)) : null
  const runCycle = runT >= 0 ? ((runT % (hops + 1.6)) + (hops + 1.6)) % (hops + 1.6) : 0

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <div style={{ position: 'absolute', left: 96, top: 70, fontFamily: FONT, opacity: ramp(frame, sec(s2 - 0.15), 14) }}>
        <div style={{ fontSize: 22, letterSpacing: 4, color: C.blue, fontWeight: 600 }}>{frame >= composeStart ? 'COMPOSED ATTACK CHAIN' : 'YOUR CLOUD, AS A GRAPH'}</div>
        <div style={{ fontSize: 46, fontWeight: 600, color: C.white, marginTop: 6, letterSpacing: -1 }}>
          {frame >= composeStart ? crossCloudChain.name : 'Identities, roles, secrets, pipelines'}
        </div>
      </div>

      {CLUSTERS.map((c, i) => {
        const p = ramp(frame, sec(s2 + i * 0.18), 18)
        return (
          <div
            key={c.label}
            style={{
              position: 'absolute',
              left: c.x,
              top: c.y,
              width: c.w,
              height: c.h,
              borderRadius: 30,
              border: `2px solid ${C.blue}`,
              opacity: p * (1 - 0.55 * dim),
              transform: `scale(${0.96 + 0.04 * p})`,
              boxShadow: `inset 0 0 60px ${C.blue}10`,
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: 26,
                top: -22,
                padding: '8px 20px',
                borderRadius: 14,
                background: '#05070d',
                border: `2px solid ${C.blue}`,
                color: C.white,
                fontFamily: FONT,
                fontSize: 26,
                fontWeight: 500,
              }}
            >
              {c.label}
            </div>
          </div>
        )
      })}

      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        {EDGES.map(([a, b], i) => {
          const A = byId(a)
          const B = byId(b)
          const isPath = A.path !== undefined && B.path !== undefined && B.path === A.path + 1
          if (isPath && frame >= composeStart) return null
          const p = ramp(frame, sec(s2 + 0.35 + (i % 6) * 0.08), 16)
          return <line key={i} x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke="rgba(148,163,184,0.5)" strokeWidth={2} strokeLinecap="round" opacity={p * (1 - 0.6 * dim)} />
        })}
        {pathPts.slice(0, -1).map((p, i) => {
          const prog = ramp(frame, composeStart + i * hopFrames, hopFrames, easeInOut)
          if (prog <= 0) return null
          const d = bezierPath(p, pathPts[i + 1])
          const col = runCycle > i + 1 || (runPos && runCycle >= 0 && runT > 0) ? C.ember : C.blue
          return (
            <g key={i}>
              <path d={d} fill="none" stroke={col} strokeOpacity={0.18} strokeWidth={16} strokeLinecap="round" pathLength={1} strokeDasharray={`${prog} 1`} />
              <path d={d} fill="none" stroke={col} strokeWidth={4} strokeLinecap="round" pathLength={1} strokeDasharray={`${prog} 1`} />
            </g>
          )
        })}
      </svg>

      {pathPts.slice(0, -1).map((p, i) => {
        const prog = ramp(frame, composeStart + i * hopFrames, hopFrames, easeInOut)
        if (prog <= 0.02 || prog >= 0.98) return null
        const pos = routeAt([p, pathPts[i + 1]], prog)
        return <Pulse key={i} x={pos.x} y={pos.y} size={14} />
      })}

      {NODES.map((n, i) => {
        const onPath = n.path !== undefined
        const appear = ramp(frame, sec(s2 + 0.15 + (i % 7) * 0.2), 14)
        const state: TileState = onPath ? (n.path === 5 && frame >= composeStart + hopFrames * 5 ? 'ember' : 'normal') : 'dim'
        const emphasis = onPath ? dim : 0
        const meta = onPath ? crossCloudChain.nodes[n.path!] : undefined
        const showLabel = onPath && frame >= composeStart + (n.path! - 1) * hopFrames + (n.path === 0 ? -100 : 4)
        return (
          <Tile
            key={n.id}
            x={n.x}
            y={n.y}
            size={onPath ? 84 + emphasis * 22 : 84}
            Icon={n.Icon}
            state={onPath && dim > 0.02 ? state : dim > 0.02 ? 'dim' : 'normal'}
            appear={appear * (onPath ? 1 : 1 - 0.55 * dim)}
            label={showLabel ? meta?.label : undefined}
            sub={showLabel ? meta?.sub : undefined}
            labelAbove={false}
            labelFont={22}
          />
        )
      })}

      {runPos && runCycle <= hops + 0.2 && <Pulse x={runPos.x} y={runPos.y} color={C.ember} size={16} />}

      <div style={{ position: 'absolute', right: 96, top: 80, display: 'flex', gap: 12, opacity: dim, fontFamily: FONT }}>
        <Chip color={C.blue}>GitLab</Chip>
        <Chip color={C.blue}>AWS</Chip>
        <Chip color={C.blue}>Azure</Chip>
      </div>
    </div>
  )
}

/* ========================================================================== */
/* VALIDATE: human-initiated, evidence at every hop                            */
/* ========================================================================== */

const Cursor: React.FC<{ x: number; y: number; press: number }> = ({ x, y, press }) => (
  <div style={{ position: 'absolute', left: x, top: y, transform: `scale(${1 - press * 0.18})`, filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.6))' }}>
    <MousePointer2 size={40} color="#fff" fill="#0b0c10" strokeWidth={1.6} />
  </div>
)

export const Validate: React.FC = () => {
  const frame = useCurrentFrame()
  const s4 = at('s4')
  const inP = ramp(frame, sec(s4 - 0.35), 20)
  const clickF = sec(at('s4', 0.55))
  const approved = frame >= clickF
  const press = frame >= clickF - 4 && frame <= clickF + 6 ? 1 : 0

  const btn = { x: 640, y: 598 }
  const cursorPos = (() => {
    const p = ramp(frame, sec(s4 - 0.1), clickF - sec(s4 - 0.1), easeInOut)
    return { x: 900 + (btn.x - 900) * p, y: 780 + (btn.y - 780) * p }
  })()

  const WX = 170
  const WY = 130
  const WW = 1580
  const WH = 664
  const hopsData = crossCloudChain.hops

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <div style={{ position: 'absolute', left: 96, top: 60, fontFamily: FONT, opacity: inP }}>
        <div style={{ fontSize: 22, letterSpacing: 4, color: C.blue, fontWeight: 600 }}>VALIDATION</div>
      </div>

      <Window x={WX} y={WY + 20} w={WW} h={WH} title="Validation run  /  One path, two clouds" opacity={inP} scale={0.96 + 0.04 * inP}>
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 560, padding: 40, borderRight: '1.5px solid rgba(255,255,255,0.08)', fontFamily: FONT }}>
          <div style={{ fontSize: 24, color: C.mute }}>Attack chain</div>
          <div style={{ fontSize: 40, fontWeight: 600, color: C.white, marginTop: 8, letterSpacing: -0.6, lineHeight: 1.15 }}>One path,{'\n'}two clouds</div>
          <div style={{ display: 'flex', gap: 10, marginTop: 26 }}>
            <Chip color={C.ember}>High priority</Chip>
            <Chip color={C.blue}>5 hops</Chip>
          </div>
          <div style={{ fontFamily: MONO, fontSize: 18, color: C.mute, marginTop: 26 }}>RUN-2026-0713-001</div>

          <div
            style={{
              position: 'absolute',
              left: 40,
              top: 330,
              width: 480,
              height: 84,
              borderRadius: 20,
              background: approved ? `${C.blue}` : 'transparent',
              border: `2px solid ${C.blue}`,
              boxShadow: approved ? `0 0 44px ${C.blue}88` : `0 0 22px ${C.blue}33`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              color: approved ? '#020617' : C.blue,
              fontSize: 28,
              fontWeight: 600,
              transform: `scale(${press ? 0.97 : 1})`,
            }}
          >
            {approved ? (
              <>
                <Check size={30} strokeWidth={3} /> Approved by you
              </>
            ) : (
              'Approve run'
            )}
          </div>
          <div style={{ marginTop: 22, fontSize: 22, color: C.mute, lineHeight: 1.4 }}>
            {approved ? 'Human-initiated. Every action is logged.' : 'Nothing runs until you say so.'}
          </div>
        </div>

        <div style={{ position: 'absolute', left: 560, top: 0, right: 0, bottom: 0, padding: '30px 44px', fontFamily: FONT }}>
          {hopsData.map((h, i) => {
            const t0 = sec(at('s4', 1.0 + i * 0.5)) - 4
            const p = ramp(frame, t0, 14)
            const done = ramp(frame, t0 + 10, 12)
            const typed = Math.floor(h.evidence.length * ramp(frame, t0 + 4, 14, (x) => x))
            return (
              <div key={i} style={{ height: 112, display: 'flex', gap: 22, alignItems: 'flex-start', opacity: 0.18 + 0.82 * p, transform: `translateX(${(1 - p) * 20}px)`, paddingTop: 8 }}>
                <div
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 23,
                    flex: 'none',
                    marginTop: 4,
                    border: `2px solid ${done > 0.5 ? C.blue : 'rgba(148,163,184,0.4)'}`,
                    background: done > 0.5 ? C.blue : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#020617',
                    transform: `scale(${1 + 0.18 * Math.sin(done * Math.PI)})`,
                    boxShadow: done > 0.5 ? `0 0 24px ${C.blue}88` : 'none',
                  }}
                >
                  {done > 0.5 ? <Check size={26} strokeWidth={3.2} /> : <span style={{ color: C.mute, fontSize: 22, fontWeight: 600 }}>{i + 1}</span>}
                </div>
                <div>
                  <div style={{ fontSize: 28, fontWeight: 600, color: C.white, letterSpacing: -0.3 }}>{h.title}</div>
                  <div style={{ fontFamily: MONO, fontSize: 20, color: '#9fc1ff', marginTop: 8, whiteSpace: 'pre' }}>
                    {h.evidence.slice(0, typed)}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </Window>

      <Cursor x={cursorPos.x} y={cursorPos.y} press={press} />
      {frame < clickF + 14 && null}

      <div style={{ position: 'absolute', left: 0, right: 0, top: 858, display: 'flex', justifyContent: 'center', opacity: ramp(frame, sec(at('s4', 3.2)), 14) }}>
        <Chip color={C.blue} style={{ fontSize: 26, padding: '12px 22px' }}>
          <ShieldCheck size={26} /> Read-only proof. Nothing is changed.
        </Chip>
      </div>
    </div>
  )
}

export { endOf }
