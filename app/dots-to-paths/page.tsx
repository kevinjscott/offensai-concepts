import type { Metadata } from 'next'
import { SiteNav } from '@/components/brand/site-nav'
import { ClosingCta, LogoStrip, SiteFooter, TrustRow } from '@/components/brand/shared-sections'
import { DotsHero } from '@/components/dots/dots-hero'
import { HowSteps } from '@/components/dots/how-steps'
import { NoiseToPath } from '@/components/dots/noise-to-path'
import { ProofShots } from '@/components/dots/proof-shots'
import { WhyFail } from '@/components/dots/why-fail'

export const metadata: Metadata = {
  title: 'OFFENSAI | Findings are dots. Attackers draw the line.',
  description:
    'OFFENSAI chains live cloud changes into real attack paths and proves which ones are exploitable.',
}

export default function DotsToPaths() {
  return (
    <main>
      <SiteNav
        links={[
          { href: '#why', label: 'The problem' },
          { href: '#how', label: 'How it works' },
        ]}
      />
      <DotsHero />
      <LogoStrip />
      <NoiseToPath />
      <WhyFail />
      <HowSteps />
      <ProofShots />
      <TrustRow />
      <ClosingCta />
      <SiteFooter />
    </main>
  )
}
