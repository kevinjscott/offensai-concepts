import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter_Tight, TASA_Orbiter } from 'next/font/google'
import { ConceptSwitcher } from '@/components/brand/concept-switcher'
import { MotionProvider } from '@/components/brand/motion-provider'
import './globals.css'

const heading = TASA_Orbiter({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
})
const body = Inter_Tight({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'OFFENSAI | Cloud attack paths, proven',
  description:
    'OFFENSAI chains live cloud changes into real attack paths and validates which ones are exploitable. Proof, not alerts.',
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#000000',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${heading.variable} ${body.variable} bg-background`}>
      <body className="antialiased">
        <MotionProvider>
          {children}
          <ConceptSwitcher />
        </MotionProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
