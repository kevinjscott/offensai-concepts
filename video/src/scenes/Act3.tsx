import React from 'react'
import { AbsoluteFill, Html5Video, Img, Sequence, staticFile, useCurrentFrame } from 'remotion'
import { ClipboardCheck, ShieldCheck, UserCheck, Wrench } from 'lucide-react'
import { azureChain } from '../../../lib/chains'
import { C, FONT, FPS, H, MONO, W, easeInOut, easeOut, ramp, sec } from '../theme'
import { at, endOf } from '../cues'
import { ChainView, chainPoints } from '../ChainView'
import { Chip, Pulse } from '../ui'

/* ========================================================================== */
/* PRIORITIZE                                                                  */
/* ========================================================================== */

const ROWS = [
  { name: 'Leaked key to data lake', cloud: 'AWS', score: 9.1, level: 'Critical', proven: true },
  { name: 'GitLab wildcard trust to Azure prod', cloud: 'Azure', score: 7.4, level: 'High', proven: true },
  { name: 'Public bucket listing', cloud: 'AWS', score: 3.2, level: 'Low', proven: false },
  { name: 'Outdated TLS on internal host', cloud: 'Azure', score: 2.1, level: 'Low', proven: false },
  { name: 'Unused IAM user, no keys', cloud: 'AWS', score: 1.4, level: 'Info', proven: false },
]

export const Prioritize: React.FC = () => {
  const frame = useCurrentFrame()
  const r1 = at('r1')
  const r2 = at('r2')
  const sweep = ramp(frame, sec(r2 + 0.1), 18, easeInOut)
  const zoom = 1 + 0.28 * ramp(frame, sec(r1), sec(5.5), (x) => x)
  const shotIn = ramp(frame, sec(r1 + 0.2), 22)

  return (
    <div style={{ position: 'absolute', inset: 0, fontFamily: FONT }}>
      <div style={{ position: 'absolute', left: 96, top: 70, opacity: ramp(frame, sec(r1 - 0.2), 14) }}>
        <div style={{ fontSize: 22, letterSpacing: 4, color: C.blue, fontWeight: 600 }}>PRIORITIZED BY PROOF</div>
        <div style={{ fontSize: 46, fontWeight: 600, color: C.white, marginTop: 6, letterSpacing: -1 }}>Attack paths, ranked by CSIR score</div>
      </div>

      <div style={{ position: 'absolute', left: 96, top: 230, width: 940 }}>
        {ROWS.map((r, i) => {
          const p = ramp(frame, sec(r1 + 0.1 + i * 0.16), 16)
          const faded = !r.proven ? sweep : 0
          const color = r.level === 'Critical' ? C.ember : r.level === 'High' ? '#ffb454' : C.mute
          return (
            <div
              key={i}
              style={{
                height: 112,
                marginBottom: 14,
                borderRadius: 22,
                background: r.proven ? 'linear-gradient(160deg, #141b2b, #0d111b)' : 'linear-gradient(160deg, #15171c, #0e0f13)',
                border: `1.5px solid ${r.proven ? `${C.blue}88` : 'rgba(255,255,255,0.08)'}`,
                boxShadow: r.proven ? `0 0 40px ${C.blue}26` : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 22,
                padding: '0 28px',
                opacity: p * (1 - 0.82 * faded),
                transform: `translateX(${(1 - p) * -40}px) scale(${1 - faded * 0.02})`,
              }}
            >
              <div style={{ width: 92, textAlign: 'center' }}>
                <div style={{ fontSize: 44, fontWeight: 700, color: r.proven ? color : C.dim, letterSpacing: -1, lineHeight: 1 }}>{r.score.toFixed(1)}</div>
                <div style={{ fontSize: 17, color: r.proven ? color : C.dim, marginTop: 4, fontWeight: 500 }}>{r.level}</div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ position: 'relative', display: 'inline-block', fontSize: 30, fontWeight: 600, color: r.proven ? C.white : C.mute, letterSpacing: -0.4 }}>
                  {r.name}
                  {!r.proven && <span style={{ position: 'absolute', left: 0, top: '54%', height: 3, width: `${sweep * 100}%`, background: C.mute }} />}
                </div>
                <div style={{ fontSize: 20, color: C.mute, marginTop: 4 }}>{r.cloud}</div>
              </div>
              {r.proven ? (
                <Chip color={C.blue} style={{ fontSize: 20 }}>
                  <ShieldCheck size={22} /> Proven exploitable
                </Chip>
              ) : (
                <Chip color={C.mute} style={{ fontSize: 20 }}>
                  Theoretical
                </Chip>
              )}
            </div>
          )
        })}
      </div>

      <div
        style={{
          position: 'absolute',
          left: 1100,
          top: 250,
          width: 740,
          height: 492,
          borderRadius: 28,
          overflow: 'hidden',
          opacity: shotIn,
          transform: `translateY(${(1 - shotIn) * 30}px)`,
          border: '1.5px solid rgba(255,255,255,0.1)',
          boxShadow: `0 40px 100px rgba(0,0,0,0.8), 0 0 70px ${C.blue}22`,
        }}
      >
        <Img
          src={staticFile('brand/csir-score-gitlab-oidc-breach-evidence.png')}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${zoom})`, transformOrigin: '84% 52%' }}
        />
      </div>
    </div>
  )
}

/* ========================================================================== */
/* BREAK THE CHAIN                                                              */
/* ========================================================================== */

export const BreakChain: React.FC = () => {
  const frame = useCurrentFrame()
  const o1 = at('o1')
  const fixFrame = sec(at('o1', 1.35))
  const markFrame = sec(at('o1', 0.9))
  const fixed = frame >= fixFrame
  const hop = 11
  const reveal = [0, 0, 0, 0, 0, 0]
  const pts = chainPoints(azureChain, -20)
  const target = pts[2]

  const ring = ramp(frame, markFrame, 14, easeOut)
  const flash = ramp(frame, fixFrame, 26, easeOut)

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <div style={{ position: 'absolute', left: 96, top: 70, fontFamily: FONT, opacity: ramp(frame, sec(o1 - 0.2), 14) }}>
        <div style={{ fontSize: 22, letterSpacing: 4, color: C.blue, fontWeight: 600 }}>REMEDIATION</div>
        <div style={{ fontSize: 46, fontWeight: 600, color: C.white, marginTop: 6, letterSpacing: -1 }}>{azureChain.name}</div>
      </div>

      <ChainView
        chain={azureChain}
        reveal={reveal}
        tile={140}
        offsetY={-20}
        stateOf={(i) => {
          if (!fixed) return 'ember'
          if (i === 2) return 'safe'
          return i < 2 ? 'ember' : 'normal'
        }}
        connectorColor={(i) => (fixed && i >= 2 ? C.blue : C.ember)}
        cut={{ index: 2, frame: fixFrame }}
        runner={
          fixed
            ? { start: fixFrame - 2 * hop, hopFrames: hop, color: C.ember, stopAtHop: 2 }
            : { start: sec(o1 - 0.1), hopFrames: hop, color: C.ember, loop: true, gapFrames: 10 }
        }
      />

      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        {ring > 0 && (
          <circle
            cx={target.x}
            cy={target.y}
            r={64 + (1 - ring) * 70}
            fill="none"
            stroke={fixed ? C.blue : '#ffd9d4'}
            strokeWidth={4}
            strokeDasharray={fixed ? undefined : '10 10'}
            opacity={ring}
          />
        )}
        {flash > 0 && flash < 1 && <circle cx={target.x} cy={target.y} r={70 + flash * 260} fill="none" stroke={C.blue} strokeWidth={5} opacity={(1 - flash) * 0.8} />}
      </svg>

      <div
        style={{
          position: 'absolute',
          left: target.x,
          top: target.y - 225,
          transform: 'translateX(-50%)',
          opacity: ring,
          fontFamily: FONT,
        }}
      >
        <Chip color={fixed ? C.blue : C.ember} style={{ fontSize: 26, padding: '10px 20px', whiteSpace: 'nowrap' }}>
          {fixed ? (
            <>
              <Wrench size={24} /> Trust pinned to one repo. Chain broken.
            </>
          ) : (
            'The one hop'
          )}
        </Chip>
      </div>
    </div>
  )
}

/* ========================================================================== */
/* EVIDENCE                                                                     */
/* ========================================================================== */

const EVIDENCE = [
  { Icon: ClipboardCheck, title: 'Evidence at every hop', body: 'Timestamped proof for each step of the chain' },
  { Icon: Wrench, title: 'Exact remediation', body: 'The one change that breaks the path' },
  { Icon: UserCheck, title: 'Human-initiated, fully logged', body: 'Audit-ready from the first run' },
]

export const Evidence: React.FC = () => {
  const frame = useCurrentFrame()
  const o2 = at('o2')
  const inP = ramp(frame, sec(o2 - 0.15), 20)
  return (
    <div style={{ position: 'absolute', inset: 0, fontFamily: FONT }}>
      <div style={{ position: 'absolute', left: 96, top: 70, opacity: inP }}>
        <div style={{ fontSize: 22, letterSpacing: 4, color: C.blue, fontWeight: 600 }}>AUDIT-READY</div>
        <div style={{ fontSize: 46, fontWeight: 600, color: C.white, marginTop: 6, letterSpacing: -1 }}>Evidence your auditors can trust</div>
      </div>

      <div style={{ position: 'absolute', left: 0, right: 0, top: 290, display: 'flex', justifyContent: 'center', gap: 36 }}>
        {EVIDENCE.map(({ Icon, title, body }, i) => {
          const p = ramp(frame, sec(at('o2', 0.2 + i * 0.5)), 20)
          const check = ramp(frame, sec(at('o2', 0.45 + i * 0.5)), 12, easeOut)
          return (
            <div
              key={i}
              style={{
                width: 520,
                height: 420,
                borderRadius: 30,
                background: 'linear-gradient(170deg, #161922, #0b0c10)',
                border: '1.5px solid rgba(255,255,255,0.1)',
                boxShadow: `0 30px 80px rgba(0,0,0,0.7), 0 0 50px ${C.blue}1c`,
                padding: 40,
                opacity: p,
                transform: `translateY(${(1 - p) * 40}px)`,
                position: 'relative',
              }}
            >
              <div style={{ width: 96, height: 96, borderRadius: 24, background: 'linear-gradient(160deg, #262a33, #14161b)', border: `1.5px solid ${C.blue}77`, boxShadow: `0 0 36px ${C.blue}55`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={46} color="#fff" strokeWidth={1.5} />
              </div>
              <div style={{ fontSize: 40, fontWeight: 600, color: C.white, marginTop: 34, letterSpacing: -0.8, lineHeight: 1.15 }}>{title}</div>
              <div style={{ fontSize: 26, color: C.mute, marginTop: 14, lineHeight: 1.4 }}>{body}</div>
              <div
                style={{
                  position: 'absolute',
                  right: 34,
                  top: 34,
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  background: C.blue,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: `scale(${check})`,
                  boxShadow: `0 0 28px ${C.blue}aa`,
                }}
              >
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#020617" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12.5l4.5 4.5L19 7" />
                </svg>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ========================================================================== */
/* CLOSE                                                                        */
/* ========================================================================== */

export const Close: React.FC<{ start: number }> = ({ start }) => {
  const frame = useCurrentFrame()
  const e = at('end')
  const logoIn = ramp(frame, sec(e - 0.05), 22)
  const tagIn = ramp(frame, sec(e + 1.05), 22)
  const urlIn = ramp(frame, sec(e + 2.2), 20)
  const out = ramp(frame, sec(59.35), 16, (x) => x)
  return (
    <AbsoluteFill style={{ opacity: 1 - out }}>
      <Sequence from={sec(start)} layout="none">
        <AbsoluteFill style={{ mixBlendMode: 'screen', opacity: 0.55 * ramp(frame, sec(start), 20) }}>
          <Html5Video
            src={staticFile('brand/offensai-autonomous-cloud-attack-agents.webm')}
            startFrom={sec(6.2)}
            muted
            style={{ position: 'absolute', left: 0, top: 150, width: W, height: H, objectFit: 'cover', transform: 'scale(1.2)', transformOrigin: '50% 80%' }}
          />
        </AbsoluteFill>
      </Sequence>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 55% 40% at 50% 42%, rgba(0,0,0,0.78), transparent 75%)' }} />

      <div style={{ position: 'absolute', left: 0, right: 0, top: 250, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Img
          src={staticFile('brand/logo.svg')}
          style={{ width: 760, opacity: logoIn, transform: `translateY(${(1 - logoIn) * 20}px) scale(${0.96 + 0.04 * logoIn})`, filter: `drop-shadow(0 0 40px ${C.blue}77)` }}
        />
        <div
          style={{
            fontFamily: FONT,
            fontSize: 58,
            fontWeight: 600,
            color: C.white,
            letterSpacing: -1.5,
            marginTop: 52,
            opacity: tagIn,
            transform: `translateY(${(1 - tagIn) * 18}px)`,
          }}
        >
          See your cloud the way <span style={{ color: C.blue }}>attackers</span> do.
        </div>
        <div style={{ marginTop: 44, opacity: urlIn, transform: `translateY(${(1 - urlIn) * 12}px)` }}>
          <div
            style={{
              fontFamily: FONT,
              fontSize: 34,
              fontWeight: 600,
              color: C.blue,
              padding: '16px 36px',
              borderRadius: 18,
              border: `2px solid ${C.blue}`,
              boxShadow: `0 0 40px ${C.blue}55`,
              letterSpacing: 0.5,
            }}
          >
            offensai.com
          </div>
        </div>
      </div>

      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 44, textAlign: 'center', fontFamily: FONT, fontSize: 20, color: C.dim, opacity: urlIn }}>
        Scenarios shown are illustrative.
      </div>
    </AbsoluteFill>
  )
}

export { endOf, Pulse, MONO, H, FPS }
