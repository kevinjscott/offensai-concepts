import { Reveal } from '@/components/brand/reveal'
import { AgentsVideo } from '@/components/brand/agents-video'

const points = [
  { title: 'Revalidates as things change', text: 'Never defending yesterday’s environment.' },
  { title: 'Reasons across clouds', text: 'One persistent graph and one attack language, not one provider at a time.' },
  { title: 'Waits for your yes', text: 'Validations are human-initiated, read-only, and approval-driven.' },
]

export function AgentsBand() {
  return (
    <section className="relative overflow-hidden px-6 py-24 md:py-32">
      <div
        className="absolute inset-0 -z-10 bg-[radial-gradient(50%_60%_at_30%_50%,rgb(76_147_255/0.22),transparent)]"
        aria-hidden
      />
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
        <Reveal className="mx-auto w-full max-w-lg">
          <AgentsVideo className="w-full scale-110" />
        </Reveal>
        <div>
          <Reveal>
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-primary">Always on</p>
            <h2 className="text-balance text-3xl font-semibold leading-tight md:text-5xl">
              Three agents. One job: keep proving.
            </h2>
          </Reveal>
          <ul className="mt-8 flex flex-col gap-4">
            {points.map((p, i) => (
              <li key={p.title}>
                <Reveal delay={0.1 + i * 0.1} className="rounded-2xl border border-border bg-card/60 p-5">
                  <p className="font-semibold">{p.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{p.text}</p>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <Reveal className="mx-auto mt-16 max-w-4xl rounded-3xl border border-border bg-card/40 p-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/continuous-auto-validate-cloud-exposures.png"
          alt="Continuous discovery dashboard with auto-validate exposures running on reviewed cloud resources"
          className="w-full rounded-2xl"
        />
      </Reveal>
    </section>
  )
}
