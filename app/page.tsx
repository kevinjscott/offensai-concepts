import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { VideoPair } from '@/components/explainer/video-pair'
import { concepts } from '@/lib/concepts'

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-5 px-4 py-4 md:px-6">
      <header className="flex items-center justify-between">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/logo.svg" alt="OFFENSAI" className="h-5 w-auto" />
        <span className="font-mono text-xs text-muted-foreground">Internal concept exploration</span>
      </header>

      <VideoPair />

      <ul className="grid w-full gap-3 sm:grid-cols-2 md:grid-cols-3">
        {concepts.map((c) => (
          <li key={c.href}>
            <Link
              href={c.href}
              className="group flex h-full items-start justify-between gap-3 rounded-xl border border-border bg-card/70 p-4 transition-colors hover:border-primary/60"
            >
              <span>
                <span className="font-mono text-xs text-primary">{c.short}</span>
                <span className="block text-base font-semibold">{c.label}</span>
                <span className="mt-1 block text-sm leading-snug text-muted-foreground">{c.blurb}</span>
              </span>
              <ArrowRight className="mt-1 size-4 shrink-0 transition-transform group-hover:translate-x-1" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
