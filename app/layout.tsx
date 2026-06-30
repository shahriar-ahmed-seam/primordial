import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

const title = 'Primordial — Artificial Life Engine'
const description =
  'An interactive Particle Life simulation. Thousands of particles, a force matrix, and emergent structures — cells, membranes and galaxies assembling in real time.'

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    'particle life',
    'artificial life',
    'emergence',
    'generative art',
    'simulation',
    'creative coding',
  ],
  authors: [{ name: 'Shahriar Ahmed' }],
  openGraph: {
    title,
    description,
    type: 'website',
    siteName: 'Primordial',
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
}

export const viewport: Viewport = {
  themeColor: '#04060d',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.className}>
      <body>{children}</body>
    </html>
  )
}
