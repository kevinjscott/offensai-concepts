'use client'

import { useEffect, useRef, useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { motion } from 'motion/react'
import { ChainGraph, ChainRail } from '@/components/brand/chain-graph'
import { SectionHeading } from '@/components/brand/reveal'
import { TermRow } from '@/components/term/term-lines'
import { TerminalWindow } from '@/components/term/terminal-window'
import { externalChain as chain } from '@/lib/chains'
import type { TermLine } from '@/lib/terminal'
import { cn } from '@/lib/utils'

interface Option {
  cmd: string
  out: string
  kind: 'ok' | 'miss' | 'err'
}

interface Move {
  prompt: string
  options: Option[]
}

// Simulated, abbreviated commands in a fictional account. No real resources are touched.
const moves: Move[] = [
  {
    prompt: 'You have a domain name and nothing else. No credentials. First move?',
    options: [
      { cmd: 'ssh admin@example-corp.io', out: 'Permission denied. No credentials, no door.', kind: 'err' },
      { cmd: 'search public code repos for example-corp.io', out: 'A public repo names an AWS account ID and a bucket, corp-assets-prod.', kind: 'ok' },
      { cmd: 'nmap -p- example-corp.io', out: 'Mostly filtered. Noisy, and nothing to pivot on.', kind: 'miss' },
    ],
  },
  {
    prompt: 'You have a bucket name from public signals. Is it exposed?',
    options: [
      { cmd: 'aws iam list-users', out: 'Unable to locate credentials.', kind: 'err' },
      { cmd: 'curl https://corp-assets-prod.s3.amazonaws.com/robots.txt', out: 'Not found. Nothing useful.', kind: 'miss' },
      { cmd: 'aws s3 ls s3://corp-assets-prod --no-sign-request', out: 'Public listing. A backup file, .env.bak, is readable.', kind: 'ok' },
    ],
  },
  {
    prompt: 'The backup file holds a developer key. Does it still work?',
    options: [
      { cmd: 'aws sts get-caller-identity', out: 'dev-contractor. Low privilege, but the key is live.', kind: 'ok' },
      { cmd: 'aws s3 ls s3://prod-data-lake', out: 'AccessDenied. This user cannot read the lake directly.', kind: 'err' },
      { cmd: 'aws iam create-user --user-name x', out: 'AccessDenied: iam:CreateUser is not allowed.', kind: 'err' },
    ],
  },
  {
    prompt: 'You know who you are. Where can this identity go?',
    options: [
      { cmd: 'aws ec2 describe-instances', out: 'Works, but there is no role to pivot to from here. Dead end.', kind: 'miss' },
      { cmd: 'aws sts assume-role --role-arn ci-deploy', out: 'Trust policy allows dev-contractor. Session issued.', kind: 'ok' },
      { cmd: 'aws sts assume-role --role-arn admin', out: 'Not authorized to assume admin.', kind: 'err' },
    ],
  },
  {
    prompt: 'You are ci-deploy. It can deploy compute. Now what?',
    options: [
      { cmd: 'aws lambda create-function --role etl-exec ...', out: 'iam:PassRole is permitted. The function runs as etl-exec.', kind: 'ok' },
      { cmd: 'aws kms list-keys', out: 'Listed. Nothing here you can use.', kind: 'miss' },
      { cmd: 'aws secretsmanager get-secret-value ...', out: 'AccessDenied for ci-deploy.', kind: 'err' },
    ],
  },
  {
    prompt: 'Code now runs as etl-exec. What does that role reach?',
    options: [
      { cmd: 'aws logs tail /etl/prod', out: 'Readable, and boring. No credentials in the logs.', kind: 'miss' },
      { cmd: 'aws iam attach-role-policy ... Admin', out: 'Explicit deny from a service control policy.', kind: 'err' },
      { cmd: 'aws secretsmanager get-secret-value --secret-id db/lake', out: 'Secret value readable by etl-exec.', kind: 'ok' },
    ],
  },
  {
    prompt: 'You hold the lake credentials. Last hop.',
    options: [
      { cmd: 'aws rds describe-db-instances', out: 'Private subnet. Not reachable from here.', kind: 'miss' },
      { cmd: 'aws s3 ls s3://customer-lake', out: 'Bucket listing returned with the recovered credentials.', kind: 'ok' },
      { cmd: 'aws sts get-session-token', out: 'Works. Nothing new.', kind: 'miss' },
    ],
  },
]

const lineKind: Record<Option['kind'], TermLine['k']> = { ok: 'ok', miss: 'warn', err: 'err' }

export function AttackerGame() {
  const [step, setStep] = useState(0)
  const [log, setLog] = useState<TermLine[]>([])
  const [tried, setTried] = useState<string[]>([])
  const [attempts, setAttempts] = useState(0)
  const logRef = useRef<HTMLDivElement>(null)
  const done = step >= moves.length

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight })
  }, [log])

  const choose = (i: number) => {
    if (done) return
    const opt = moves[step].options[i]
    const key = `${step}-${i}`
    if (tried.includes(key)) return
    setAttempts((a) => a + 1)
    setLog((l) => [...l, { k: 'cmd', t: opt.cmd }, { k: lineKind[opt.kind], t: opt.out }])
    if (opt.kind === 'ok') {
      setStep((s) => s + 1)
    } else {
      setTried((t) => [...t, key])
    }
  }

  const reset = () => {
    setStep(0)
    setLog([])
    setTried([])
    setAttempts(0)
  }

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const n = Number(e.key)
      if (n >= 1 && n <= 3) choose(n - 1)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  })

  const wasted = attempts - moves.length

  return (
    <section id="play" className="px-6 py-20 md:py-28">
      <SectionHeading eyebrow="Play" title="Start from the outside. Find the data lake.">
        A made-up company with a public domain and no credentials for you. Seven hops from public signals to
        production data. Pick commands with the buttons or press 1, 2 and 3, and watch the chain build as you go.
      </SectionHeading>

      <div className="mx-auto mt-14 grid max-w-6xl gap-6 lg:grid-cols-[320px_1fr]">
        <div className="order-2 rounded-3xl border border-border bg-card/60 p-4 lg:order-1 lg:p-6">
          <ChainRail chain={chain} step={step} showHops={false} />
        </div>

        <div className="order-1 min-w-0 lg:order-2">
          <TerminalWindow
            title="external recon / attacker view"
            bodyClassName="p-0"
            footer={
              <div className="border-t border-border px-4 py-3 font-mono text-xs md:text-[13px]">
                {done ? (
                  <div className="flex flex-col gap-3">
                    <p className="text-primary">
                      + Impact reached in {attempts} moves. {wasted} of them were dead ends or denials.
                    </p>
                    <p className="text-foreground/80">
                      That was one company, one chain, and {moves.length * 3} options. A real cloud spans millions of
                      relationships, and the route you took is only one of many.
                    </p>
                    <button
                      onClick={reset}
                      className="inline-flex w-fit items-center gap-2 rounded-lg border border-primary/40 px-3 py-1.5 text-foreground hover:border-primary"
                    >
                      <RotateCcw className="size-3.5" aria-hidden /> play again
                    </button>
                  </div>
                ) : (
                  <div>
                    <p className="mb-3 text-violet">? {moves[step].prompt}</p>
                    <ul className="flex flex-col gap-2">
                      {moves[step].options.map((o, i) => {
                        const spent = tried.includes(`${step}-${i}`)
                        return (
                          <li key={o.cmd}>
                            <button
                              onClick={() => choose(i)}
                              disabled={spent}
                              className={cn(
                                'flex w-full items-baseline gap-3 rounded-lg border px-3 py-2 text-left transition-colors',
                                spent
                                  ? 'cursor-not-allowed border-border/50 text-muted-foreground/50 line-through'
                                  : 'border-border bg-secondary/40 text-foreground hover:border-primary',
                              )}
                            >
                              <span className="text-primary">{i + 1}</span>
                              <span className="min-w-0 break-words">$ {o.cmd}</span>
                            </button>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                )}
              </div>
            }
          >
            <div ref={logRef} className="h-56 overflow-y-auto p-4" aria-live="polite">
              {log.length === 0 ? (
                <TermRow line={{ k: 'dim', t: 'recon only. you have a domain name and no credentials. pick your first move below.' }} />
              ) : (
                <div className="flex flex-col gap-1.5">
                  {log.map((l, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}>
                      <TermRow line={l} />
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </TerminalWindow>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Simulation in a fictional account. Commands are abbreviated and nothing real is touched.
          </p>
        </div>
      </div>

      {done && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto mt-10 hidden max-w-6xl rounded-3xl border border-border bg-card/60 p-8 md:block"
        >
          <p className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-primary">The path you walked</p>
          <ChainGraph chain={chain} step={chain.nodes.length - 1} />
        </motion.div>
      )}
    </section>
  )
}
