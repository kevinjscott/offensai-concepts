import { DemoButton, SandboxButton } from './cta-buttons'
import { Reveal, SectionHeading } from './reveal'

const customers = [
  { src: 'trusted-nordhealth.png', name: 'Nordhealth', h: 'h-6' },
  { src: 'trusted-princeton.png', name: 'Princeton Pharmatech', h: 'h-7' },
  { src: 'trusted-garner.png', name: 'Garner', h: 'h-7' },
  { src: 'trusted-rubrik.png', name: 'Rubrik', h: 'h-7' },
  { src: 'trusted-elite.png', name: 'Elite', h: 'h-6' },
  { src: 'trusted-scrut.png', name: 'Scrut Automation', h: 'h-8' },
  { src: 'trusted-trustlab.png', name: 'Trustlab', h: 'h-6' },
]

export function LogoStrip() {
  return (
    <section aria-label="Customers" className="px-6 py-14">
      <p className="mb-8 text-center text-sm text-muted-foreground">Trusted by</p>
      <ul className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-10 gap-y-6 opacity-80">
        {customers.map((c) => (
          <li key={c.name}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/brand/${c.src}`} alt={c.name} className={`${c.h} w-auto`} />
          </li>
        ))}
      </ul>
    </section>
  )
}

const trust = [
  { icon: 'icon-human-initiated.png', title: 'Human-initiated by design', text: 'Validations only run on your approval.' },
  { icon: 'icon-data-sovereignty.png', title: 'Data sovereignty by design', text: 'Native APIs. Read-only access. No host agents to deploy.' },
  { icon: 'icon-audit-ready.png', title: 'Audit-ready output', text: 'Validated findings structured for review and reporting.' },
  { icon: 'icon-actionable-remediation.png', title: 'Actionable remediation', text: 'Clear evidence and guidance, not just detection output.' },
]

export function TrustRow({ title = 'Proof you can trust, and run safely' }: { title?: string }) {
  return (
    <section className="px-6 py-20 md:py-28">
      <SectionHeading eyebrow="Safe by design" title={title} />
      <ul className="mx-auto mt-14 grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {trust.map((t, i) => (
          <li key={t.title}>
            <Reveal delay={i * 0.08} className="h-full rounded-2xl border border-border bg-card/70 p-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/brand/${t.icon}`} alt="" className="mb-5 size-12" />
              <h3 className="text-base font-semibold text-foreground">{t.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t.text}</p>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function ClosingCta({ headline = 'Shift happens. Be ready when it does.' }: { headline?: string }) {
  return (
    <section className="relative overflow-hidden px-6 pb-32 pt-20 md:pb-40">
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[70%] bg-[radial-gradient(60%_100%_at_50%_100%,rgb(76_147_255/0.35),transparent)]"
        aria-hidden
      />
      <div className="relative mx-auto flex max-w-4xl flex-col items-center text-center">
        <Reveal>
          <h2 className="text-balance text-4xl font-semibold leading-tight tracking-tight md:text-6xl">{headline}</h2>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
            Move from cloud exposure detection to controlled validation, technical evidence, and risk-based
            prioritization, powered by AI.
          </p>
        </Reveal>
        <Reveal delay={0.1} className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <DemoButton />
          <SandboxButton />
        </Reveal>
      </div>
    </section>
  )
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border px-6 py-8 pb-24 text-center text-xs text-muted-foreground">
      Design concept built from public offensai.com content. Scenarios shown are illustrative.
    </footer>
  )
}
