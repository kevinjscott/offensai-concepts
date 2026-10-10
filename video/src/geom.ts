export interface Pt {
  x: number
  y: number
}

/** Cubic with horizontal tangents between two points. */
export function bezier(a: Pt, b: Pt) {
  const mx = (a.x + b.x) / 2
  return { p0: a, p1: { x: mx, y: a.y }, p2: { x: mx, y: b.y }, p3: b }
}

export function bezierPath(a: Pt, b: Pt) {
  const { p1, p2 } = bezier(a, b)
  return `M ${a.x} ${a.y} C ${p1.x} ${p1.y} ${p2.x} ${p2.y} ${b.x} ${b.y}`
}

export function bezierAt(a: Pt, b: Pt, t: number): Pt {
  const { p0, p1, p2, p3 } = bezier(a, b)
  const u = 1 - t
  const x = u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x
  const y = u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y
  return { x, y }
}

/** Position along a multi-hop route, `t` in [0, hops]. */
export function routeAt(points: Pt[], t: number): Pt {
  const hops = points.length - 1
  const clamped = Math.max(0, Math.min(hops, t))
  const i = Math.min(hops - 1, Math.floor(clamped))
  return bezierAt(points[i], points[i + 1], clamped - i)
}
