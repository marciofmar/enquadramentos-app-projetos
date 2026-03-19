import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SIGPLAN | SEDEC-RJ',
  description: 'Sistema de Governança e Planejamento — Secretaria de Estado de Defesa Civil do Rio de Janeiro',
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
