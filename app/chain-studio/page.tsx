import type { Metadata } from 'next'
import { SiteNav } from '@/components/brand/site-nav'
import { ClosingCta, LogoStrip, SiteFooter } from '@/components/brand/shared-sections'
import { AttackStudio } from '@/components/studio/attack-studio'
import { EvasionSection, FaqSection } from '@/components/studio/evasion-and-faq'
import { RouteVariants } from '@/components/studio/route-variants'
import { StageTabs } from '@/components/studio/stage-tabs'
import { StudioHero } from '@/components/studio/studio-hero'

export const metadata: Metadata = {
  title: 'OFFENSAI | One finding is a dot. A chain is a breach.',
  description:
    'Watch OFFENSAI build, run and prove a multi-step cloud attack chain. Interactive walkthrough of how validation works.',
}

export default function ChainStudio() {
  return (
    <main>
      <SiteNav
        links={[
          { href: '#generate', label: 'Generate' },
          { href: '#how', label: 'How it works' },
          { href: '#faq', label: 'FAQs' },
        ]}
      />
      <StudioHero />
      <LogoStrip />
      <RouteVariants />
      <StageTabs />
      <AttackStudio />
      <EvasionSection />
      <FaqSection />
      <ClosingCta headline="Stop guessing which dots matter." />
      <SiteFooter />
    </main>
  )
}
