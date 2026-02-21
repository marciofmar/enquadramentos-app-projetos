'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter, usePathname } from 'next/navigation'
import { LogOut, Settings, User, FileText, FolderKanban, ChevronRight } from 'lucide-react'
import type { Profile } from '@/lib/types'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  const isProjetosActive = pathname.startsWith('/dashboard/projetos')
  const isEnquadramentosActive = pathname === '/dashboard' || pathname.startsWith('/dashboard/acao')

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
      <div className="min-h-screen bg-surface-1">
        {/* Skeleton header */}
        <div className="bg-gray-900 h-[65px] sticky top-0 z-50">
          <div className="h-0.5 bg-gradient-to-r from-orange-500 via-orange-400 to-yellow-500 absolute bottom-0 left-0 right-0" />
        </div>
        {/* Skeleton content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="skeleton h-8 w-64 mb-2" />
          <div className="skeleton h-4 w-96 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="skeleton-card">
                <div className="skeleton h-5 w-20" />
                <div className="skeleton-text" />
                <div className="skeleton-text-sm" />
                <div className="skeleton h-3 w-1/2 mt-4" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-1 flex flex-col">
      {/* Header */}
      <header className="bg-gray-900 text-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[60px]">
            {/* Brand */}
            <button onClick={() => router.push('/dashboard')} className="flex items-center gap-3 hover:opacity-90 shrink-0">
              <img src="/logo-sedec.png" alt="SEDEC-RJ" className="h-9" />
              <div className="hidden sm:block border-l border-gray-700 pl-3">
                <span className="font-semibold text-[13px] block leading-tight tracking-tight">Planejamento Estratégico</span>
                <span className="text-[10px] text-gray-500">SEDEC-RJ 2024–2035</span>
              </div>
            </button>

            {/* Nav — desktop */}
            <nav className="hidden md:flex items-center gap-1 ml-8">
              <button onClick={() => router.push('/dashboard')}
                className={isEnquadramentosActive ? 'nav-link-active' : 'nav-link-default'}>
                <FileText size={15} /> Enquadramentos
              </button>
              <button onClick={() => router.push('/dashboard/projetos')}
                className={isProjetosActive ? 'nav-link-active' : 'nav-link-default'}>
                <FolderKanban size={15} /> Projetos
              </button>
            </nav>

            {/* User area */}
            <div className="flex items-center gap-3">
              {profile?.role === 'admin' && (
                <button
                  onClick={() => router.push('/admin')}
                  className="flex items-center gap-1.5 text-gray-500 hover:text-orange-400 text-xs transition-colors"
                >
                  <Settings size={14} />
                  <span className="hidden sm:inline">Admin</span>
                </button>
              )}

              <div className="hidden sm:flex items-center gap-2 text-xs border-l border-gray-700 pl-3">
                <div className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center text-[10px] font-bold text-gray-300">
                  {profile?.nome?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="leading-tight">
                  <span className="text-gray-300 block text-[11px]">{profile?.nome?.split(' ')[0]}</span>
                  <span className="text-gray-500 text-[10px] capitalize">{profile?.role}</span>
                </div>
              </div>

              <button onClick={handleLogout} className="text-gray-500 hover:text-gray-300 transition-colors p-1" title="Sair">
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Accent line */}
        <div className="h-[2px] bg-gradient-to-r from-orange-500 via-orange-400 to-yellow-500" />

        {/* Mobile nav */}
        <div className="md:hidden flex">
          <button onClick={() => router.push('/dashboard')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs border-b-2 transition-colors ${
              isEnquadramentosActive
                ? 'text-orange-400 border-orange-400 bg-white/5'
                : 'text-gray-500 border-transparent hover:text-gray-300'
            }`}>
            <FileText size={13} /> Enquadramentos
          </button>
          <button onClick={() => router.push('/dashboard/projetos')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs border-b-2 transition-colors ${
              isProjetosActive
                ? 'text-orange-400 border-orange-400 bg-white/5'
                : 'text-gray-500 border-transparent hover:text-gray-300'
            }`}>
            <FolderKanban size={13} /> Projetos
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 page-enter">
        {children}
      </main>

      {/* Footer — minimal */}
      <footer className="border-t border-gray-200/60 bg-white/60 backdrop-blur-sm mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <span className="text-[10px] text-gray-400">SEDEC-RJ — Secretaria de Estado de Defesa Civil</span>
          <span className="text-[10px] text-gray-300">ICTDEC / DAEAD</span>
        </div>
      </footer>
    </div>
  )
}
