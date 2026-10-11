import React from 'react'
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion'
import type { LucideIcon } from 'lucide-react'
import { C, FONT, FPS, H, MONO, W, easeBack, easeOut, ramp, sec } from './theme'
import { lines } from './cues'

/* -------------------------------------------------------------------------- */
/* Backdrop                                                                    */
/* -------------------------------------------------------------------------- */

/** Persistent black stage with a dot grid and a low glow whose hue follows the story. */
export const Backdrop: React.FC = () => {
  const frame = useCurrentFrame()
  const t = frame / FPS
  // threat hue: rises through the breach (c5), falls when the agents arrive
  const threat =
    interpolate(t, [20.6, 21.6, 26.4, 27.8], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) * 0.9 +
    interpolate(t, [48.4, 49.0, 50.0, 50.4], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) * 0.5
  const glow = threat > 0.01 ? `rgba(255,91,74,${0.16 * threat})` : 'rgba(76,147,255,0.12)'
  const blueGlow = `rgba(76,147,255,${0.13 * (1 - Math.min(1, threat))})`
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <AbsoluteFill
        style={{
          backgroundImage: 'radial-gradient(rgba(148,163,184,0.2) 1.2px, transparent 1.2px)',
          backgroundSize: '40px 40px',
          backgroundPosition: '20px 20px',
          maskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, #000 20%, transparent 85%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, #000 20%, transparent 85%)',
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 60% 45% at 50% 108%, ${threat > 0.01 ? glow : blueGlow}, transparent 70%)`,
        }}
      />
    </AbsoluteFill>
  )
}

export const Vignette: React.FC = () => (
  <AbsoluteFill
    style={{
      pointerEvents: 'none',
      background: 'radial-gradient(ellipse 85% 85% at 50% 50%, transparent 55%, rgba(0,0,0,0.7) 100%)',
    }}
  />
)

/* -------------------------------------------------------------------------- */
/* Scene wrapper (absolute-time, crossfaded)                                   */
/* -------------------------------------------------------------------------- */

export const Scene: React.FC<{
  from: number
  to: number
  fadeIn?: number
  fadeOut?: number
  children: React.ReactNode
}> = ({ from, to, fadeIn = 8, fadeOut = 8, children }) => {
  const frame = useCurrentFrame()
  const f0 = sec(from)
  const f1 = sec(to)
  if (frame < f0 || frame > f1) return null
  const opacity = Math.min(
    fadeIn > 0 ? ramp(frame, f0, fadeIn, (x) => x) : 1,
    fadeOut > 0 ? 1 - ramp(frame, f1 - fadeOut, fadeOut, (x) => x) : 1,
  )
  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>
}

/* -------------------------------------------------------------------------- */
/* Node tile (echoes the product UI: dark glass tile, white line icon, glow)   */
/* -------------------------------------------------------------------------- */

export type TileState = 'normal' | 'ember' | 'safe' | 'dim' | 'violet'

const glowFor = (s: TileState) =>
  s === 'ember' ? C.ember : s === 'violet' ? C.violet : s === 'dim' ? 'transparent' : C.blue

export const Tile: React.FC<{
  x: number
  y: number
  size?: number
  Icon: LucideIcon
  label?: string
  sub?: string
  state?: TileState
  /** 0..1 entrance */
  appear?: number
  labelFont?: number
  labelAbove?: boolean
  glow?: number
  badge?: React.ReactNode
}> = ({ x, y, size = 150, Icon, label, sub, state = 'normal', appear = 1, labelFont, labelAbove, glow = 1, badge }) => {
  if (appear <= 0.001) return null
  const g = glowFor(state)
  const scale = 0.7 + 0.3 * appear
  const fs = labelFont ?? Math.round(size * 0.17)
  const iconColor = state === 'ember' ? '#ffd9d4' : state === 'dim' ? C.dim : '#ffffff'
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: size,
        height: size,
        transform: `translate(-50%, -50%) scale(${scale})`,
        opacity: appear,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: size * 0.2,
          background: `linear-gradient(160deg, ${C.tileTop}, ${C.tileBottom})`,
          border: `${Math.max(1, size * 0.01)}px solid ${state === 'dim' ? 'rgba(148,163,184,0.14)' : 'rgba(255,255,255,0.14)'}`,
          boxShadow:
            state === 'dim'
              ? 'none'
              : `0 0 0 ${Math.max(1, size * 0.008)}px ${g}66, 0 0 ${size * 0.28 * glow}px ${g}${state === 'ember' ? '88' : '66'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon size={size * 0.44} strokeWidth={1.5} color={iconColor} />
      </div>
      {badge}
      {label && (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            [labelAbove ? 'bottom' : 'top']: size + size * 0.14,
            transform: 'translateX(-50%)',
            textAlign: 'center',
            whiteSpace: 'nowrap',
            fontFamily: FONT,
            lineHeight: 1.25,
          }}
        >
          <div style={{ fontSize: fs, fontWeight: 600, color: state === 'dim' ? C.dim : C.white }}>{label}</div>
          {sub && <div style={{ fontSize: fs * 0.8, color: state === 'ember' ? '#ff9d92' : C.mute, marginTop: 2 }}>{sub}</div>}
        </div>
      )}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Pulse: a bright packet travelling along the graph                           */
/* -------------------------------------------------------------------------- */

export const Pulse: React.FC<{ x: number; y: number; color?: string; size?: number; opacity?: number }> = ({
  x,
  y,
  color = C.blue,
  size = 14,
  opacity = 1,
}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: size,
      height: size,
      marginLeft: -size / 2,
      marginTop: -size / 2,
      borderRadius: '50%',
      background: '#fff',
      opacity,
      boxShadow: `0 0 ${size * 1.2}px ${size * 0.5}px ${color}, 0 0 ${size * 3}px ${size}px ${color}55`,
    }}
  />
)

/* -------------------------------------------------------------------------- */
/* Window chrome (matches the product screenshots)                              */
/* -------------------------------------------------------------------------- */

export const Window: React.FC<{
  x: number
  y: number
  w: number
  h: number
  title?: string
  children: React.ReactNode
  opacity?: number
  scale?: number
}> = ({ x, y, w, h, title, children, opacity = 1, scale = 1 }) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: w,
      height: h,
      opacity,
      transform: `scale(${scale})`,
      transformOrigin: 'center',
      borderRadius: 28,
      background: 'linear-gradient(180deg, #121316, #0a0b0e)',
      border: '1.5px solid rgba(255,255,255,0.1)',
      boxShadow: '0 40px 120px rgba(0,0,0,0.8), 0 0 0 1px rgba(76,147,255,0.18), 0 0 80px rgba(76,147,255,0.12)',
      overflow: 'hidden',
      fontFamily: FONT,
    }}
  >
    <div style={{ height: 64, display: 'flex', alignItems: 'center', gap: 12, padding: '0 28px', borderBottom: '1.5px solid rgba(255,255,255,0.08)' }}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ width: 14, height: 14, borderRadius: 7, background: '#26282e' }} />
      ))}
      {title && <div style={{ marginLeft: 16, color: C.mute, fontSize: 20, letterSpacing: 0.3 }}>{title}</div>}
    </div>
    <div style={{ position: 'relative', height: h - 64 }}>{children}</div>
  </div>
)

/* -------------------------------------------------------------------------- */
/* Captions (karaoke style: words brighten as they are spoken)                 */
/* -------------------------------------------------------------------------- */

const SKIP_CAPTIONS = new Set(['hook1', 'hook2', 'end'])

export const Captions: React.FC = () => {
  const frame = useCurrentFrame()
  const t = frame / FPS
  const line = lines.find((l) => !SKIP_CAPTIONS.has(l.id) && t >= l.start - 0.12 && t <= l.start + l.dur + 0.4)
  if (!line) return null
  const words = line.caption.split(' ')
  const total = words.reduce((n, w) => n + w.length + 1, 0)
  const fadeIn = ramp(frame, sec(line.start - 0.12), 6, easeOut)
  const fadeOut = 1 - ramp(frame, sec(line.start + line.dur + 0.2), 6, (x) => x)
  let acc = 0
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 66,
        display: 'flex',
        justifyContent: 'center',
        opacity: Math.min(fadeIn, fadeOut),
        transform: `translateY(${(1 - fadeIn) * 10}px)`,
      }}
    >
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
          const spoken = interpolate(t, [line.start + startFrac * line.dur - 0.05, line.start + startFrac * line.dur + 0.12], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          })
          const isBrand = w.startsWith('OFFENSAI')
          return (
            <span key={i} style={{ color: isBrand ? C.blue : spoken > 0.5 ? C.white : '#5b6678', transition: 'none' }}>
              {w}
            </span>
          )
        })}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Small helpers                                                               */
/* -------------------------------------------------------------------------- */

export const Chip: React.FC<{ children: React.ReactNode; color?: string; style?: React.CSSProperties }> = ({
  children,
  color = C.blue,
  style,
}) => (
  <div
    style={{
      fontFamily: FONT,
      fontSize: 22,
      fontWeight: 600,
      color,
      padding: '8px 16px',
      borderRadius: 12,
      border: `1.5px solid ${color}66`,
      background: `${color}14`,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      letterSpacing: 0.2,
      ...style,
    }}
  >
    {children}
  </div>
)

export const Mono: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <span style={{ fontFamily: MONO, ...style }}>{children}</span>
)

export { W, H, easeBack }
