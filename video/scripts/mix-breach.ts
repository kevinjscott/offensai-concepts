import { readFileSync, writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'

const SR = 44100
const SECONDS = 68
const N = SR * SECONDS
const VOICE_GAIN = 0.8
const MUSIC_GAIN = 0.6

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

const timeline = JSON.parse(readFileSync('src/timeline-breach.json', 'utf8')) as { lines: { file: string; start: number }[] }
add(readWav('public/audio/music.wav'), 0, MUSIC_GAIN, true)
for (const line of timeline.lines) add(readWav(`public/${line.file}`), line.start, VOICE_GAIN)

const fadeIn = SR * 1.5
const fadeOut = SR * 3
for (let i = 0; i < N; i++) {
  const g = Math.min(1, i / fadeIn, (N - i) / fadeOut)
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
