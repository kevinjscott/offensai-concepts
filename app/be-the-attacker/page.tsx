import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { SiteNav } from '@/components/brand/site-nav'
import { Reveal } from '@/components/brand/reveal'
import { ClosingCta, SiteFooter, TrustRow } from '@/components/brand/shared-sections'
import { AttackerGame } from '@/components/attacker/attacker-game'
import { AttackerHero } from '@/components/attacker/attacker-hero'
import { PathExplosion } from '@/components/attacker/path-explosion'

export const metadata: Metadata = {
  title: 'OFFENSAI | Can you reach the data?',
  description:
    'Walk an attack chain yourself in a simulated cloud account, then see why the number of possible routes explodes.',
}

export default function BeTheAttackerPage() {
  return (
    <main>
      <SiteNav
        links={[
          { href: '#play', label: 'Play' },
          { href: '#explosion', label: 'Why it is hard' },
        ]}
      />
      <AttackerHero />
      <AttackerGame />
      <PathExplosion />
      <section className="px-6 pb-8">
        <Reveal className="mx-auto max-w-3xl">
          <Link
            href="/incident-replay"
            className="group flex items-center justify-between gap-6 rounded-2xl border border-border bg-card/60 p-6 transition-colors hover:border-primary/60"
          >
            <span>
              <span className="font-mono text-xs text-primary">This is not hypothetical</span>
              <span className="mt-2 block text-lg font-semibold">Replay a real 2026 agent intrusion, hop by hop</span>
            </span>
            <ArrowRight className="size-5 shrink-0 transition-transform group-hover:translate-x-1" aria-hidden />
          </Link>
        </Reveal>
      </section>
      <TrustRow title="Simulated here. Safe in your cloud too." />
      <ClosingCta headline="Let the agents walk the maze." />
      <SiteFooter />
    </main>
  )
}
