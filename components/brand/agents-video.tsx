import { cn } from '@/lib/utils'

/** The three OFFENSAI agents, played from the same transparent WebM the live site uses. */
export function AgentsVideo({ className }: { className?: string }) {
  return (
    <video
      className={cn('pointer-events-none select-none', className)}
      autoPlay
      loop
      muted
      playsInline
      preload="auto"
      poster="/brand/agents-poster.png"
      aria-label="OFFENSAI's three autonomous agents"
    >
      <source src="/brand/offensai-autonomous-cloud-attack-agents.webm" type="video/webm" />
    </video>
  )
}
