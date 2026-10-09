import { Reveal, SectionHeading } from '@/components/brand/reveal'
import { TermLines } from '@/components/term/term-lines'
import { TerminalWindow } from '@/components/term/terminal-window'
import type { TermLine } from '@/lib/terminal'

const model: TermLine[] = [
  { k: 'cmd', t: 'model --read-only' },
  { k: 'ok', t: 'connected: aws, azure, gitlab (native APIs)' },
  { k: 'dim', t: 'no host agents deployed' },
  { k: 'ok', t: 'graph built: identities, roles, trust, secrets, data' },
]

const generate: TermLine[] = [
  { k: 'cmd', t: 'generate --goal "production data"' },
  { k: 'dim', t: 'exploring routes from untrusted identities' },
  { k: 'ok', t: '3 candidate chains found' },
  { k: 'out', t: '1  gitlab-oidc -> azure prod      5 hops' },
  { k: 'out', t: '2  leaked key -> data lake        5 hops' },
]

const validate: TermLine[] = [
  { k: 'cmd', t: 'validate chain-1' },
  { k: 'warn', t: 'approve read-only validation? [y/N] y' },
  { k: 'ok', t: 'hop 1  token minted on untrusted ref' },
  { k: 'ok', t: 'hop 2  wildcard trust accepted' },
  { k: 'ok', t: 'hop 3  contributor role assumed' },
  { k: 'err', t: 'verdict: EXPLOITABLE' },
]

const prioritize: TermLine[] = [
  { k: 'cmd', t: 'prioritize' },
  { k: 'err', t: 'P0  gitlab-oidc -> azure prod     exploitable' },
  { k: 'err', t: 'P0  leaked key -> data lake       exploitable' },
  { k: 'dim', t: 'P3  old vm, 14 cves               not reachable' },
  { k: 'ok', t: 'fix hop 2 once, close both P0 chains' },
]

const stages = [
  { n: 'Model', title: 'model.log', lines: model, blurb: 'Read-only, through native APIs. Your cloud becomes a graph.' },
  { n: 'Generate', title: 'generate.log', lines: generate, blurb: 'Agents propose routes, not a list of issues.' },
  { n: 'Validate', title: 'validate.log', lines: validate, blurb: 'Each hop is proven, with your approval, and logged as evidence.' },
  { n: 'Prioritize', title: 'prioritize.log', lines: prioritize, blurb: 'Order by what an attacker can actually reach.' },
]

export function TuiStages() {
  return (
    <section id="how" className="px-6 py-20 md:py-28">
      <SectionHeading eyebrow="How it works" title="Four commands, one chain of evidence" />
      <div className="mx-auto mt-14 grid max-w-6xl gap-6 md:grid-cols-2">
        {stages.map((s, i) => (
          <Reveal key={s.n} delay={(i % 2) * 0.08}>
            <h3 className="mb-3 flex items-baseline gap-3 text-lg font-semibold">
              <span className="font-mono text-xs text-primary">{String(i + 1).padStart(2, '0')}</span>
              {s.n}
              <span className="text-sm font-normal text-muted-foreground">{s.blurb}</span>
            </h3>
            <TerminalWindow title={s.title} bodyClassName="min-h-44">
              <TermLines lines={s.lines} />
            </TerminalWindow>
          </Reveal>
        ))}
      </div>
      <p className="mt-6 text-center text-xs text-muted-foreground">
        Terminal output is a concept visual of the product&apos;s workflow, not a literal CLI.
      </p>
    </section>
  )
}
