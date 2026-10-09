import { Reveal, SectionHeading } from '@/components/brand/reveal'

const points = [
  { title: 'Build', text: 'multi-step chains that reflect your own architecture.' },
  { title: 'Customize', text: 'scenarios around your threat hypotheses and priorities.' },
  { title: 'Extend', text: 'platform coverage as your cloud footprint grows.' },
]

export function AttackStudio() {
  return (
    <section className="px-6 py-24 md:py-32">
      <SectionHeading eyebrow="ATTACKSTUDIO™" title="Compose your own chains, visually.">
        Your cloud is not generic. Draw the validation chains that match your architecture and your worst-case
        stories.
      </SectionHeading>
      <Reveal className="mx-auto mt-14 max-w-5xl">
        <div className="overflow-hidden rounded-3xl border border-primary/25 bg-ink shadow-[0_0_80px_rgb(76_147_255/0.14)]">
          <video
            className="w-full"
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            aria-label="OFFENSAI agents composing validation chains in Attack Studio"
          >
            <source src="/brand/attackstudio-compose-validation-chains.webm" type="video/webm" />
          </video>
        </div>
      </Reveal>
      <ul className="mx-auto mt-8 grid max-w-5xl gap-4 md:grid-cols-3">
        {points.map((p, i) => (
          <li key={p.title}>
            <Reveal delay={i * 0.08} className="h-full rounded-2xl border border-border bg-card/60 p-5">
              <p className="text-lg font-semibold text-primary">{p.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{p.text}</p>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  )
}
