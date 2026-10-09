import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const SITE = 'https://www.offensai.com'

export function DemoButton({ className, children = 'Book a demo' }: { className?: string; children?: React.ReactNode }) {
  return (
    <a
      href={SITE}
      target="_blank"
      rel="noreferrer"
      className={cn(
        'group inline-flex items-center gap-3 rounded-xl border border-primary/40 bg-gradient-to-b from-[#0d1730] to-[#050a18] py-2 pl-5 pr-2 text-sm font-semibold text-foreground transition-colors hover:border-primary focus-visible:outline-2',
        className,
      )}
    >
      {children}
      <span className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform group-hover:translate-x-0.5">
        <ArrowRight className="size-4" aria-hidden />
      </span>
    </a>
  )
}

export function SandboxButton({ className }: { className?: string }) {
  return (
    <a
      href={SITE}
      target="_blank"
      rel="noreferrer"
      className={cn(
        'inline-flex items-center rounded-xl px-4 py-3 text-sm font-semibold text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline',
        className,
      )}
    >
      Explore sandbox
    </a>
  )
}
