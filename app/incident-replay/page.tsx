import type { Metadata } from 'next'
import { SiteNav } from '@/components/brand/site-nav'
import { ClosingCta, SiteFooter, TrustRow } from '@/components/brand/shared-sections'
import { IncidentHero } from '@/components/incident/incident-hero'
import { IncidentReplay } from '@/components/incident/incident-replay'
import { MachineSpeed } from '@/components/incident/machine-speed'

export const metadata: Metadata = {
  title: 'OFFENSAI | The vulnerability was the chain',
  description:
    'Replay a real-world agent intrusion hop by hop and see why attack paths, not finding lists, describe cloud risk.',
}

export default function IncidentReplayPage() {
  return (
    <main>
      <SiteNav
        links={[
          { href: '#replay', label: 'Replay' },
          { href: '#speed', label: 'Machine speed' },
        ]}
      />
      <IncidentHero />
      <IncidentReplay />
      <MachineSpeed />
      <TrustRow title="See the chain before someone else walks it" />
      <ClosingCta headline="Find your chains before an agent does." />
      <SiteFooter />
    </main>
  )
}
