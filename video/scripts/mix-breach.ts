import { readFileSync, writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'

const SR = 44100
const SECONDS = 60
const N = SR * SECONDS
const VOICE_GAIN = 0.9
const MUSIC_GAIN = 0.4
const MUSIC_DUCKED = 0.16

type Wav = { rate: number; channels: number; frames: number; sample: (ch: number, i: number) => number }

function readWav(path: string): Wav {
  const b = readFileSync(path)
  const dataIdx = b.indexOf(Buffer.from('data'))
  const channels = b.readUInt16LE(22)
  const rate = b.readUInt32LE(24)
  const start = dataIdx + 8
  const frames = Math.floor((b.length - start) / 2 / channels)
  return { rate, channels, frames, sample: (ch, i) => b.readInt16LE(start + (i * channels + Math.min(ch, channels - 1)) * 2) / 32768 }
}

const left = new Float32Array(N)
const right = new Float32Array(N)

function add(wav: Wav, atSeconds: number, gain: number, loop = false) {
  const from = Math.round(atSeconds * SR)
  const total = Math.floor((wav.frames * SR) / wav.rate)
  const end = loop ? N : Math.min(N, from + total)
  for (let k = from; k < end; k++) {
    const i = (k - from) % total
    const src = Math.min(wav.frames - 1, Math.floor((i * wav.rate) / SR))
    left[k] += wav.sample(0, src) * gain
    right[k] += wav.sample(1, src) * gain
  }
}

const timeline = JSON.parse(readFileSync('src/timeline-breach.json', 'utf8')) as { lines: { file: string; start: number; dur: number }[] }

// Music is added to a separate bed so it can be ducked under the voice before summing.
const musicL = new Float32Array(N)
const musicR = new Float32Array(N)
const music = readWav('public/audio/music.wav')
const musicLen = Math.min(N, Math.floor((music.frames * SR) / music.rate))
for (let k = 0; k < musicLen; k++) {
  const src = Math.min(music.frames - 1, Math.floor((k * music.rate) / SR))
  musicL[k] = music.sample(0, src)
  musicR[k] = music.sample(1, src)
}

// Voice-activity envelope with fast attack and slow release, so the bed dips smoothly under each line.
const target = new Float32Array(N).fill(MUSIC_GAIN)
for (const line of timeline.lines) {
  const a = Math.max(0, Math.round((line.start - 0.1) * SR))
  const b = Math.min(N, Math.round((line.start + line.dur + 0.15) * SR))
  for (let k = a; k < b; k++) target[k] = MUSIC_DUCKED
}
const attack = 1 - Math.exp(-1 / (SR * 0.12))
const release = 1 - Math.exp(-1 / (SR * 0.6))
let env: number = MUSIC_GAIN
const lastLine = timeline.lines[timeline.lines.length - 1]
const outroStart = (lastLine.start + lastLine.dur) * SR
for (let i = 0; i < N; i++) {
  env += (target[i] - env) * (target[i] < env ? attack : release)
  // After the last word, fade the music linearly to silence by the end of the track.
  const outro = i < outroStart ? 1 : Math.max(0, 1 - (i - outroStart) / (N - outroStart))
  left[i] += musicL[i] * env * outro
  right[i] += musicR[i] * env * outro
}
for (const line of timeline.lines) add(readWav(`public/${line.file}`), line.start, VOICE_GAIN)

const fadeIn = SR * 1.5
for (let i = 0; i < N; i++) {
  const g = Math.min(1, i / fadeIn)
  left[i] *= g
  right[i] *= g
}

let peak = 0
for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(left[i]), Math.abs(right[i]))
const scale = peak > 0.98 ? 0.98 / peak : 1

const pcm = Buffer.alloc(N * 4)
for (let i = 0; i < N; i++) {
  pcm.writeInt16LE(Math.round(Math.max(-1, Math.min(1, left[i] * scale)) * 32767), i * 4)
  pcm.writeInt16LE(Math.round(Math.max(-1, Math.min(1, right[i] * scale)) * 32767), i * 4 + 2)
}
const header = Buffer.alloc(44)
header.write('RIFF', 0)
header.writeUInt32LE(36 + pcm.length, 4)
header.write('WAVEfmt ', 8)
header.writeUInt32LE(16, 16)
header.writeUInt16LE(1, 20)
header.writeUInt16LE(2, 22)
header.writeUInt32LE(SR, 24)
header.writeUInt32LE(SR * 4, 28)
header.writeUInt16LE(4, 32)
header.writeUInt16LE(16, 34)
header.write('data', 36)
header.writeUInt32LE(pcm.length, 40)
writeFileSync('/tmp/breach-full.wav', Buffer.concat([header, pcm]))

execFileSync('pnpm', ['exec', 'remotion', 'ffmpeg', '-y', '-i', '/tmp/breach-full.wav', '-c:a', 'libmp3lame', '-b:a', '160k', 'public/audio/breach-mix.mp3'], { stdio: 'ignore' })
console.log('breach-mix.mp3 written, peak', peak.toFixed(3), 'scale', scale.toFixed(3))
