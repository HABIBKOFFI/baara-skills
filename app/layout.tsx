import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'BAARA — Forge ton métier. Prouve-le.',
  description:
    'Plateforme panafricaine de simulations métiers. Acquiers une expérience professionnelle certifiée avant ton premier recrutement.',
  manifest: '/manifest.json',
  themeColor: '#1A2742',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
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
