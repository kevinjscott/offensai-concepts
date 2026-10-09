import { Reveal, SectionHeading } from '@/components/brand/reveal'

const rows = [
  { what: 'What you learn', alert: 'Something might be wrong.', proof: 'This path works. Here is the evidence.' },
  { what: 'What you do next', alert: 'Triage a long list.', proof: 'Fix the short list that is real.' },
  { what: 'About your detections', alert: 'Hope they catch it.', proof: 'Test that they do.' },
]

export function AlertsVsProof() {
  return (
    <section className="px-6 py-24 md:py-32">
      <SectionHeading eyebrow="Beyond alerts" title="An alert says maybe. A validation says it ran." />

      <div className="mx-auto mt-14 max-w-5xl overflow-hidden rounded-3xl border border-border">
        <div className="hidden grid-cols-[180px_1fr_1fr] border-b border-border bg-secondary/60 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground md:grid">
          <span />
          <span>Detection alert</span>
          <span className="text-primary">OFFENSAI validation</span>
        </div>
        {rows.map((r, i) => (
          <Reveal
            key={r.what}
            delay={i * 0.1}
            className="grid gap-2 border-b border-border px-6 py-5 last:border-b-0 md:grid-cols-[180px_1fr_1fr] md:items-center md:gap-4"
          >
            <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{r.what}</p>
            <p className="text-base text-muted-foreground line-through decoration-muted-foreground/40">{r.alert}</p>
            <p className="text-base font-semibold text-foreground">{r.proof}</p>
          </Reveal>
        ))}
      </div>

      <Reveal className="mx-auto mt-10 max-w-5xl rounded-3xl border border-border bg-card/40 p-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/csir-score-gitlab-oidc-breach-evidence.png"
          alt="CSIR score and MITRE mapping for an exploitable GitLab OIDC wildcard trust breach"
          className="w-full rounded-2xl"
        />
      </Reveal>
    </section>
  )
}
