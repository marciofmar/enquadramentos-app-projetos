'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { LogOut, Settings, User, FileText, FolderKanban } from 'lucide-react'
import type { Profile } from '@/lib/types'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data } = await supabase
        .from('profiles')
        .select('*, setores:setor_id(codigo, nome_completo)')
        .eq('id', user.id)
        .single()

      if (data) setProfile(data as any)
      setLoading(false)
    }
    load()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-sedec-500 font-medium">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar - preto com laranja (identidade SEDEC) */}
      <header className="bg-gray-900 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button onClick={() => router.push('/dashboard')} className="flex items-center gap-3 hover:opacity-90">
              <img src="/logo-sedec.png" alt="SEDEC-RJ" className="h-10" />
              <div className="hidden sm:block border-l border-gray-600 pl-3">
                <span className="font-bold text-sm block leading-tight">Planejamento Estratégico</span>
                <span className="text-[11px] text-gray-400">SEDEC-RJ 2024–2035 • ICTDEC</span>
              </div>
            </button>

            {/* Nav links */}
            <nav className="hidden md:flex items-center gap-1 ml-6">
              <button onClick={() => router.push('/dashboard')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors">
                <FileText size={15} /> Enquadramentos
              </button>
              <button onClick={() => router.push('/dashboard/projetos')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors">
                <FolderKanban size={15} /> Projetos
              </button>
            </nav>

            <div className="flex items-center gap-4">
              {profile?.role === 'admin' && (
                <button
                  onClick={() => router.push('/admin')}
                  className="flex items-center gap-1.5 text-gray-400 hover:text-orange-400 text-sm transition-colors"
                >
                  <Settings size={16} />
                  <span className="hidden sm:inline">Admin</span>
                </button>
              )}

              <div className="flex items-center gap-2 text-sm">
                <User size={16} className="text-gray-400" />
                <span className="hidden sm:inline text-gray-300">{profile?.nome}</span>
                <span className="text-xs bg-orange-600 px-2 py-0.5 rounded-full capitalize">{profile?.role}</span>
              </div>

              <button onClick={handleLogout} className="text-gray-400 hover:text-white transition-colors" title="Sair">
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
        {/* Accent line */}
        <div className="h-0.5 bg-gradient-to-r from-orange-500 via-orange-400 to-yellow-500" />
        {/* Mobile nav */}
        <div className="md:hidden flex border-t border-gray-700">
          <button onClick={() => router.push('/dashboard')}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs text-gray-400 hover:text-white hover:bg-white/5">
            <FileText size={13} /> Enquadramentos
          </button>
          <button onClick={() => router.push('/dashboard/projetos')}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs text-gray-400 hover:text-white hover:bg-white/5 border-l border-gray-700">
            <FolderKanban size={13} /> Projetos
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo-sedec.png" alt="SEDEC-RJ" className="h-6 opacity-60" />
            <span className="text-xs text-gray-400">Secretaria de Estado de Defesa Civil — Governo do Estado do Rio de Janeiro</span>
          </div>
          <span className="text-xs text-gray-300">ICTDEC / DAEAD</span>
        </div>
      </footer>
    </div>
  )
}
