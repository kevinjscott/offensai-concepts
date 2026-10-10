import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Download } from 'lucide-react'

export const metadata: Metadata = {
  title: 'OFFENSAI explainer video',
  description: 'A 60 second explainer: why cloud breaches are chains, and how OFFENSAI finds and proves them.',
}

const VIDEO = '/video/offensai-explainer.mp4'

export default function ExplainerPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-6 py-12">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden /> All concepts
      </Link>

      <h1 className="mt-8 text-balance text-3xl font-semibold md:text-5xl">The 60 second explainer</h1>
      <p className="mt-3 max-w-2xl text-pretty text-muted-foreground">
        Why breaches are chains, not findings, and how OFFENSAI&apos;s agents find, validate and prioritize them. Narration, music and sound design are
        generated and synchronized to the visuals.
      </p>

      <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card">
        <video className="aspect-video w-full" src={VIDEO} poster="/video/poster.jpg" controls playsInline preload="metadata" />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <a
          href={VIDEO}
          download
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Download className="size-4" aria-hidden /> Download MP4
        </a>
        <span className="text-sm text-muted-foreground">1920 x 1080, 30 fps, scenarios are illustrative.</span>
      </div>
    </main>
  )
}
