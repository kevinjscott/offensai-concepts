'use client'

import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

export function Reveal({
  children,
  className,
  delay = 0,
  y = 24,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
  y?: number
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

export function SectionHeading({
  eyebrow,
  title,
  children,
  align = 'center',
  className,
}: {
  eyebrow?: string
  title: React.ReactNode
  children?: React.ReactNode
  align?: 'center' | 'left'
  className?: string
}) {
  return (
    <Reveal className={cn('max-w-3xl', align === 'center' && 'mx-auto text-center', className)}>
      {eyebrow && (
        <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-primary">{eyebrow}</p>
      )}
      <h2 className="text-balance text-3xl font-semibold leading-tight tracking-tight text-foreground md:text-5xl">
        {title}
      </h2>
      {children && <p className="mt-5 text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">{children}</p>}
    </Reveal>
  )
}
