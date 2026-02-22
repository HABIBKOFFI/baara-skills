import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'BAARA — Forge ton métier. Prouve-le.',
  description:
    'Plateforme panafricaine de simulations métiers. Acquiers une expérience professionnelle certifiée avant ton premier recrutement.',
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  themeColor: '#1A2742',
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
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
