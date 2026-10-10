import { cn } from '@/lib/utils'

export function TerminalWindow({
  title,
  children,
  className,
  bodyClassName,
  footer,
}: {
  title: string
  children: React.ReactNode
  className?: string
  bodyClassName?: string
  footer?: React.ReactNode
}) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl border border-primary/25 bg-ink/90 shadow-[0_0_60px_rgb(76_147_255/0.12)]',
        className,
      )}
    >
      <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
        <span className="flex gap-1.5" aria-hidden>
          <span className="size-3 rounded-full bg-[#ff5f57]" />
          <span className="size-3 rounded-full bg-[#febc2e]" />
          <span className="size-3 rounded-full bg-[#28c840]" />
        </span>
        <span className="ml-2 truncate font-mono text-xs text-muted-foreground">{title}</span>
      </div>
      <div className={cn('p-4 font-mono text-xs leading-relaxed md:text-[13px]', bodyClassName)}>{children}</div>
      {footer}
    </div>
  )
}
