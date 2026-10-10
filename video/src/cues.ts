import timeline from './timeline.json' with { type: 'json' }

export type LineId = (typeof timeline.lines)[number]['id']

const byId = new Map(timeline.lines.map((l) => [l.id, l]))

export const lines = timeline.lines

/** Start (seconds) of a narration line, plus optional offset. */
export function at(id: LineId, offset = 0) {
  const l = byId.get(id)
  if (!l) throw new Error(`Unknown line ${id}`)
  return l.start + offset
}

export function endOf(id: LineId, offset = 0) {
  const l = byId.get(id)
  if (!l) throw new Error(`Unknown line ${id}`)
  return l.start + l.dur + offset
}

/** Sound-effect cues shared by the visuals and the audio synthesizer. */
export function sfxCues() {
  const cues: { t: number; kind: string; gain?: number }[] = []
  const add = (t: number, kind: string, gain = 1) => cues.push({ t, kind, gain })

  add(at('hook1', 0.0), 'tick', 0.5)
  add(at('hook2', 0.55), 'strike', 0.7)
  add(at('hook2', 0.9), 'tick', 0.8)
  // findings flood
  add(at('p1', 0.05), 'flood', 0.8)
  // chain building
  add(at('p4', 0.05), 'whoosh', 0.7)
  for (const id of ['c1', 'c2', 'c3', 'c4', 'c5'] as const) add(at(id, 0), 'node', 0.9)
  add(at('c5', 0.25), 'breach', 1)
  // machines
  add(at('m1', 0), 'whoosh', 0.9)
  // agents
  add(at('s1', -0.15), 'riser-hit', 1)
  add(at('s2', 0), 'tick', 0.7)
  for (let i = 0; i < 6; i++) add(at('s2', 0.15 + i * 0.28), 'node', 0.45)
  add(at('s3', 0.1), 'whoosh', 0.6)
  for (let i = 0; i < 5; i++) add(at('s3', 0.2 + i * 0.5), 'node', 0.6)
  add(at('s4', 0.55), 'click', 1)
  for (let i = 0; i < 5; i++) add(at('s4', 1.0 + i * 0.5), 'check', 0.7)
  add(at('r1', 0), 'whoosh', 0.6)
  add(at('r1', 0.45), 'tick', 0.6)
  add(at('r1', 0.75), 'tick', 0.6)
  add(at('r2', 0.15), 'strike', 0.7)
  add(at('o1', 0.9), 'snap', 1)
  add(at('o1', 1.35), 'fix', 1)
  add(at('o2', 0.1), 'whoosh', 0.5)
  for (let i = 0; i < 3; i++) add(at('o2', 0.35 + i * 0.5), 'check', 0.7)
  add(at('end', -0.1), 'final-hit', 1)
  return cues.sort((a, b) => a.t - b.t)
}
