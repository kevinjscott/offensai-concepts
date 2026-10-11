import { writeFile } from 'node:fs/promises'
import timeline from '../src/timeline-breach.json' with { type: 'json' }

type Line = { id: string; start: number; dur: number }
const lines = timeline.lines as Line[]
const L_ = (id: string) => lines.find((l) => l.id === id) as Line
const at = (id: string, offset = 0) => L_(id).start + offset
const durOf = (id: string) => L_(id).dur
const endOf = (id: string) => at(id) + durOf(id)

const SR = 44100
const TOTAL = Math.ceil(timeline.total + 1.8)
const N = SR * TOTAL
const TAU = Math.PI * 2

/* ---------------------------------- utils --------------------------------- */

const buf = (sec: number) => new Float32Array(Math.ceil(sec * SR))
const mtof = (m: number) => 440 * Math.pow(2, (m - 69) / 12)

let seed = 4242
const rnd = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0
  return seed / 4294967296
}
const noise = () => rnd() * 2 - 1

class Stereo {
  L = new Float32Array(N)
  R = new Float32Array(N)
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
        const v = sig[i] + y * 0.5
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

/** State-variable band-pass over noise with a moving centre frequency. */
function sweep(dur: number, fcAt: (p: number) => number, ampAt: (p: number) => number, q = 0.3, comp = 3) {
  const n = Math.ceil(dur * SR)
  const out = new Float32Array(n)
  let low = 0
  let band = 0
  for (let i = 0; i < n; i++) {
    const p = i / n
    const f = 2 * Math.sin((Math.PI * Math.min(fcAt(p), SR * 0.2)) / SR)
    low += f * band
    const high = noise() - low - q * band
    band += f * high
    out[i] = band * ampAt(p) * comp
  }
  return out
}

function sub(freq: number, dur: number) {
  const o = buf(dur)
  for (let i = 0; i < o.length; i++) {
    const t = i / SR
    const a = Math.min(1, t / 0.01) * Math.exp((-3.2 * t) / dur) * Math.min(1, (dur - t) / 0.03)
    o[i] = (Math.sin(TAU * freq * t) + 0.22 * Math.sin(TAU * 2 * freq * t)) * a
  }
  return o
}

function bassNote(freq: number, dur = 0.26) {
  const o = buf(dur)
  let lp = 0
  for (let i = 0; i < o.length; i++) {
    const t = i / SR
    const saw = 2 * ((freq * t) % 1) - 1
    const fc = 160 + 900 * Math.exp(-t * 16)
    lp += (1 - Math.exp((-TAU * fc) / SR)) * (saw - lp)
    const a = Math.min(1, t / 0.004) * Math.exp(-t * 7) * Math.min(1, (dur - t) / 0.02)
    o[i] = (lp * 0.9 + Math.sin(TAU * freq * t) * 0.7) * a
  }
  return o
}

function kick() {
  const dur = 0.42
  const o = buf(dur)
  let ph = 0
  for (let i = 0; i < o.length; i++) {
    const t = i / SR
    ph += (TAU * (46 + 120 * Math.exp(-t * 26))) / SR
    o[i] = Math.sin(ph) * Math.exp(-t * 8.5) + (t < 0.004 ? noise() * 0.4 : 0)
  }
  return o
}

function hat(len = 0.045) {
  const o = buf(len * 3)
  let prev = 0
  for (let i = 0; i < o.length; i++) {
    const t = i / SR
    const x = noise()
    o[i] = (x - prev) * Math.exp((-t / len) * 4.5)
    prev = x
  }
  return o
}

function clap() {
  const o = buf(0.3)
  let lp = 0
  for (let i = 0; i < o.length; i++) {
    const t = i / SR
    lp += 0.35 * (noise() - lp)
    const burst = [0, 0.011, 0.022].reduce((s, b) => s + (t >= b ? Math.exp(-(t - b) * 60) * (t - b < 0.02 ? 0.6 : 1) : 0), 0)
    o[i] = lp * burst * 0.5 + lp * Math.exp(-t * 18) * 0.25
  }
  return o
}

function pad(freq: number, dur: number, fc: number, attack = 0.7, release = 1.1) {
  const o = buf(dur)
  const detunes = [0.9965, 1, 1.0035]
  let a1 = 0
  let a2 = 0
  const k = 1 - Math.exp((-TAU * fc) / SR)
  for (let i = 0; i < o.length; i++) {
    const t = i / SR
    let s = 0
    for (const d of detunes) s += 2 * ((freq * d * t) % 1) - 1
    s = s / 3 + Math.sin(TAU * freq * t) * 0.4
    a1 += k * (s - a1)
    a2 += k * (a1 - a2)
    o[i] = a2 * Math.min(1, t / attack) * Math.min(1, (dur - t) / release)
  }
  return o
}

function pluck(freq: number, dur = 0.24) {
  const o = buf(dur)
  let lp = 0
  for (let i = 0; i < o.length; i++) {
    const t = i / SR
    const x = 0.6 * (2 * ((freq * t) % 1) - 1) + 0.4 * Math.sign(Math.sin(TAU * freq * t))
    const fc = 700 + 3600 * Math.exp(-t * 22)
    lp += (1 - Math.exp((-TAU * fc) / SR)) * (x - lp)
    o[i] = lp * Math.exp(-t * 13) * Math.min(1, t / 0.002)
  }
  return o
}

function ping(freq: number, dur = 0.8, idx = 1.6, decay = 5.5) {
  const o = buf(dur)
  for (let i = 0; i < o.length; i++) {
    const t = i / SR
    const m = idx * Math.exp(-t * 9) * Math.sin(TAU * freq * 2.0 * t)
    o[i] = Math.sin(TAU * freq * t + m) * Math.exp(-t * decay) * Math.min(1, t / 0.002)
  }
  return o
}

function boom(dur = 2.4) {
  const o = buf(dur)
  let ph = 0
  let lp = 0
  for (let i = 0; i < o.length; i++) {
    const t = i / SR
    ph += (TAU * (31 + 42 * Math.exp(-t * 3.2))) / SR
    lp += 0.06 * (noise() - lp)
    o[i] = Math.sin(ph) * Math.exp(-t * (3.2 / (dur / 2.4))) + lp * 2.2 * Math.exp(-t * 11)
  }
  return o
}

function stab(freqs: number[], dur: number, fc: number, trem = 0) {
  const o = buf(dur)
  let a1 = 0
  let a2 = 0
  const k = 1 - Math.exp((-TAU * fc) / SR)
  for (let i = 0; i < o.length; i++) {
    const t = i / SR
    let s = 0
    for (const f of freqs) s += (2 * ((f * 0.997 * t) % 1) - 1) + (2 * ((f * 1.003 * t) % 1) - 1)
    s /= freqs.length * 2
    a1 += k * (s - a1)
    a2 += k * (a1 - a2)
    const tr = trem ? 0.65 + 0.35 * Math.sin(TAU * trem * t) : 1
    o[i] = a2 * tr * Math.min(1, t / 0.004) * Math.exp(-t * 4.5) * Math.min(1, (dur - t) / 0.03)
  }
  return o
}

function glass() {
  const o = buf(0.9)
  const partials = [2870, 4310, 6140, 7790]
  let prev = 0
  let ph = 0
  for (let i = 0; i < o.length; i++) {
    const t = i / SR
    const x = noise()
    const click = (x - prev) * Math.exp(-t * 90)
    prev = x
    let s = click * 0.9
    partials.forEach((f, j) => (s += Math.sin(TAU * f * t) * Math.exp(-t * (14 + j * 7)) * 0.28))
    ph += (TAU * (150 * Math.exp(-t * 14) + 55)) / SR
    s += Math.sin(ph) * Math.exp(-t * 16) * 0.9
    o[i] = s
  }
  return o
}

const reversed = (b: Float32Array) => Float32Array.from(b).reverse()

const zip = (dur = 0.17, up = true) =>
  sweep(dur, (p) => (up ? 700 * Math.pow(7, p) : 5000 * Math.pow(0.14, p)), (p) => Math.sin(Math.PI * p) ** 1.5, 0.25, 2.4)
const whoosh = (dur: number, up = true) =>
  sweep(dur, (p) => (up ? 280 * Math.pow(14, p) : 4000 * Math.pow(0.07, p)), (p) => Math.sin(Math.PI * p) ** 2, 0.4, 2.2)
const riser = (dur: number) =>
  sweep(dur, (p) => 350 * Math.pow(14, p), (p) => p * p, 0.35, 2.6)

/* ---------------------------------- score --------------------------------- */

const BPM = 112
const BEAT = 60 / BPM
const BAR = BEAT * 4
const CHORDS = {
  Am: { root: 33, tri: [57, 60, 64] },
  F: { root: 29, tri: [53, 57, 60] },
  C: { root: 36, tri: [55, 60, 64] },
  G: { root: 31, tri: [55, 59, 62] },
}
const PROG = [CHORDS.Am, CHORDS.F, CHORDS.C, CHORDS.G]
const CHAIN_PROG = [CHORDS.Am, CHORDS.Am, CHORDS.F, CHORDS.G]
const PENTA = [57, 60, 62, 64, 67, 69, 72, 74, 76, 79]

const hopTimes = [
  at('b3'),
  at('b4'),
  at('b5', durOf('b5') * 0.06),
  at('b5', durOf('b5') * 0.56),
  at('b6'),
  at('b7'),
  at('b7', durOf('b7') * 0.35),
  at('b7', durOf('b7') * 0.67),
  at('b8'),
]
const HOP_X = hopTimes.map((_, i) => {
  const row = i < 5 ? 0 : 1
  const col = row === 0 ? i : i - 5
  const count = row === 0 ? 5 : 4
  const total = count * 330 + (count - 1) * 48
  return (1920 - total) / 2 + col * 378 + 165
})

const S = {
  chain: at('b3', -0.1),
  breach: at('b9'),
  offense: at('b11', -0.05),
  brk: at('b14', -0.1),
  fix: at('b15', 0.5),
  close: at('b16', -0.3),
}

const grid = (from: number, to: number, step: number, fn: (t: number, k: number) => void) => {
  let k = 0
  for (let t = from; t < to - 1e-6; t += step, k++) fn(t, k)
}

async function buildMusic() {
  const dry = new Stereo()
  const send = new Stereo()
  const kickB = kick()
  const chordAt = (prog: typeof PROG, start: number, t: number) => prog[Math.floor((t - start) / BAR) % prog.length]
  const padChord = (c: (typeof PROG)[number], t: number, dur: number, fc: number, gain: number) => {
    for (const m of c.tri) {
      const p = pad(mtof(m - 12), dur, fc, 0.5, 0.8)
      dry.add(t, p, gain, 0)
      send.add(t, p, gain * 0.5, 0)
    }
  }

  // intro: a held low drone with a slow heartbeat and one distant bell
  const drone = pad(mtof(33), S.chain + 0.2, 380, 1.4, 0.6)
  dry.add(0, drone, 0.55, 0)
  const drone2 = pad(mtof(45), S.chain + 0.2, 520, 1.8, 0.6)
  dry.add(0, drone2, 0.22, 0)
  grid(0.9, S.chain, BEAT * 2, (t, k) => dry.add(t, sub(48, 0.3), 0.18 + k * 0.035, 0))
  const intro = ping(mtof(88), 2.4, 1.2, 2.2)
  send.add(at('b2'), intro, 0.14, 0.4)

  // chain: layers stack with each hop, so the track itself builds link by link
  const hopIdx = (t: number) => hopTimes.filter((h) => t >= h - 0.05).length
  grid(S.chain, S.breach - 0.02, BEAT / 2, (t, k) => {
    const h = hopIdx(t)
    const c = chordAt(CHAIN_PROG, S.chain, t)
    if (h >= 1) dry.add(t, bassNote(mtof(c.root)), 0.34 + h * 0.02, 0)
    if (h >= 3 && k % 2 === 1) dry.add(t, hat(), 0.16, 0.3)
    if (h >= 6) {
      dry.add(t + BEAT / 4, hat(0.03), 0.09, -0.3)
    }
    if (h >= 4 && rnd() < 0.7) {
      const n = c.tri[k % 3] + (k % 8 >= 4 ? 12 : 0) + 12
      const pan = k % 2 ? 0.35 : -0.35
      const p = pluck(mtof(n))
      dry.add(t, p, 0.07 + h * 0.008, pan)
      send.add(t, p, 0.1, pan)
    }
  })
  grid(S.chain, S.breach - 0.02, BEAT, (t, k) => {
    const h = hopIdx(t)
    if (h >= 6) dry.add(t, kickB, 0.62, 0)
    else if (h >= 2 && k % 2 === 0) dry.add(t, kickB, 0.5, 0)
    if (h >= 6 && k % 2 === 1) dry.add(t, clap(), 0.2, 0)
  })
  grid(S.chain + BAR, S.breach - 0.4, BAR, (t) => {
    if (hopIdx(t) >= 2) padChord(chordAt(CHAIN_PROG, S.chain, t), t, BAR + 0.4, 700, 0.07)
  })
  const lead = riser(S.breach - hopTimes[8])
  dry.add(hopTimes[8], lead, 0.28, 0)

  // breach: a tritone alarm stab, then the bed collapses to a dark drone for the question
  const alarm = stab([mtof(57), mtof(63), mtof(69)], 0.9, 2400, 11)
  dry.add(S.breach, alarm, 0.75, 0)
  send.add(S.breach, alarm, 0.5, 0)
  const dark = pad(mtof(33), S.offense - S.breach + 0.3, 340, 0.4, 1.2)
  dry.add(S.breach, dark, 0.6, 0)
  const cluster = pad(mtof(45), S.offense - S.breach + 0.3, 460, 1.0, 1.2)
  dry.add(S.breach, cluster, 0.18, 0)
  const tri = pad(mtof(51), S.offense - S.breach - 1.5, 420, 1.5, 1.2)
  dry.add(S.breach + 1.5, tri, 0.1, 0)
  grid(S.breach + 1.9, at('b11', -0.9), BEAT * 2, (t, k) => dry.add(t, sub(44, 0.34), 0.2 - k * 0.012, 0))

  // offense: a clean, confident groove that grows through map, compose, prove
  const mapT = at('b11')
  const composeT = at('b12')
  const proveT = at('b13')
  grid(S.offense, S.brk - 0.02, BEAT, (t, k) => {
    dry.add(t, kickB, 0.75, 0)
    if (t >= composeT && k % 2 === 1) dry.add(t, clap(), 0.2, 0)
  })
  grid(S.offense, S.brk - 0.02, BEAT / 2, (t, k) => {
    const c = chordAt(PROG, S.offense, t)
    if (k % 2 === 1) dry.add(t, bassNote(mtof(c.root + (k % 8 === 7 ? 12 : 0)), 0.22), 0.42, 0)
    if (t >= composeT) {
      dry.add(t, hat(), k % 2 ? 0.2 : 0.11, 0.25)
      const n = c.tri[k % 3] + 12 + (t >= proveT && k % 4 >= 2 ? 12 : 0)
      const pan = k % 2 ? 0.4 : -0.4
      const p = pluck(mtof(n))
      dry.add(t, p, t >= proveT ? 0.1 : 0.075, pan)
      send.add(t, p, 0.13, pan)
    }
    if (t >= proveT && k % 4 === 3) dry.add(t, hat(0.1), 0.12, -0.3)
  })
  grid(S.offense, S.brk, BAR, (t) => padChord(chordAt(PROG, S.offense, t), t, BAR + 0.5, 1700, 0.085))

  // break: pressure returns, then one clean cut and release
  grid(S.brk, S.fix - 0.1, BEAT * 2, (t, k) => dry.add(t, kickB, 0.38 + k * 0.03, 0))
  grid(S.brk, S.fix - 0.1, BEAT, (t) => dry.add(t, bassNote(mtof(33), 0.3), 0.3, 0))
  const tension = pad(mtof(45), S.fix - S.brk + 0.1, 520, 0.6, 0.15)
  dry.add(S.brk, tension, 0.25, 0)
  const rise = riser(S.fix - (S.fix - 1.5))
  dry.add(S.fix - 1.5, rise, 0.3, 0)

  // resolve and close: warm C major, bells, then a long fade
  const tail = TOTAL - S.fix
  const resolved = [48, 55, 60, 64, 67]
  for (const m of resolved) {
    const p = pad(mtof(m), tail, 1500, 0.5, 2.2)
    dry.add(S.fix + 0.12, p, 0.12, 0)
    send.add(S.fix + 0.12, p, 0.2, 0)
  }
  for (const m of [72, 76, 79, 83]) {
    const b = ping(mtof(m), 3, 1.1, 1.6)
    const t = m === 72 ? S.fix + 0.15 : endOf('b16') - 1.2 + (m - 72) * 0.14
    dry.add(t, b, 0.1, 0)
    send.add(t, b, 0.4, 0)
  }

  const r = reverb(send.L, send.R, 1.1, 0.86, 0.4)
  for (let i = 0; i < N; i++) {
    dry.L[i] += r.L[i] * 0.55
    dry.R[i] += r.R[i] * 0.55
  }
  return dry
}

async function buildSfx() {
  const dry = new Stereo()
  const send = new Stereo()
  const panOf = (x: number) => Math.max(-0.7, Math.min(0.7, (x / 1920 - 0.5) * 1.4))
  const ping1 = (m: number, t: number, g: number, pan = 0, dur = 0.7) => {
    const p = ping(mtof(m), dur)
    dry.add(t, p, g, pan)
    send.add(t, p, g * 0.6, pan)
  }
  const tick = (t: number, g = 0.12, pan = 0, f = 1800) => {
    const p = ping(f, 0.09, 0.4, 40)
    dry.add(t, p, g, pan)
  }
  const swipe = (t: number, g = 0.16) => {
    dry.add(t, whoosh(0.55, true), g, -0.3)
    dry.add(t + 0.02, whoosh(0.55, true), g * 0.8, 0.3)
  }

  // scene transitions share one soft swipe so every cut has the same texture
  for (const t of [at('b3', -0.45), at('b10', -0.71), at('b11', -0.43), at('b14', -0.5), at('b16', -0.65)]) swipe(t, 0.12)

  // incident: title lands with weight, sub-line ticks in, then the chain tag
  const t0 = boom(1.6)
  dry.add(0.38, t0, 0.35, 0)
  send.add(0.38, t0, 0.25, 0)
  tick(1.2, 0.1, 0, 2400)
  tick(1.26, 0.07, 0.2, 3200)
  ping1(81, at('b2'), 0.14, -0.2, 0.45)
  ping1(76, at('b2', 0.12), 0.14, 0.2, 0.45)

  // chain: each hop is a pitched ping that climbs the scale, panned to its card, with a connector zip
  hopTimes.forEach((t, i) => {
    const pan = panOf(HOP_X[i])
    const note = PENTA[i % PENTA.length]
    if (i > 0) dry.add(t - 0.36, zip(0.17, true), 0.2, pan)
    tick(t + 0.03, 0.14, pan, 1500 + i * 180)
    ping1(note, t + 0.05, 0.27, pan, 0.55)
  })

  // the breach: red alarm hit, impact and a downward sweep
  const hit = boom(2.8)
  dry.add(S.breach, hit, 0.95, 0)
  send.add(S.breach, hit, 0.4, 0)
  dry.add(S.breach, whoosh(0.9, false), 0.24, 0)
  const glitch = [0, 0.09, 0.15]
  glitch.forEach((o, i) => tick(S.breach + 0.5 + o, 0.12, i % 2 ? 0.4 : -0.4, 900))

  // question: a thin scatter of dots, then a reversed swell into OFFENSAI
  grid(at('b10', -0.4), at('b10', 1.6), 0.13, (t, k) => {
    const m = PENTA[Math.floor(rnd() * 6)] + 12
    tick(t, 0.045 + (k % 3) * 0.01, rnd() * 1.4 - 0.7, mtof(m))
  })
  const swellIn = at('b11', -1.2)
  dry.add(swellIn, riser(1.15), 0.28, 0)
  dry.add(swellIn, reversed(boom(1.3)), 0.3, 0)

  // OFFENSAI: a bright, clean entrance
  const open = boom(1.7)
  dry.add(at('b11', -0.02), open, 0.55, 0)
  send.add(at('b11', -0.02), open, 0.25, 0)
  for (const [j, m] of [67, 72, 76, 83].entries()) ping1(m, at('b11') + j * 0.05, 0.14, 0, 1.4)

  // map: cloud labels, then the node field
  ;[60, 64, 67, 72].forEach((m, i) => ping1(m, at('b11') + 0.35 + i * 0.25, 0.17, (i - 1.5) * 0.35, 0.5))
  for (let i = 0; i < 12; i++) tick(at('b11') + 0.42 + i * 0.1, 0.05, ((i % 4) - 1.5) * 0.4, 1400 + (i % 3) * 400)

  // compose: nodes light up one after the other, rising
  for (let k = 1; k <= 6; k++) {
    const t = composeT() + 0.6 + (k - 1) * 0.55
    const pan = (k - 3.5) * 0.22
    if (k > 1) dry.add(t - 0.12, zip(0.14, true), 0.17, pan)
    ping1(PENTA[k + 1], t, 0.24, pan, 0.6)
  }

  // prove: a bright confirmation chirp on every hop, then a settled chime
  for (let k = 1; k <= 6; k++) {
    const t = proveT() + 0.8 + (k - 1) * 0.5
    const pan = (k - 3.5) * 0.22
    ping1(88, t, 0.14, pan, 0.28)
    ping1(93, t + 0.07, 0.14, pan, 0.4)
  }
  const done = proveT() + 0.8 + 6 * 0.5
  for (const [j, m] of [72, 76, 79, 84].entries()) ping1(m, done + j * 0.04, 0.2, 0, 1.6)
  const doneSub = sub(65, 0.9)
  dry.add(done, doneSub, 0.3, 0)

  // break: five ember nodes come up with low thunks, the one fix cuts the chain
  for (let i = 0; i < 5; i++) {
    const t = at('b14') + i * 0.15
    dry.add(t, sub(70 + i * 6, 0.18), 0.22, (i - 2) * 0.3)
    tick(t + 0.01, 0.07, (i - 2) * 0.3, 1100)
  }
  const crackT = at('b15', 0.5)
  const g = glass()
  dry.add(crackT, g, 0.7, 0)
  send.add(crackT, g, 0.4, 0)
  dry.add(crackT + 0.03, whoosh(0.7, false), 0.2, 0)
  const thud = boom(1.2)
  dry.add(crackT, thud, 0.4, 0)

  // close: the logo arrives with a soft sub swell, then a shimmer for the tagline
  const logoT = at('b16', -0.05)
  dry.add(logoT - 0.55, whoosh(0.6, true), 0.14, 0)
  const logoHit = boom(1.4)
  dry.add(logoT - 0.02, logoHit, 0.42, 0)
  send.add(logoT - 0.02, logoHit, 0.3, 0)
  for (const [j, m] of [79, 84, 88, 91, 95].entries()) ping1(m, at('b16', 1.0) + j * 0.09, 0.1, (j - 2) * 0.2, 1.8)

  const r = reverb(send.L, send.R, 0.8, 0.8, 0.45)
  for (let i = 0; i < N; i++) {
    dry.L[i] += r.L[i] * 0.5
    dry.R[i] += r.R[i] * 0.5
  }
  return dry
}

const composeT = () => at('b12')
const proveT = () => at('b13')

function toWav(L: Float32Array, R: Float32Array) {
  const data = Buffer.alloc(N * 4)
  for (let i = 0; i < N; i++) {
    data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i])) * 32767), i * 4)
    data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i])) * 32767), i * 4 + 2)
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

const music = await buildMusic()
const sfx = await buildSfx()

// music: level-match to a fixed RMS, fade in/out
let sum = 0
for (let i = 0; i < N; i += 4) sum += music.L[i] * music.L[i]
const mScale = 0.2 / Math.max(1e-6, Math.sqrt(sum / (N / 4)))
for (let i = 0; i < N; i++) {
  const t = i / SR
  const f = Math.min(1, t / 0.6) * Math.min(1, (TOTAL - t) / 1.6)
  music.L[i] = Math.tanh(music.L[i] * mScale) * f
  music.R[i] = Math.tanh(music.R[i] * mScale) * f
}

// sfx: peak-normalise so the loudest hit sits just under full scale
let peak = 0
for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(sfx.L[i]), Math.abs(sfx.R[i]))
const sScale = peak > 0 ? 0.85 / peak : 1
for (let i = 0; i < N; i++) {
  sfx.L[i] = Math.tanh(sfx.L[i] * sScale * 1.1)
  sfx.R[i] = Math.tanh(sfx.R[i] * sScale * 1.1)
}

await writeFile('public/audio/music-breach.wav', toWav(music.L, music.R))
await writeFile('public/audio/sfx-breach.wav', toWav(sfx.L, sfx.R))
console.log('score written,', TOTAL, 's; sfx peak', peak.toFixed(2))
