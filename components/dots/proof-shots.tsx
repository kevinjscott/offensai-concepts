'use client'

import { motion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'
import { SectionHeading } from '@/components/brand/reveal'

export function ProofShots() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const yLeft = useTransform(scrollYProgress, [0, 1], [40, -40])
  const yRight = useTransform(scrollYProgress, [0, 1], [-10, 70])

  return (
    <section id="output" ref={ref} className="overflow-hidden px-6 py-24 md:py-32">
      <SectionHeading eyebrow="The output" title="A chain nobody wrote a rule for. Then the receipt.">
        The generative engine builds the path. The report shows what ran, what it reached, and how bad it is.
      </SectionHeading>
      <div className="mx-auto mt-16 grid max-w-6xl gap-6 lg:grid-cols-2">
        <motion.figure style={{ y: yLeft }} className="rounded-3xl border border-border bg-card/40 p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/generative-attack-engine-azure-gitlab-chain.png"
            alt="Generative attack engine building a multi-step Azure attack chain from GitLab into a production tenant"
            className="w-full rounded-2xl"
          />
          <figcaption className="px-4 pb-3 pt-4 text-sm text-muted-foreground">
            Generate: a multi-step chain from a GitLab project into an Azure production tenant.
          </figcaption>
        </motion.figure>
        <motion.figure style={{ y: yRight }} className="rounded-3xl border border-border bg-card/40 p-2 lg:mt-24">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/csir-score-gitlab-oidc-breach-evidence.png"
            alt="CSIR score and MITRE mapping for an exploitable GitLab OIDC wildcard trust breach"
            className="w-full rounded-2xl"
          />
          <figcaption className="px-4 pb-3 pt-4 text-sm text-muted-foreground">
            Prioritize: validated, scored by impact, mapped to MITRE ATT&amp;CK.
          </figcaption>
        </motion.figure>
      </div>
    </section>
  )
}
