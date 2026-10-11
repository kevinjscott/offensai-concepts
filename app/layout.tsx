import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import { ConceptSwitcher } from '@/components/brand/concept-switcher'
import { MotionProvider } from '@/components/brand/motion-provider'
import './globals.css'

const silka = localFont({
  src: [
    { path: '../public/fonts/silka-regular.woff2', weight: '400', style: 'normal' },
    { path: '../public/fonts/silka-medium.woff2', weight: '500', style: 'normal' },
    { path: '../public/fonts/silka-semibold.woff2', weight: '600', style: 'normal' },
    { path: '../public/fonts/silka-bold.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-silka',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'OFFENSAI | Cloud attack paths, proven',
  description:
    'OFFENSAI chains live cloud changes into real attack paths and validates which ones are exploitable. Proof, not alerts.',
  robots: { index: false, follow: false },
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
    <html lang="en" className={`${silka.variable} bg-background`}>
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
