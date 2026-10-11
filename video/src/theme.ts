import { Easing, interpolate } from 'remotion'

export const W = 1920
export const H = 1080
export const FPS = 30
export const DURATION = 1800

export const C = {
  bg: '#000000',
  blue: '#4c93ff',
  blueSoft: '#8fb8ff',
  ember: '#ff5b4a',
  violet: '#b07cff',
  text: '#e2e8f0',
  white: '#f3f6f9',
  mute: '#94a3b8',
  dim: '#475569',
  tileTop: '#262a33',
  tileBottom: '#14161b',
  line: 'rgba(148,163,184,0.16)',
} as const

export const FONT = "'Silka', system-ui, sans-serif"
export const MONO = "'Geist Mono', monospace"

export const easeOut = Easing.bezier(0.16, 1, 0.3, 1)
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1)
export const easeBack = Easing.bezier(0.34, 1.56, 0.64, 1)

export const sec = (s: number) => Math.round(s * FPS)

/** 0 -> 1 over `dur` frames starting at `from`, clamped. */
export function ramp(frame: number, from: number, dur: number, easing: (t: number) => number = easeOut) {
  return interpolate(frame, [from, from + Math.max(1, dur)], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing,
  })
}

/** Deterministic pseudo random in [0,1). */
export function rand(seed: number) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}
