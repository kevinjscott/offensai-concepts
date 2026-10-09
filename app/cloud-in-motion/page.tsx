import type { Metadata } from 'next'
import { SiteNav } from '@/components/brand/site-nav'
import { ClosingCta, LogoStrip, SiteFooter, TrustRow } from '@/components/brand/shared-sections'
import { AgentsBand } from '@/components/cloud/agents-band'
import { AlertsVsProof } from '@/components/cloud/alerts-vs-proof'
import { CloudHero } from '@/components/cloud/cloud-hero'
import { ShipAChange } from '@/components/cloud/ship-a-change'

export const metadata: Metadata = {
  title: 'OFFENSAI | You are defending a cloud that no longer exists',
  description:
    'Cloud changes open new attack paths daily. OFFENSAI continuously chains and validates them so proof never goes stale.',
}

export default function CloudInMotion() {
  return (
    <main>
      <SiteNav
        links={[
          { href: '#change', label: 'Try a change' },
          { href: '#always-on', label: 'Always on' },
        ]}
      />
      <CloudHero />
      <LogoStrip />
      <ShipAChange />
      <AlertsVsProof />
      <div id="always-on">
        <AgentsBand />
      </div>
      <TrustRow title="Always on does not mean out of control" />
      <ClosingCta headline="Your cloud changed today. Your proof should too." />
      <SiteFooter />
    </main>
  )
}
