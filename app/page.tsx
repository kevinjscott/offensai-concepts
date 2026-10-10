import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { AgentsVideo } from '@/components/brand/agents-video'
import { concepts } from '@/lib/concepts'

export default function Home() {
  return (
    <main className="relative isolate flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-24">
      <div
        className="absolute inset-0 -z-10 bg-cover bg-top opacity-70"
        style={{ backgroundImage: 'url(/brand/hero-bg.png)' }}
        aria-hidden
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-background/60 to-background" aria-hidden />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/logo.svg" alt="OFFENSAI" className="h-7 w-auto" />
      <AgentsVideo className="mt-6 w-full max-w-xs" />
      <h1 className="mt-4 text-balance text-center text-3xl font-semibold md:text-5xl">Six landing page concepts</h1>
      <p className="mt-3 max-w-xl text-pretty text-center text-muted-foreground">
        Same product, six ways to get the why and the how across. All are about chains and paths.
      </p>
      <ul className="mt-10 grid w-full max-w-5xl gap-4 md:grid-cols-3">
        {concepts.map((c) => (
          <li key={c.href}>
            <Link
              href={c.href}
              className="group flex h-full flex-col rounded-2xl border border-border bg-card/70 p-6 transition-colors hover:border-primary/60"
            >
              <span className="font-mono text-xs text-primary">Concept {c.short}</span>
              <span className="mt-3 text-xl font-semibold">{c.label}</span>
              <span className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.blurb}</span>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                Open <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <Link
        href="/explainer"
        className="mt-8 inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-5 py-2.5 text-sm font-semibold transition-colors hover:border-primary/60"
      >
        Watch the 60 second explainer <ArrowRight className="size-4" aria-hidden />
      </Link>
    </main>
  )
}
