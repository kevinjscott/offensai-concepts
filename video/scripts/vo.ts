import { generateSpeech } from 'ai'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'

const MODEL = 'google/gemini-3.8-flash-tts'
const VOICE = 'Charon'
const INSTRUCTIONS =
  'Documentary narrator for a premium cybersecurity product film. Low, calm, confident, quietly intense, no hype, no smile. Speak at a fast, energetic trailer-narration pace, about 1.3 times normal speed, with almost no pauses and crisp consonants. Finish each line with a clean, decisive downward landing.'

interface Line {
  id: string
  /** Text as spoken (spelled for pronunciation) */
  say: string
  /** On-screen caption text */
  caption: string
  /** Silence before this line, in seconds */
  gap: number
}

const LINES: Line[] = [
  { id: 'hook1', say: "Your cloud doesn't have a vulnerability problem.", caption: "Your cloud doesn't have a vulnerability problem.", gap: 0.7 },
  { id: 'hook2', say: 'It has a chain problem.', caption: 'It has a chain problem.', gap: 0.35 },
  { id: 'p1', say: 'Scanners hand you thousands of findings.', caption: 'Scanners hand you thousands of findings.', gap: 0.7 },
  { id: 'p3', say: "But attackers don't exploit findings.", caption: "But attackers don't exploit findings.", gap: 0.5 },
  { id: 'p4', say: 'They chain them.', caption: 'They chain them.', gap: 0.2 },
  { id: 'c1', say: 'A pipeline token.', caption: 'A pipeline token.', gap: 0.3 },
  { id: 'c2', say: 'A loose trust rule.', caption: 'A loose trust rule.', gap: 0.1 },
  { id: 'c3', say: 'A powerful role.', caption: 'A powerful role.', gap: 0.1 },
  { id: 'c4', say: 'A forgotten secret.', caption: 'A forgotten secret.', gap: 0.1 },
  { id: 'c5', say: 'Your production data.', caption: 'Your production data.', gap: 0.1 },
  { id: 'm1', say: 'Now machines walk those chains faster than any team can review.', caption: 'Now machines walk those chains faster than any team can review.', gap: 0.55 },
  { id: 's1', say: 'Offens A.I. sends autonomous agents to think like an attacker.', caption: 'OFFENSAI sends autonomous agents to think like an attacker.', gap: 0.75 },
  { id: 's2', say: 'They map your cloud as a graph.', caption: 'They map your cloud as a graph.', gap: 0.25 },
  { id: 's3', say: 'Compose real attack chains across clouds and pipelines.', caption: 'Compose real attack chains across clouds and pipelines.', gap: 0.25 },
  { id: 's4', say: 'Then validate each one, safely, on your command.', caption: 'Then validate each one, safely, on your command.', gap: 0.25 },
  { id: 'r1', say: "Every path is scored by what's proven exploitable.", caption: "Every path is scored by what's proven exploitable.", gap: 0.55 },
  { id: 'r2', say: "Not what's merely possible.", caption: "Not what's merely possible.", gap: 0.2 },
  { id: 'o1', say: 'Fix the one hop that breaks the chain.', caption: 'Fix the one hop that breaks the chain.', gap: 0.5 },
  { id: 'o2', say: 'With evidence your auditors can trust.', caption: 'With evidence your auditors can trust.', gap: 0.2 },
  { id: 'end', say: 'Offens A.I. See your cloud the way attackers do.', caption: 'OFFENSAI. See your cloud the way attackers do.', gap: 0.6 },
]

const OUT = 'public/vo'
const FPS = 30
await mkdir(OUT, { recursive: true })

/** Parse a 16-bit PCM WAV, trim leading/trailing silence, return a new WAV. */
function trimWav(buf: Buffer, thresh = 600, keepHead = 0.04, keepTail = 0.12) {
  const dataIdx = buf.indexOf(Buffer.from('data'))
  const rate = buf.readUInt32LE(24)
  const ch = buf.readUInt16LE(22)
  const dataStart = dataIdx + 8
  const pcm = buf.subarray(dataStart)
  const n = Math.floor(pcm.length / 2 / ch)
  const amp = (i: number) => Math.abs(pcm.readInt16LE(i * 2 * ch))
  let a = 0
  while (a < n && amp(a) < thresh) a++
  let b = n - 1
  while (b > a && amp(b) < thresh) b--
  a = Math.max(0, a - Math.floor(keepHead * rate))
  b = Math.min(n - 1, b + Math.floor(keepTail * rate))
  const slice = pcm.subarray(a * 2 * ch, (b + 1) * 2 * ch)
  const head = Buffer.from(buf.subarray(0, dataIdx + 8))
  head.writeUInt32LE(slice.length, dataIdx + 4)
  head.writeUInt32LE(36 + slice.length, 4)
  return { wav: Buffer.concat([head, slice]), seconds: slice.length / 2 / ch / rate }
}

/**
 * The TTS model appends two full-scale noise pulses (~160ms of silence, then ~40ms and ~90ms of
 * clipped noise) to the end of every clip. They sit above the trim threshold so trimWav keeps them.
 * Zero them in place (length unchanged, so the timeline stays aligned).
 */
function silenceTailNoise(wav: Buffer) {
  const dataIdx = wav.indexOf(Buffer.from('data'))
  const rate = wav.readUInt32LE(24)
  const ch = wav.readUInt16LE(22)
  const start = dataIdx + 8
  const n = Math.floor((wav.length - start) / 2 / ch)
  const amp = (i: number) => Math.abs(wav.readInt16LE(start + i * 2 * ch)) / 32768
  let onset = -1
  for (let i = Math.max(0, n - Math.floor(rate * 0.4)); i < n; i++) if (amp(i) > 0.9) { onset = i; break }
  if (onset < 0) return wav
  const w = Math.floor(rate * 0.005)
  const windowPeak = (a: number) => { let m = 0; for (let k = Math.max(0, a); k < a + w; k++) m = Math.max(m, amp(k)); return m }
  while (onset > w && windowPeak(onset - w) > 0.02) onset -= w
  while (onset > 0 && amp(onset - 1) > 0.002) onset--
  wav.fill(0, start + onset * 2 * ch)
  return wav
}

const force = process.argv.includes('--force')
const timeline: { id: string; caption: string; file: string; start: number; dur: number; startFrame: number; durFrames: number }[] = []
let cursor = 0

for (const line of LINES) {
  const file = `${OUT}/${line.id}.wav`
  const cache = `${OUT}/.raw-${line.id}.wav`
  let raw: Buffer
  if (!force && existsSync(cache)) {
    raw = await readFile(cache)
  } else {
    const res = await generateSpeech({ model: MODEL, text: line.say, voice: VOICE, instructions: INSTRUCTIONS })
    raw = Buffer.from(res.audio.uint8Array)
    await writeFile(cache, raw)
  }
  const trimmed = trimWav(raw)
  const wav = silenceTailNoise(trimmed.wav)
  const seconds = trimmed.seconds
  await writeFile(file, wav)
  cursor += line.gap
  timeline.push({
    id: line.id,
    caption: line.caption,
    file: `vo/${line.id}.wav`,
    start: +cursor.toFixed(3),
    dur: +seconds.toFixed(3),
    startFrame: Math.round(cursor * FPS),
    durFrames: Math.ceil(seconds * FPS),
  })
  cursor += seconds
  console.log(line.id.padEnd(6), `start ${cursor - seconds < 0 ? 0 : (cursor - seconds).toFixed(2)}s`.padEnd(14), `dur ${seconds.toFixed(2)}s`)
}

await writeFile('src/timeline.json', JSON.stringify({ fps: FPS, total: +cursor.toFixed(3), lines: timeline }, null, 2))
console.log('TOTAL narration end:', cursor.toFixed(2), 's')
