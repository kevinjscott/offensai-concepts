import React from 'react'
import { useCurrentFrame } from 'remotion'
import { Cpu, Database, Fingerprint, GitBranch, KeyRound, UserCog, VenetianMask, type LucideIcon } from 'lucide-react'
import type { Chain, NodeKind } from '../../lib/chains'
import { C, W, H, ramp, easeInOut } from './theme'
import { bezierPath, routeAt, type Pt } from './geom'
import { Pulse, Tile, type TileState } from './ui'

export const KIND_ICON: Record<NodeKind, LucideIcon> = {
  attacker: VenetianMask,
  repo: GitBranch,
  identity: Fingerprint,
  role: UserCog,
  secret: KeyRound,
  compute: Cpu,
  data: Database,
}

/** Map the site's percentage layout onto the 1920x1080 stage. */
export function chainPoints(chain: Chain, offsetY = 0): Pt[] {
  return chain.nodes.map((n) => ({ x: 140 + n.x * 17.4, y: 400 + (n.y - 30) * 7 + offsetY }))
}

interface Props {
  chain: Chain
  /** Frame at which each node (and the connector that leads into it) appears */
  reveal: number[]
  tile?: number
  labels?: boolean
  stateOf?: (index: number, frame: number) => TileState
  connectorColor?: (index: number, frame: number) => string
  /** Connector indices at/after this value are cut (rendered dim + dashed) from `cutFrame` */
  cut?: { index: number; frame: number }
  /** A packet that runs the route repeatedly */
  runner?: { start: number; hopFrames: number; color?: string; loop?: boolean; stopAtHop?: number; gapFrames?: number }
  offsetY?: number
  labelFont?: number
}

export const ChainView: React.FC<Props> = ({
  chain,
  reveal,
  tile = 150,
  labels = true,
  stateOf,
  connectorColor,
  cut,
  runner,
  offsetY = 0,
  labelFont,
}) => {
  const frame = useCurrentFrame()
  const pts = chainPoints(chain, offsetY)
  const hops = pts.length - 1

  let runnerPos: { pos: Pt; opacity: number } | null = null
  if (runner) {
    const cycle = hops * runner.hopFrames + (runner.gapFrames ?? 18)
    let local = frame - runner.start
    if (local >= 0) {
      if (runner.loop) local = local % cycle
      const travelled = local / runner.hopFrames
      const limit = runner.stopAtHop ?? hops
      if (travelled <= limit + 0.0001) {
        runnerPos = { pos: routeAt(pts, travelled), opacity: 1 }
      } else if (travelled <= limit + 0.35) {
        runnerPos = { pos: routeAt(pts, limit), opacity: 1 - (travelled - limit) / 0.35 }
      }
    }
  }

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        {pts.slice(0, -1).map((p, i) => {
          const prog = ramp(frame, reveal[i + 1] - 14, 16, easeInOut)
          if (prog < 0.01) return null
          const isCut = cut && i >= cut.index && frame >= cut.frame
          const col = isCut ? C.dim : connectorColor ? connectorColor(i, frame) : C.blue
          const d = bezierPath(p, pts[i + 1])
          return (
            <g key={i} opacity={isCut ? 0.6 : 1}>
              <path d={d} fill="none" stroke={col} strokeOpacity={0.16} strokeWidth={14} strokeLinecap="round" pathLength={1} strokeDasharray={`${prog} 1`} />
              <path
                d={d}
                fill="none"
                stroke={col}
                strokeWidth={3}
                strokeLinecap="round"
                pathLength={1}
                strokeDasharray={isCut ? '0.012 0.02' : `${prog} 1`}
                strokeOpacity={isCut ? 0.5 : 0.95}
              />
            </g>
          )
        })}
      </svg>

      {/* head of each connector while it draws */}
      {pts.slice(0, -1).map((p, i) => {
        const prog = ramp(frame, reveal[i + 1] - 14, 16, easeInOut)
        if (prog <= 0.02 || prog >= 0.98) return null
        const pos = routeAt([p, pts[i + 1]], prog)
        return <Pulse key={`h${i}`} x={pos.x} y={pos.y} color={connectorColor ? connectorColor(i, frame) : C.blue} size={12} />
      })}

      {chain.nodes.map((n, i) => (
        <Tile
          key={n.id}
          x={pts[i].x}
          y={pts[i].y}
          size={tile}
          Icon={KIND_ICON[n.kind]}
          label={labels ? n.label : undefined}
          sub={labels ? n.sub : undefined}
          labelAbove={n.y < 50}
          labelFont={labelFont}
          state={stateOf ? stateOf(i, frame) : 'normal'}
          appear={ramp(frame, reveal[i], 14)}
        />
      ))}

      {runnerPos && <Pulse x={runnerPos.pos.x} y={runnerPos.pos.y} color={runner?.color ?? C.ember} size={tile * 0.1} opacity={runnerPos.opacity} />}
    </div>
  )
}
