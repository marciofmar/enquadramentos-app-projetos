import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Enquadramentos Estratégicos | SEDEC-RJ',
  description: 'Sistema de Enquadramentos Estratégicos Setoriais — SEDEC-RJ / ICTDEC',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen">
        {children}
      </body>
    </html>
  )
}
