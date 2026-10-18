'use client'

import { useState } from 'react'
import { ArrowDownToLine, ArrowUpRight, Check, Copy } from 'lucide-react'
import { k8sReels } from '@/lib/k8s-reels'

export function K8sLaunchSection() {
  const [selected, setSelected] = useState('technical')
  const [copyStatus, setCopyStatus] = useState('')
  const reel = k8sReels.find((item) => item.id === selected) ?? k8sReels[0]

  async function copyPost() {
    try {
      await navigator.clipboard.writeText(reel.post)
      setCopyStatus('Copied to clipboard')
    } catch {
      setCopyStatus('Copy unavailable. Select the text below to copy it.')
    }
  }

  return (
    <section id="kubernetes-reel" aria-labelledby="launch-title" className="flex flex-col gap-6 py-8 md:py-12">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div className="flex max-w-2xl flex-col gap-4">
          <p className="font-mono text-sm uppercase tracking-widest text-primary">Launch reel / Kubernetes</p>
          <h1 id="launch-title" className="text-balance font-sans text-4xl font-semibold leading-tight tracking-tight md:text-6xl">
            Three hops.<br /><span className="text-muted-foreground">One working path.</span>
          </h1>
          <p className="max-w-xl text-pretty text-base leading-relaxed text-muted-foreground">
            From a restricted service account to <code className="font-mono text-primary">system:masters</code>.
            {' '}See the evidence, not another list of findings.
          </p>
        </div>
        <a href="#reel-notes" className="flex items-center gap-2 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
          What changed in the edit <ArrowUpRight className="size-4" aria-hidden />
        </a>
      </div>

      <fieldset className="flex min-w-0 gap-2">
        <legend className="sr-only">Choose a video version</legend>
        {k8sReels.map((item) => (
          <label key={item.id} className="min-w-0 flex-1 cursor-pointer">
            <input
              type="radio"
              name="launch-reel"
              value={item.id}
              checked={selected === item.id}
              onChange={() => { setSelected(item.id); setCopyStatus('') }}
              className="peer sr-only"
            />
            <span className="flex h-full flex-col justify-between gap-2 rounded-lg border border-border bg-card p-3 text-card-foreground transition-colors peer-checked:border-primary peer-checked:bg-primary/10 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-ring sm:flex-row sm:items-center sm:p-4">
              <span className="flex flex-col gap-1">
                <span className="text-sm font-semibold">{item.label}</span>
                <span className="hidden font-mono text-sm text-muted-foreground sm:block">{item.audience}</span>
              </span>
              <span className="font-mono text-sm text-muted-foreground">{item.duration}</span>
            </span>
          </label>
        ))}
      </fieldset>

      <figure className={reel.portrait ? 'grid min-w-0 items-start gap-6 md:grid-cols-[minmax(0,384px)_1fr]' : 'flex min-w-0 flex-col gap-4'}>
        <div className={reel.portrait ? 'w-full max-w-sm justify-self-center overflow-hidden rounded-xl border border-border bg-background text-foreground' : 'overflow-hidden rounded-xl border border-border bg-background text-foreground'}>
          <video
            key={reel.id}
            src={reel.src}
            poster={reel.poster}
            controls
            playsInline
            preload="none"
            aria-label={`${reel.label}: OFFENSAI Kubernetes demonstration`}
            aria-describedby="reel-description"
            className={reel.portrait ? 'aspect-[9/16] w-full' : 'aspect-video w-full'}
          >
            {reel.captions && <track kind="captions" src={reel.captions} srcLang="en" label="English narration" />}
            Your browser does not support embedded video. <a href={reel.src}>Download the MP4</a>.
          </video>
        </div>
        <figcaption className={reel.portrait ? 'flex flex-col items-start gap-6 md:py-8' : 'flex flex-col gap-4 md:flex-row md:items-start md:justify-between'}>
          {reel.portrait && <p className="font-mono text-sm uppercase tracking-wider text-primary">9:16 / Narrated / Captioned</p>}
          <div className="flex max-w-2xl flex-col gap-2">
            <h2 className="text-pretty text-lg font-semibold">{reel.title}</h2>
            <p id="reel-description" className="text-sm leading-relaxed text-muted-foreground">{reel.description}</p>
          </div>
          <a href={reel.src} download className="flex shrink-0 items-center justify-center gap-2 rounded-lg border border-primary/40 bg-primary/10 px-4 py-3 text-sm font-medium text-primary transition-colors hover:bg-primary/20">
            <ArrowDownToLine className="size-4" aria-hidden /> Download MP4
          </a>
        </figcaption>
      </figure>

      <div id="reel-notes" className="grid gap-6 border-t border-border pt-6 md:grid-cols-2">
        <div className="flex flex-col gap-3">
          <h3 className="font-mono text-sm uppercase tracking-wider text-primary">The edit, not the execution</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Two distinct portrait stories, with new AI-generated voiceover and a quiet pulse beneath it.
            The technical cut shows the result first, then explicitly rewinds. Both use selected close-ups
            from the real recording; waiting intervals are removed. These are edited demonstrations, not real-time runs.
            Large, short captions keep the story understandable with sound off.
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            <strong className="font-medium text-foreground">A precise claim:</strong> no persistent server objects is not the same as no trace.
            Impersonation does not disable audit logging. This is a controlled demonstration, not a claim that every cluster is vulnerable.
          </p>
          <a href="/video/offensai-k8s-impersonate-reel-v5.mov" download className="text-sm text-primary underline underline-offset-4">
            Download untouched v5 source (.mov)
          </a>
        </div>
        <div className="flex flex-col gap-3">
          {reel.id !== 'original' && (
            <details className="rounded-lg border border-border bg-card p-4 text-card-foreground">
              <summary className="cursor-pointer text-sm font-medium">Voiceover transcript / {reel.audience}</summary>
              <ol className="flex flex-col gap-3 pt-4">
                {reel.script.map(({ time, text }) => (
                  <li key={time} className="flex items-baseline gap-3 text-sm leading-relaxed">
                    <span className="shrink-0 font-mono text-primary">{time}</span>
                    <span className="text-muted-foreground">{text}</span>
                  </li>
                ))}
              </ol>
            </details>
          )}
          {reel.post && (
            <details className="rounded-lg border border-border bg-card p-4 text-card-foreground">
              <summary className="cursor-pointer text-sm font-medium">Ready-to-post copy / {reel.audience}</summary>
              <div className="flex flex-col gap-4 pt-4">
                <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{reel.post}</p>
                <button type="button" onClick={copyPost} className="flex items-center gap-2 self-start text-sm text-primary underline-offset-4 hover:underline">
                  {copyStatus === 'Copied to clipboard' ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />} Copy post
                </button>
                <p role="status" className="text-sm text-muted-foreground">{copyStatus}</p>
              </div>
            </details>
          )}
        </div>
      </div>
    </section>
  )
}
