import type { Metadata } from 'next'
import { SiteNav } from '@/components/brand/site-nav'
import { ClosingCta, LogoStrip, SiteFooter } from '@/components/brand/shared-sections'
import { AgentNetwork } from '@/components/studio/agent-network'
import { EvasionSection, FaqSection } from '@/components/studio/evasion-and-faq'
import { RouteVariants } from '@/components/studio/route-variants'
import { StageTabs } from '@/components/studio/stage-tabs'
import { StudioHero } from '@/components/studio/studio-hero'

export const metadata: Metadata = {
  title: 'OFFENSAI | Findings are noise. Chains are breaches.',
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
          { href: '#agent-network', label: 'Agent network' },
          { href: '#faq', label: 'FAQs' },
        ]}
      />
      <StudioHero />
      <LogoStrip />
      <RouteVariants />
      <StageTabs />
      <AgentNetwork />
      <EvasionSection />
      <FaqSection />
      <ClosingCta headline="Stop guessing which risks matter." />
      <SiteFooter />
    </main>
  )
}
