import { DemoButton } from './cta-buttons'

export function SiteNav({ links }: { links: { href: string; label: string }[] }) {
  return (
    <header className="absolute inset-x-0 top-0 z-30 px-4 pt-4 md:px-6 md:pt-6">
      <nav
        aria-label="Primary"
        className="mx-auto flex max-w-6xl items-center justify-between rounded-2xl border border-primary/25 bg-ink/80 px-4 py-2.5 backdrop-blur-md"
      >
        <a href="/" aria-label="OFFENSAI concepts home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo.svg" alt="OFFENSAI" className="h-6 w-auto md:h-7" />
        </a>
        <ul className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="text-sm text-foreground/80 transition-colors hover:text-primary">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <DemoButton className="py-1.5 pl-4 pr-1.5" />
      </nav>
    </header>
  )
}
