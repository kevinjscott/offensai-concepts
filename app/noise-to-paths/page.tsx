import type { Metadata } from 'next'
import { SiteNav } from '@/components/brand/site-nav'
import { ClosingCta, LogoStrip, SiteFooter, TrustRow } from '@/components/brand/shared-sections'
import { DotsHero } from '@/components/dots/dots-hero'
import { NoiseToPath } from '@/components/dots/noise-to-path'
import { ProofShots } from '@/components/dots/proof-shots'
import { WhyFail } from '@/components/dots/why-fail'

export const metadata: Metadata = {
  title: 'OFFENSAI | Detection guesses at risk. OFFENSAI proves it.',
  description:
    'Specialized AI for cloud exploit validation. OFFENSAI chains live cloud changes into real attack paths, then safely executes them to prove exploitability.',
}

export default function DotsToPaths() {
  return (
    <main>
      <SiteNav
        links={[
          { href: '#why', label: 'The problem' },
          { href: '#output', label: 'The proof' },
        ]}
      />
      <DotsHero />
      <LogoStrip />
      <NoiseToPath />
      <WhyFail />
      <ProofShots />
      <TrustRow />
      <ClosingCta />
      <SiteFooter />
    </main>
  )
}
