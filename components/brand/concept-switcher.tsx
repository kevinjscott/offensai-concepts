'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { concepts } from '@/lib/concepts'
import { cn } from '@/lib/utils'

export function ConceptSwitcher() {
  const pathname = usePathname()
  if (pathname === '/') return null
  return (
    <nav
      aria-label="Landing page concepts"
      className="pointer-events-none fixed bottom-3 left-3 z-50"
    >
      <ul className="pointer-events-auto flex items-center gap-1 rounded-full border border-border bg-ink/90 p-1 text-xs opacity-40 backdrop-blur-md transition-opacity hover:opacity-100 focus-within:opacity-100">
        <li>
          <Link href="/" className="rounded-full px-3 py-1.5 text-muted-foreground transition-colors hover:text-foreground">
            All
          </Link>
        </li>
        {concepts.map((c) => (
          <li key={c.href}>
            <Link
              href={c.href}
              aria-current={pathname === c.href ? 'page' : undefined}
              className={cn(
                'rounded-full px-3 py-1.5 transition-colors',
                pathname === c.href
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <span className="sm:hidden">{c.short}</span>
              <span className="hidden sm:inline">
                {c.short}. {c.label}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
