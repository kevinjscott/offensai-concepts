import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { at, endOf, lines, sfxCues } from '../src/cues.ts'

const SR = 44100
const TOTAL = 60
const N = SR * TOTAL
const TAU = Math.PI * 2

/* ---------------------------------- utils --------------------------------- */

const buf = (sec: number) => new Float32Array(Math.ceil(sec * SR))
const mtof = (m: number) => 440 * Math.pow(2, (m - 69) / 12)
const lpCoef = (fc: number) => 1 - Math.exp((-TAU * fc) / SR)

let seed = 1337
const rnd = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0
  return seed / 4294967296
}
const noise = () => rnd() * 2 - 1

class Stereo {
  L = new Float32Array(N)
  R = new Float32Array(N)
  /** Mix a mono buffer at `t` seconds with pan in [-1, 1] */
  add(t: number, mono: Float32Array, gain = 1, pan = 0) {
    const start = Math.round(t * SR)
    const gl = gain * Math.cos(((pan + 1) * Math.PI) / 4)
    const gr = gain * Math.sin(((pan + 1) * Math.PI) / 4)
    for (let i = 0; i < mono.length; i++) {
      const k = start + i
      if (k < 0) continue
      if (k >= N) break
      this.L[k] += mono[i] * gl
      this.R[k] += mono[i] * gr
    }
  }
}

/** Schroeder-style stereo reverb */
function reverb(inL: Float32Array, inR: Float32Array, size = 1, fb = 0.84, damp = 0.35) {
  const combLens = [1557, 1617, 1491, 1422, 1277, 1356].map((d) => Math.round(d * size))
  const apLens = [225, 556, 441]
  const run = (inp: Float32Array, spread: number) => {
    const out = new Float32Array(inp.length)
    for (const base of combLens) {
      const d = base + spread
      const line = new Float32Array(d)
      let idx = 0
      let lp = 0
      for (let i = 0; i < inp.length; i++) {
        const y = line[idx]
        lp = y * (1 - damp) + lp * damp
        line[idx] = inp[i] + lp * fb
        out[i] += y * 0.18
        idx = (idx + 1) % d
      }
    }
    let sig = out
    for (const base of apLens) {
      const d = base + spread
      const line = new Float32Array(d)
      let idx = 0
      const next = new Float32Array(sig.length)
      for (let i = 0; i < sig.length; i++) {
        const y = line[idx]
        const x = sig[i]
        const v = x + y * 0.5
        line[idx] = v
        next[i] = y - v * 0.5
        idx = (idx + 1) % d
      }
      sig = next
    }
    return sig
  }
  return { L: run(inL, 0), R: run(inR, 23) }
}

/* -------------------------------- instruments ----------------------------- */

function pad(freq: number, dur: number, fc: number, attack = 0.7, release = 1.1) {
  const len = Math.ceil((dur + release) * SR)
  const out = new Float32Array(len)
  const a = lpCoef(fc)
  let y1 = 0
  let y2 = 0
  const det = [0.996, 1.004, 1.0]
  const ph = [rnd(), rnd(), rnd()]
  for (let i = 0; i < len; i++) {
    const t = i / SR
    let env = Math.min(1, t / attack)
    if (t > dur) env *= Math.max(0, 1 - (t - dur) / release)
    let s = 0
    for (let k = 0; k < 3; k++) {
      ph[k] = (ph[k] + (freq * det[k]) / SR) % 1
      s += (ph[k] * 2 - 1) * (k === 2 ? 0.5 : 1)
    }
    s += Math.sin(TAU * (freq / 2) * t) * 0.9
    y1 += a * (s - y1)
    y2 += a * (y1 - y2)
    out[i] = y2 * env * 0.22
  }
  return out
}

function pluck(freq: number, dur = 0.5, bright = 3600) {
  const len = Math.ceil(dur * SR)
  const out = new Float32Array(len)
  const a = lpCoef(bright)
  let y = 0
  for (let i = 0; i < len; i++) {
    const t = i / SR
    const tri = 2 * Math.abs(2 * ((freq * t) % 1) - 1) - 1
    const s = tri * 0.7 + Math.sin(TAU * freq * 2 * t) * 0.35 + Math.sin(TAU * freq * 0.5 * t) * 0.25
    y += a * (s - y)
    out[i] = y * Math.exp(-t / 0.13) * Math.min(1, t / 0.003) * 0.5
  }
  return out
}

function bell(freq: number, dur = 1.6) {
  const len = Math.ceil(dur * SR)
  const out = new Float32Array(len)
  for (let i = 0; i < len; i++) {
    const t = i / SR
    const s = Math.sin(TAU * freq * t) + 0.45 * Math.sin(TAU * freq * 2.76 * t) * Math.exp(-t / 0.25) + 0.3 * Math.sin(TAU * freq * 5.4 * t) * Math.exp(-t / 0.1)
    out[i] = s * Math.exp(-t / (dur / 4)) * Math.min(1, t / 0.002) * 0.3
  }
  return out
}

function kick(len = 0.45, punch = 1) {
  const n = Math.ceil(len * SR)
  const out = new Float32Array(n)
  let ph = 0
  for (let i = 0; i < n; i++) {
    const t = i / SR
    const f = 42 + 120 * Math.exp(-t / 0.028)
    ph += (TAU * f) / SR
    const click = i < 90 ? noise() * 0.4 * (1 - i / 90) : 0
    out[i] = (Math.sin(ph) * Math.exp(-t / 0.16) + click) * punch
  }
  return out
}

function hat(open = false, len = 0.09) {
  const n = Math.ceil(len * SR * (open ? 3 : 1))
  const out = new Float32Array(n)
  let prev = 0
  for (let i = 0; i < n; i++) {
    const x = noise()
    const hp = x - prev
    prev = x
    out[i] = hp * Math.exp(-(i / SR) / (open ? 0.09 : 0.022)) * 0.45
  }
  return out
}

function clap() {
  const n = Math.ceil(0.32 * SR)
  const out = new Float32Array(n)
  const a = lpCoef(3400)
  let y = 0
  let prev = 0
  for (let i = 0; i < n; i++) {
    const t = i / SR
    y += a * (noise() - y)
    const hp = y - prev * 0.9
    prev = y
    const bursts = [0, 0.011, 0.022].reduce((s, b) => s + (t >= b ? Math.exp(-(t - b) / 0.006) : 0), 0)
    out[i] = hp * (bursts * 0.5 + Math.exp(-t / 0.09) * 0.6) * 0.9
  }
  return out
}

function boom(dur = 2.2, depth = 1) {
  const n = Math.ceil(dur * SR)
  const out = new Float32Array(n)
  let ph = 0
  const a = lpCoef(900)
  let y = 0
  for (let i = 0; i < n; i++) {
    const t = i / SR
    const f = 30 + 95 * Math.exp(-t / 0.4)
    ph += (TAU * f) / SR
    y += a * (noise() - y)
    out[i] = (Math.sin(ph) * Math.exp(-t / (dur / 3.2)) + y * Math.exp(-t / 0.35) * 0.9) * depth
  }
  return out
}

function riser(dur: number) {
  const n = Math.ceil(dur * SR)
  const out = new Float32Array(n)
  let y1 = 0
  let y2 = 0
  let ph = 0
  for (let i = 0; i < n; i++) {
    const p = i / n
    const fc = 250 * Math.pow(36, p)
    const a = lpCoef(fc)
    y1 += a * (noise() - y1)
    y2 += a * (y1 - y2)
    ph += (TAU * (180 * Math.pow(8, p))) / SR
    out[i] = (y2 * 2.2 + Math.sin(ph) * 0.12) * Math.pow(p, 2.2) * 0.9
  }
  return out
}

function whoosh(dur = 0.7, up = true) {
  const n = Math.ceil(dur * SR)
  const out = new Float32Array(n)
  let y1 = 0
  let y2 = 0
  for (let i = 0; i < n; i++) {
    const p = i / n
    const fc = up ? 400 * Math.pow(14, p) : 5600 * Math.pow(0.07, p)
    const a = lpCoef(fc)
    y1 += a * (noise() - y1)
    y2 += a * (y1 - y2)
    const env = Math.sin(Math.PI * Math.pow(p, 0.8))
    out[i] = (y1 - y2) * 4.5 * env
  }
  return out
}

function blip(freq: number, dur = 0.09, gain = 0.5) {
  const n = Math.ceil(dur * SR)
  const out = new Float32Array(n)
  for (let i = 0; i < n; i++) {
    const t = i / SR
    out[i] = Math.sin(TAU * freq * t) * Math.exp(-t / (dur / 4)) * Math.min(1, t / 0.0015) * gain
  }
  return out
}

function crack() {
  const n = Math.ceil(0.35 * SR)
  const out = new Float32Array(n)
  let prev = 0
  let ph = 0
  for (let i = 0; i < n; i++) {
    const t = i / SR
    const x = noise()
    const hp = x - prev * 0.6
    prev = x
    ph += (TAU * (200 * Math.exp(-t / 0.05) + 55)) / SR
    out[i] = hp * Math.exp(-t / 0.018) * 0.9 + Math.sin(ph) * Math.exp(-t / 0.12) * 0.8
  }
  return out
}

/* ---------------------------------- score --------------------------------- */

const BPM = 96
const BEAT = 60 / BPM
const BAR = BEAT * 4
// Dm, Bb, F, C : root midi + triad
const CHORDS = [
  { root: 38, notes: [62, 65, 69] },
  { root: 34, notes: [58, 62, 65] },
  { root: 41, notes: [60, 65, 69] },
  { root: 36, notes: [60, 64, 67] },
]
const chordAt = (t: number) => CHORDS[Math.floor(t / BAR) % CHORDS.length]

/** Section helpers (seconds), tied to narration cues so music follows the story. */
const T = {
  chainStart: at('c1', -0.1),
  breach: at('c5', 0.15),
  machines: at('m1'),
  hit: at('s1', -0.15),
  fixDrop: at('o1', 1.35),
  breakStart: at('o1', -0.2),
  end: at('end', -0.1),
}

async function buildMusic() {
  seed = 42
  const dry = new Stereo()
  const send = new Stereo()

  // 1. sub drone + hook shimmer (whole piece)
  for (let b = 0; b * BAR < TOTAL; b++) {
    const t = b * BAR
    const ch = chordAt(t)
    const level = t < T.chainStart ? 0.5 : t < T.hit ? 0.8 : 1
    const sub = new Float32Array(Math.ceil((BAR + 0.4) * SR))
    for (let i = 0; i < sub.length; i++) {
      const tt = i / SR
      const e = Math.min(1, tt / 0.3) * (tt > BAR ? Math.max(0, 1 - (tt - BAR) / 0.4) : 1)
      sub[i] = Math.sin(TAU * mtof(ch.root) * tt) * e * 0.3
    }
    dry.add(t, sub, level, 0)

    // pad chord
    const cut = t < T.chainStart ? 700 : t < T.hit ? 1100 + (t - T.chainStart) * 120 : t < T.end ? 2400 : 1500
    const padGain = t < 2 ? 0.2 : t < T.chainStart ? 0.55 : 0.9
    ch.notes.forEach((m, k) => {
      const p = pad(mtof(m), BAR, cut)
      dry.add(t, p, padGain * 0.55, -0.4 + k * 0.4)
      send.add(t, p, padGain * 0.5, -0.3 + k * 0.3)
    })
  }

  // hook shimmer bells
  const bellNotes = [81, 76, 74, 69, 77, 74]
  for (let k = 0; k < 6; k++) {
    const t = 0.45 + k * 0.95
    const b = bell(mtof(bellNotes[k]), 2.2)
    dry.add(t, b, 0.5, k % 2 ? 0.5 : -0.5)
    send.add(t, b, 0.9, 0)
  }

  // 2. findings flood texture (6s to 13s): soft rising granular ticks
  for (let t = at('p1'); t < at('p4'); t += 0.075) {
    const p = (t - at('p1')) / (at('p4') - at('p1'))
    if (rnd() < 0.55) {
      const b = blip(1800 + rnd() * 3200, 0.03, 0.09 + p * 0.1)
      dry.add(t + rnd() * 0.04, b, 1, rnd() * 1.6 - 0.8)
    }
  }

  // 3. pulse + arps
  const arp = (from: number, to: number, step: number, level: (t: number) => number, octave = 12) => {
    let i = 0
    for (let t = from; t < to; t += step, i++) {
      const ch = chordAt(t)
      const pattern = [0, 1, 2, 1, 2, 1, 0, 2]
      const note = ch.notes[pattern[i % pattern.length]] + octave
      const pl = pluck(mtof(note), 0.55)
      const lv = level(t)
      const pan = Math.sin(i * 0.9) * 0.55
      dry.add(t, pl, lv * 0.8, pan)
      send.add(t, pl, lv * 0.9, pan)
    }
  }
  arp(T.chainStart + 0.3, T.machines, BEAT / 2, (t) => (t < T.breach ? 0.22 + (t - T.chainStart) * 0.03 : 0.36))
  arp(T.machines, T.hit - 0.05, BEAT / 4, (t) => 0.3 + ((t - T.machines) / (T.hit - T.machines)) * 0.25)
  arp(T.hit + 0.2, T.breakStart, BEAT / 2, () => 0.42)
  arp(T.breakStart, T.fixDrop, BEAT / 2, () => 0.2, 0)
  arp(T.fixDrop, T.end - 0.1, BEAT / 2, () => 0.4)

  // kicks / hats / claps
  const kickBuf = kick()
  const hatC = hat(false)
  const clapB = clap()
  for (let t = T.chainStart + 0.3; t < T.machines; t += BEAT) {
    dry.add(t, kickBuf, t < T.breach ? 0.35 : 0.6, 0)
  }
  for (let t = T.machines; t < T.hit - 0.1; t += BEAT / 2) {
    dry.add(t, kickBuf, 0.55, 0)
    dry.add(t + BEAT / 4, hatC, 0.35, 0.3)
  }
  for (let t = T.hit + 0.2; t < T.end - 0.1; t += BEAT) {
    const inBreak = t >= T.breakStart && t < T.fixDrop
    if (!inBreak) {
      dry.add(t, kickBuf, 0.9, 0)
      dry.add(t + BEAT / 2, hat(false, 0.05), 0.5, 0.35)
    }
  }
  for (let t = T.hit + 0.2 + BEAT; t < T.end - 0.1; t += BEAT * 2) {
    if (t >= T.breakStart && t < T.fixDrop) continue
    const c = clapB
    dry.add(t, c, 0.5, 0)
    send.add(t, c, 0.5, 0)
  }
  for (let t = at('c3'); t < T.machines; t += BEAT / 2) dry.add(t + BEAT / 4, hat(false), 0.25, 0.4)

  // bass (saw, 8th pulses) in main section
  const bassSection = (from: number, to: number, level: number) => {
    for (let t = from; t < to; t += BEAT / 2) {
      const ch = chordAt(t)
      const n = Math.ceil((BEAT / 2) * 0.95 * SR)
      const out = new Float32Array(n)
      const a = lpCoef(520)
      let y = 0
      let ph = 0
      const f = mtof(ch.root)
      for (let i = 0; i < n; i++) {
        ph = (ph + f / SR) % 1
        y += a * ((ph * 2 - 1) - y)
        out[i] = y * Math.exp(-(i / SR) / 0.2) * Math.min(1, i / 120) * 0.7
      }
      dry.add(t, out, level, 0)
    }
  }
  bassSection(T.chainStart + 0.3, T.machines, 0.4)
  bassSection(T.hit + 0.2, T.breakStart, 0.7)
  bassSection(T.fixDrop, T.end - 0.1, 0.7)

  // 4. risers + impacts
  const r1 = riser(T.hit - (T.machines + 1.6))
  dry.add(T.machines + 1.6, r1, 0.75, 0)
  const r0 = riser(T.breach - 0.0 - (T.breach - 1.6))
  dry.add(T.breach - 1.6, r0, 0.4, 0)
  const b1 = boom(2.6, 1)
  dry.add(T.hit, b1, 1.0, 0)
  send.add(T.hit, b1, 0.5, 0)
  const rf = riser(T.end - (T.end - 1.7))
  dry.add(T.end - 1.7, rf, 0.6, 0)
  const b2 = boom(3.4, 1)
  dry.add(T.end, b2, 1.0, 0)
  send.add(T.end, b2, 0.6, 0)
  // breach stab (dissonant)
  for (const m of [50, 56, 63]) {
    const p = pad(mtof(m), 1.2, 1400, 0.02, 0.9)
    dry.add(T.breach, p, 0.9, 0)
    send.add(T.breach, p, 0.6, 0)
  }
  // resolution bloom on the fix
  for (const m of [62, 66, 69, 74]) {
    const b = bell(mtof(m), 2.4)
    dry.add(T.fixDrop, b, 0.6, (m % 3) - 1 > 0 ? 0.4 : -0.4)
    send.add(T.fixDrop, b, 1, 0)
  }
  // final resolve: sustained D-major bells + pad
  for (const m of [62, 66, 69, 74, 78]) {
    const b = bell(mtof(m), 3.6)
    dry.add(T.end + 0.05, b, 0.5, 0)
    send.add(T.end + 0.05, b, 1, 0)
  }
  for (const m of [50, 62, 66, 69]) {
    const p = pad(mtof(m), 4.2, 2600, 0.15, 1.6)
    dry.add(T.end + 0.05, p, 0.9, 0)
    send.add(T.end + 0.05, p, 0.6, 0)
  }

  const rev = reverb(send.L, send.R, 1.35, 0.86, 0.4)
  for (let i = 0; i < N; i++) {
    dry.L[i] += rev.L[i] * 0.85
    dry.R[i] += rev.R[i] * 0.85
  }
  return dry
}

/* ----------------------------------- sfx ---------------------------------- */

async function buildSfx() {
  seed = 7
  const dry = new Stereo()
  const send = new Stereo()
  const cues = sfxCues()
  for (const c of cues) {
    const g = c.gain ?? 1
    const pan = rnd() * 0.6 - 0.3
    switch (c.kind) {
      case 'tick':
        dry.add(c.t, blip(2400, 0.05, 0.45), g, pan)
        break
      case 'strike': {
        const w = whoosh(0.28, false)
        dry.add(c.t, w, 0.5 * g, 0)
        dry.add(c.t + 0.05, crack(), 0.35 * g, 0)
        break
      }
      case 'flood': {
        for (let i = 0; i < 70; i++) dry.add(c.t + i * 0.017 + rnd() * 0.01, blip(1400 + rnd() * 3600, 0.025, 0.2), g * 0.5, rnd() * 1.6 - 0.8)
        break
      }
      case 'whoosh':
        dry.add(c.t, whoosh(0.8, true), 0.45 * g, 0)
        break
      case 'node': {
        const f = 740 + (rnd() > 0.5 ? 0 : 148)
        const b = blip(f, 0.32, 0.5)
        dry.add(c.t, b, 0.7 * g, pan)
        send.add(c.t, b, 0.8 * g, pan)
        dry.add(c.t, blip(f * 2, 0.18, 0.2), 0.5 * g, pan)
        dry.add(c.t - 0.02, whoosh(0.16, true), 0.12 * g, pan)
        break
      }
      case 'breach': {
        const b = boom(1.8, 0.9)
        dry.add(c.t, b, 0.8 * g, 0)
        send.add(c.t, b, 0.4, 0)
        break
      }
      case 'riser-hit': {
        dry.add(c.t, whoosh(0.5, false), 0.5 * g, 0)
        break
      }
      case 'click':
        dry.add(c.t, blip(3200, 0.02, 0.8), 0.7 * g, 0)
        dry.add(c.t + 0.07, blip(1800, 0.03, 0.5), 0.5 * g, 0)
        break
      case 'check': {
        const a = blip(1318, 0.12, 0.4)
        const b = blip(1760, 0.2, 0.45)
        dry.add(c.t, a, 0.6 * g, 0.1)
        dry.add(c.t + 0.07, b, 0.6 * g, 0.1)
        send.add(c.t + 0.07, b, 0.5, 0)
        break
      }
      case 'snap':
        dry.add(c.t, crack(), 0.9 * g, 0)
        break
      case 'fix': {
        for (const f of [587, 740, 880, 1175]) {
          const b = bell(f, 1.6)
          dry.add(c.t, b, 0.5 * g, f % 2 ? -0.3 : 0.3)
          send.add(c.t, b, 0.7, 0)
        }
        break
      }
      case 'final-hit': {
        dry.add(c.t, whoosh(0.4, false), 0.4, 0)
        break
      }
    }
  }
  const rev = reverb(send.L, send.R, 0.9, 0.78, 0.5)
  for (let i = 0; i < N; i++) {
    dry.L[i] += rev.L[i] * 0.7
    dry.R[i] += rev.R[i] * 0.7
  }
  return dry
}

/* ------------------------------ voice envelope ----------------------------- */

async function voiceEnvelope() {
  const env = new Float32Array(N)
  let rmsSum = 0
  let rmsCount = 0
  for (const l of lines) {
    const raw = await readFile(`public/${l.file}`)
    const rate = raw.readUInt32LE(24)
    const dataIdx = raw.indexOf(Buffer.from('data')) + 8
    const total = Math.floor((raw.length - dataIdx) / 2)
    const win = Math.round(rate * 0.02)
    for (let w = 0; w + win <= total; w += win) {
      let s = 0
      for (let i = 0; i < win; i++) {
        const v = raw.readInt16LE(dataIdx + (w + i) * 2) / 32768
        s += v * v
      }
      const rms = Math.sqrt(s / win)
      const t0 = l.start + w / rate
      const a = Math.round(t0 * SR)
      const b = Math.round((t0 + 0.02) * SR)
      const v = Math.min(1, rms * 9)
      for (let k = a; k < b && k < N; k++) env[k] = Math.max(env[k], v)
      if (rms > 0.01) {
        rmsSum += rms * rms
        rmsCount++
      }
    }
  }
  // smooth with fast attack, slow release
  const sm = new Float32Array(N)
  let y = 0
  const atk = 1 - Math.exp(-1 / (0.02 * SR))
  const rel = 1 - Math.exp(-1 / (0.35 * SR))
  for (let i = 0; i < N; i++) {
    const c = env[i] > y ? atk : rel
    y += c * (env[i] - y)
    sm[i] = y
  }
  return { duck: sm, voiceRms: Math.sqrt(rmsSum / Math.max(1, rmsCount)) }
}

/* ---------------------------------- output --------------------------------- */

function toWav(L: Float32Array, R: Float32Array) {
  const data = Buffer.alloc(N * 4)
  for (let i = 0; i < N; i++) {
    const l = Math.max(-1, Math.min(1, L[i]))
    const r = Math.max(-1, Math.min(1, R[i]))
    data.writeInt16LE(Math.round(l * 32767), i * 4)
    data.writeInt16LE(Math.round(r * 32767), i * 4 + 2)
  }
  const head = Buffer.alloc(44)
  head.write('RIFF', 0)
  head.writeUInt32LE(36 + data.length, 4)
  head.write('WAVEfmt ', 8)
  head.writeUInt32LE(16, 16)
  head.writeUInt16LE(1, 20)
  head.writeUInt16LE(2, 22)
  head.writeUInt32LE(SR, 24)
  head.writeUInt32LE(SR * 4, 28)
  head.writeUInt16LE(4, 32)
  head.writeUInt16LE(16, 34)
  head.write('data', 36)
  head.writeUInt32LE(data.length, 40)
  return Buffer.concat([head, data])
}

function rmsOver(s: Stereo, gate: Float32Array) {
  let sum = 0
  let n = 0
  for (let i = 0; i < N; i += 4) {
    if (gate[i] > 0.3) {
      sum += s.L[i] * s.L[i]
      n++
    }
  }
  return Math.sqrt(sum / Math.max(1, n))
}

await mkdir('public/audio', { recursive: true })
const { duck, voiceRms } = await voiceEnvelope()
const music = await buildMusic()
const sfx = await buildSfx()

// duck music under the voice and scale it so it sits ~10 dB below the narration
for (let i = 0; i < N; i++) {
  const g = 1 - 0.5 * duck[i]
  music.L[i] *= g
  music.R[i] *= g
}
const musicRms = rmsOver(music, duck)
const target = voiceRms * 0.34
const scale = target / Math.max(1e-6, musicRms)
for (let i = 0; i < N; i++) {
  music.L[i] = Math.tanh(music.L[i] * scale * 1.0)
  music.R[i] = Math.tanh(music.R[i] * scale * 1.0)
  // fade in / out
  const t = i / SR
  const f = Math.min(1, t / 0.8) * Math.min(1, (TOTAL - t) / 1.2)
  music.L[i] *= f
  music.R[i] *= f
}
let peak = 0
for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(sfx.L[i]), Math.abs(sfx.R[i]))
const sfxScale = peak > 0 ? 1.9 : 1
for (let i = 0; i < N; i++) {
  sfx.L[i] = Math.tanh(sfx.L[i] * sfxScale)
  sfx.R[i] = Math.tanh(sfx.R[i] * sfxScale)
}

let mp = 0
for (let i = 0; i < N; i++) mp = Math.max(mp, Math.abs(music.L[i]))
console.log('voice rms', voiceRms.toFixed(3), '| music rms under voice', (musicRms * scale).toFixed(3), '| music peak', mp.toFixed(2), '| sfx scale', sfxScale.toFixed(2))

await writeFile('public/audio/music.wav', toWav(music.L, music.R))
await writeFile('public/audio/sfx.wav', toWav(sfx.L, sfx.R))
console.log('wrote public/audio/music.wav and sfx.wav', endOf('end').toFixed(1))
