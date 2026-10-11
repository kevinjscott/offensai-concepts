import { generateSpeech } from 'ai'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'

const MODEL = 'google/gemini-3.8-flash-tts'
const VOICE = 'Charon'
const INSTRUCTIONS =
  'Documentary narrator for a premium cybersecurity product film. Low, calm, confident, quietly intense, no hype, no smile. Speak at a fast, energetic trailer-narration pace, about 1.3 times normal speed, with almost no pauses and crisp consonants. Finish each line with a clean, decisive downward landing.'

interface Line {
  id: string
  say: string
  caption: string
  gap: number
}

const LINES: Line[] = [
  { id: 'b1', say: 'July twenty twenty-six. An autonomous AI agent breaches Hugging Face.', caption: 'July 2026. An autonomous AI agent breaches Hugging Face.', gap: 0.6 },
  { id: 'b2', say: 'Not with one critical bug. With a chain.', caption: 'Not with one critical bug. With a chain.', gap: 0.4 },
  { id: 'b3', say: 'A zero-day in a package registry cache proxy. Out of its sandbox.', caption: 'A zero-day in a package cache proxy. Out of the sandbox.', gap: 0.6 },
  { id: 'b4', say: 'A third-party sandbox, used as a launchpad.', caption: 'A third-party sandbox, used as a launchpad.', gap: 0.25 },
  { id: 'b5', say: 'Two flaws in a dataset pipeline. A file read, and a template injection.', caption: 'Two flaws in a dataset pipeline. A file read, and a template injection.', gap: 0.3 },
  { id: 'b6', say: 'Code execution inside a production pod.', caption: 'Code execution inside a production pod.', gap: 0.25 },
  { id: 'b7', say: 'Cloud credentials. A secret store. A mesh VPN key.', caption: 'Cloud credentials. A secret store. A mesh VPN key.', gap: 0.3 },
  { id: 'b8', say: 'A hundred and eighty-one nodes, enrolled into the corporate network.', caption: '181 nodes enrolled into the corporate network.', gap: 0.3 },
  { id: 'b9', say: 'Each hop looks small on its own. Together, they are a breach.', caption: 'Each hop looks small on its own. Together, a breach.', gap: 0.5 },
  { id: 'b10', say: 'Would you know if your cloud has a chain like this?', caption: 'Would you know if your cloud has a chain like this?', gap: 0.7 },
  { id: 'b11', say: 'Offens A.I. agents map your cloud as a graph.', caption: 'OFFENSAI agents map your cloud as a graph.', gap: 0.7 },
  { id: 'b12', say: 'Compose attack chains across clouds, pipelines, and clusters.', caption: 'Compose attack chains across clouds, pipelines, and clusters.', gap: 0.25 },
  { id: 'b13', say: 'Then prove each hop is exploitable. Safely, on your command.', caption: 'Then prove each hop is exploitable. Safely, on your command.', gap: 0.25 },
  { id: 'b14', say: 'You see the chain before an attacker does.', caption: 'You see the chain before an attacker does.', gap: 0.5 },
  { id: 'b15', say: 'Fix the one hop that breaks it.', caption: 'Fix the one hop that breaks it.', gap: 0.3 },
  { id: 'b16', say: 'Offens A.I. See your cloud the way attackers do.', caption: 'OFFENSAI. See your cloud the way attackers do.', gap: 0.6 },
]

const OUT = 'public/vo-breach'
const FPS = 30
await mkdir(OUT, { recursive: true })

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

/** The TTS model appends full-scale noise pulses to each clip; zero them without changing length. */
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
const timeline: { id: string; caption: string; file: string; start: number; dur: number }[] = []
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
  await writeFile(file, silenceTailNoise(trimmed.wav))
  cursor += line.gap
  timeline.push({ id: line.id, caption: line.caption, file: `vo-breach/${line.id}.wav`, start: +cursor.toFixed(3), dur: +trimmed.seconds.toFixed(3) })
  console.log(line.id.padEnd(5), `start ${cursor.toFixed(2)}s`.padEnd(14), `dur ${trimmed.seconds.toFixed(2)}s`)
  cursor += trimmed.seconds
}

await writeFile('src/timeline-breach.json', JSON.stringify({ fps: FPS, total: +cursor.toFixed(3), lines: timeline }, null, 2))
console.log('TOTAL narration end:', cursor.toFixed(2), 's')
