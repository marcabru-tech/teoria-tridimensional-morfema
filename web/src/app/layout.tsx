import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'TTM Explorer — Teoria Tridimensional do Morfema',
  description: 'Analyze morphemes in 3D space: Width (X), Depth (Y), Height (Z)',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#0a0a1a] text-slate-100 antialiased">
        {children}
      </body>
    </html>
  )
}