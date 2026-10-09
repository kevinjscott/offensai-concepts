'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export const concepts = [
  { href: '/dots-to-paths', label: 'Dots to Paths', short: '1', blurb: 'Scroll story. Why paths beat findings.' },
  { href: '/chain-studio', label: 'Chain Studio', short: '2', blurb: 'Interactive. How a chain is built and proven.' },
  { href: '/cloud-in-motion', label: 'Cloud in Motion', short: '3', blurb: 'Time. Why a snapshot is always out of date.' },
]

export function ConceptSwitcher() {
  const pathname = usePathname()
  return (
    <nav
      aria-label="Landing page concepts"
      className="fixed inset-x-0 bottom-4 z-50 flex justify-center px-4"
    >
      <ul className="flex items-center gap-1 rounded-full border border-border bg-ink/90 p-1 text-xs backdrop-blur-md">
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
