import type { Metadata } from 'next'
import { SiteNav } from '@/components/brand/site-nav'
import { ClosingCta, LogoStrip, SiteFooter, TrustRow } from '@/components/brand/shared-sections'
import { TuiApp } from '@/components/tui/tui-app'
import { TuiHero } from '@/components/tui/tui-hero'
import { TuiPriority } from '@/components/tui/tui-priority'

export const metadata: Metadata = {
  title: 'OFFENSAI | Show me the chain',
  description:
    'A console-style tour of OFFENSAI: model your cloud, generate attack chains, validate with approval, and prioritize by proof.',
}

export default function TerminalUiPage() {
  return (
    <main>
      <SiteNav
        links={[
          { href: '#tui', label: 'Console' },
          { href: '#priority', label: 'Prioritize' },
        ]}
      />
      <TuiHero />
      <LogoStrip />
      <TuiApp />
      <TuiPriority />
      <TrustRow />
      <ClosingCta headline="Less export. More evidence." />
      <SiteFooter />
    </main>
  )
}
