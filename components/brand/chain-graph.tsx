'use client'

import { motion } from 'motion/react'
import {
  Check,
  Cloud,
  Database,
  Fingerprint,
  GitBranch,
  KeyRound,
  Lock,
  Skull,
  type LucideIcon,
} from 'lucide-react'
import type { Chain, ChainNode, NodeKind } from '@/lib/chains'
import { cn } from '@/lib/utils'

const icons: Record<NodeKind, LucideIcon> = {
  attacker: Skull,
  repo: GitBranch,
  identity: Fingerprint,
  role: Lock,
  secret: KeyRound,
  compute: Cloud,
  data: Database,
}

const W = 1000
const H = 420

function edgePath(a: ChainNode, b: ChainNode) {
  const x1 = a.x * 10
  const y1 = a.y * 4.2
  const x2 = b.x * 10
  const y2 = b.y * 4.2
  const mx = (x1 + x2) / 2
  return `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`
}

export interface ChainViewProps {
  chain: Chain
  /**
   * How far the chain has progressed.
   * -1 hides everything, 0 lights the first node, n lights n hops.
   */
  step: number
  /** Hop indexes that are currently blocked (drawn dashed, never lit). */
  blocked?: number[]
  /** Show not-yet-reached nodes dimly. */
  showIdle?: boolean
  className?: string
}

export function NodeTile({
  node,
  state,
  size = 'lg',
}: {
  node: ChainNode
  state: 'hidden' | 'idle' | 'active' | 'current' | 'impact'
  size?: 'sm' | 'lg'
}) {
  const Icon = icons[node.kind]
  const isAttacker = node.kind === 'attacker'
  const lit = state === 'active' || state === 'current' || state === 'impact'
  return (
    <div
      className={cn(
        'relative flex items-center justify-center rounded-2xl border bg-card transition-all duration-500',
        size === 'lg' ? 'size-14 lg:size-16' : 'size-11',
        !lit && 'border-border text-muted-foreground',
        lit && !isAttacker && state !== 'impact' && 'glow-blue border-primary/70 text-foreground',
        (isAttacker && lit) || state === 'impact' ? 'glow-ember border-ember/70 text-foreground' : '',
      )}
    >
      <Icon className={size === 'lg' ? 'size-6' : 'size-5'} aria-hidden />
      {state === 'current' && (
        <span
          className={cn(
            'absolute inset-0 animate-ping rounded-2xl border',
            isAttacker ? 'border-ember/60' : 'border-primary/60',
          )}
          aria-hidden
        />
      )}
      {lit && !isAttacker && state !== 'current' && (
        <span
          className={cn(
            'absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full text-primary-foreground',
            state === 'impact' ? 'bg-ember' : 'bg-primary',
          )}
        >
          <Check className="size-3" strokeWidth={3} aria-hidden />
        </span>
      )}
    </div>
  )
}

/** Desktop graph. Pair it with ChainRail for small screens. */
export function ChainGraph({ chain, step, blocked = [], showIdle = true, className }: ChainViewProps) {
  const last = chain.nodes.length - 1
  return (
    <div className={cn('relative aspect-[1000/420] w-full', className)}>
      <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 size-full" fill="none" aria-hidden>
        <defs>
          <linearGradient id={`grad-${chain.id}`} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#4c93ff" stopOpacity="0.4" />
            <stop offset="1" stopColor="#8fb8ff" />
          </linearGradient>
        </defs>
        {chain.hops.map((_, i) => {
          const d = edgePath(chain.nodes[i], chain.nodes[i + 1])
          const isBlocked = blocked.includes(i)
          const drawn = step > i && !isBlocked
          return (
            <g key={i}>
              <path
                d={d}
                stroke="rgb(148 163 184 / 0.14)"
                strokeWidth={2}
                strokeDasharray={isBlocked ? '3 7' : undefined}
                style={{ opacity: step < 0 ? 0 : showIdle || step > i ? 1 : 0 }}
              />
              <motion.path
                d={d}
                stroke={`url(#grad-${chain.id})`}
                strokeWidth={2.5}
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: drawn ? 1 : 0 }}
                transition={{ duration: 0.7, ease: 'easeInOut' }}
              />
              {drawn && <path d={d} stroke="#fff" strokeOpacity={0.55} strokeWidth={1.5} className="flow-dash" />}
              {isBlocked && step > i - 1 && (
                <g transform={`translate(${(chain.nodes[i].x * 10 + chain.nodes[i + 1].x * 10) / 2} ${(chain.nodes[i].y * 4.2 + chain.nodes[i + 1].y * 4.2) / 2})`}>
                  <circle r={11} fill="#04060d" stroke="#ff5b4a" strokeOpacity={0.7} />
                  <path d="M -4 -4 L 4 4 M 4 -4 L -4 4" stroke="#ff5b4a" strokeWidth={2} strokeLinecap="round" />
                </g>
              )}
            </g>
          )
        })}
      </svg>

      {chain.nodes.map((node, i) => {
        const hidden = step < 0 || (!showIdle && i > step)
        const state = hidden
          ? 'hidden'
          : i > step
            ? 'idle'
            : i === last && step >= last
              ? 'impact'
              : i === step
                ? 'current'
                : 'active'
        return (
          <motion.div
            key={node.id}
            className="absolute flex w-28 -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2 text-center lg:w-32"
            style={{ left: `${node.x}%`, top: `${node.y}%` }}
            initial={false}
            animate={{ opacity: state === 'hidden' ? 0 : state === 'idle' ? 0.4 : 1, scale: state === 'idle' ? 0.92 : 1 }}
            transition={{ duration: 0.45 }}
          >
            <NodeTile node={node} state={state} />
            <div>
              <p className="text-xs font-semibold leading-tight text-foreground lg:text-sm">{node.label}</p>
              <p className="mt-0.5 text-[11px] leading-tight text-muted-foreground lg:text-xs">{node.sub}</p>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

/** Vertical chain for narrow screens. Also reads well as a log beside the graph. */
export function ChainRail({ chain, step, blocked = [], showHops = true, className }: ChainViewProps & { showHops?: boolean }) {
  const last = chain.nodes.length - 1
  const fill = step <= 0 ? 0 : Math.min(step, last) / last
  return (
    <ol className={cn('relative flex flex-col', className)}>
      <span className="absolute bottom-5 left-[21px] top-5 w-px bg-border" aria-hidden />
      <motion.span
        className="absolute left-[21px] top-5 w-px origin-top bg-gradient-to-b from-primary to-[#8fb8ff]"
        style={{ bottom: '1.25rem' }}
        initial={false}
        animate={{ scaleY: fill }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
        aria-hidden
      />
      {chain.nodes.map((node, i) => {
        const hidden = step < 0
        const state = hidden
          ? 'idle'
          : i > step
            ? 'idle'
            : i === last && step >= last
              ? 'impact'
              : i === step
                ? 'current'
                : 'active'
        const hop = i > 0 ? chain.hops[i - 1] : null
        const isBlocked = blocked.includes(i - 1)
        return (
          <motion.li
            key={node.id}
            className="relative flex gap-4 py-2.5"
            initial={false}
            animate={{ opacity: hidden ? 0.25 : i > step ? 0.45 : 1 }}
            transition={{ duration: 0.4 }}
          >
            <NodeTile node={node} state={state} size="sm" />
            <div className="min-w-0 pt-0.5">
              <p className="text-sm font-semibold leading-tight text-foreground">
                {node.label} <span className="font-normal text-muted-foreground">· {node.sub}</span>
              </p>
              {showHops && hop && i <= step && (
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {isBlocked ? 'Blocked by current policy.' : hop.title}
                </p>
              )}
            </div>
          </motion.li>
        )
      })}
    </ol>
  )
}
