import { Plus } from 'lucide-react'
import { Reveal, SectionHeading } from '@/components/brand/reveal'

export function EvasionSection() {
  return (
    <section className="px-6 py-24 md:py-32">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
        <Reveal>
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-violet">Beyond alerts. Built for proof.</p>
          <h2 className="text-balance text-3xl font-semibold leading-tight md:text-5xl">
            Would your detections even notice the chain?
          </h2>
          <p className="mt-5 text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
            OFFENSAI stress-tests your detections with evasive attack execution, exposing the coverage gaps alerts never
            show. If a validated path runs quietly, you know where to look next.
          </p>
        </Reveal>
        <Reveal delay={0.1} className="rounded-3xl border border-border bg-card/40 p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/evasion-engine-masked-malicious-api-calls.png"
            alt="Evasion engine masking malicious API calls before they reach protected cloud infrastructure"
            className="w-full rounded-2xl"
          />
        </Reveal>
      </div>
    </section>
  )
}

const faqs = [
  {
    q: 'What is Adversarial Exposure Validation (AEV)?',
    a: 'It is the practice of proving, through controlled attack execution, which exposures an attacker could really exploit, instead of ranking them by how likely they look.',
  },
  {
    q: 'How is this different from CSPM?',
    a: 'CSPM lists misconfigurations and scores them one at a time. OFFENSAI chains them into attack paths and validates whether each path works, with evidence.',
  },
  {
    q: 'Does it disrupt production?',
    a: 'Validations are human-initiated and only run on your approval. Clouds connect through native APIs with read-only access, and there are no host agents to deploy.',
  },
  {
    q: 'Why do teams need attack path analysis?',
    a: 'Because real attacks chain. A harmless-looking finding becomes critical when it links to an identity, a trust rule and a secret. Seeing the chain is how you see the risk.',
  },
  {
    q: 'Where does my cloud data go?',
    a: 'Identities, resources and credentials are anonymized before analysis, so the context an attacker would have never requires exposing your cloud.',
  },
]

export function FaqSection() {
  return (
    <section id="faq" className="px-6 py-24 md:py-32">
      <SectionHeading eyebrow="FAQs" title="Quick answers" />
      <ul className="mx-auto mt-12 flex max-w-3xl flex-col gap-3">
        {faqs.map((f) => (
          <li key={f.q}>
            <details className="group rounded-2xl border border-border bg-card/60 px-5 py-4 open:border-primary/40">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold [&::-webkit-details-marker]:hidden">
                {f.q}
                <Plus className="size-4 shrink-0 text-primary transition-transform group-open:rotate-45" aria-hidden />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
            </details>
          </li>
        ))}
      </ul>
    </section>
  )
}
