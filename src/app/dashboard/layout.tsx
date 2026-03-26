'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter, usePathname } from 'next/navigation'
import { LogOut, Settings, User, FileText, FolderKanban, CalendarDays, BarChart3, Bell, AlertCircle, ChevronDown, ChevronUp, X, BookOpen } from 'lucide-react'
import ManualModal from '@/components/ManualModal'
import type { Profile } from '@/lib/types'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [pendingSolicitacoes, setPendingSolicitacoes] = useState(0)
  const [pendingSolicitantes, setPendingSolicitantes] = useState(0)
  const [urgentActivities, setUrgentActivities] = useState(0)
  const [urgentProjectIds, setUrgentProjectIds] = useState<number[]>([])
  const [alertas, setAlertas] = useState<any[]>([])
  const [alertasExpanded, setAlertasExpanded] = useState(false)
  const [manualOpen, setManualOpen] = useState(false)
  const [manualTooltip, setManualTooltip] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
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

      if (data) {
        setProfile(data as any)

        // Fetch urgent activities for this user
        const now = new Date()
        now.setHours(0,0,0,0)
        const in7Days = new Date(now)
        in7Days.setDate(in7Days.getDate() + 7)
        const nowStr = now.toISOString().split('T')[0]
        const limitStr = in7Days.toISOString().split('T')[0]
        
        // Atividades com prazo próximo
        const { data: urgentAtivData, count: urgentAtivCount } = await supabase.from('atividades')
          .select('id, entregas!inner(projeto_id)', { count: 'exact' })
          .eq('responsavel_atividade_id', data.id)
          .neq('status', 'resolvida')
          .neq('status', 'cancelada')
          .gte('data_prevista', nowStr)
          .lte('data_prevista', limitStr)

        // Entregas com prazo próximo (responsável pela entrega — com ou sem atividades)
        const { data: urgentEntregaData, count: urgentEntregaCount } = await supabase.from('entregas')
          .select('id, projeto_id', { count: 'exact' })
          .eq('responsavel_entrega_id', data.id)
          .neq('status', 'resolvida')
          .neq('status', 'cancelada')
          .gte('data_final_prevista', nowStr)
          .lte('data_final_prevista', limitStr)

        const totalUrgent = (urgentAtivCount || 0) + (urgentEntregaCount || 0)
        if (totalUrgent > 0) setUrgentActivities(totalUrgent)

        const pIdsFromAtiv = (urgentAtivData || []).map((a: any) => a.entregas?.projeto_id).filter(Boolean)
        const pIdsFromEntrega = (urgentEntregaData || []).map((e: any) => e.projeto_id).filter(Boolean)
        const allPIds = Array.from(new Set([...pIdsFromAtiv, ...pIdsFromEntrega])) as number[]
        if (allPIds.length > 0) setUrgentProjectIds(allPIds)

        // Fetch alertas não lidos
        const { data: alertasData } = await supabase.from('alertas')
          .select('id, tipo, entidade, entidade_nome, projeto_id, projeto_nome, descricao, created_at')
          .eq('destinatario_id', data.id)
          .eq('lido', false)
          .order('created_at', { ascending: false })
        if (alertasData) setAlertas(alertasData)

        // Guarda: se solicitante, redirecionar para /pendente
        if (data.role === 'solicitante') {
          router.push('/pendente')
          return
        }
        // Guarda: se senha foi zerada, forçar troca de senha
        if (data.senha_zerada && !window.location.pathname.includes('/dashboard/perfil')) {
          router.push('/dashboard/perfil?forcarSenha=true')
        }
      }
      setLoading(false)
    }
    load()
  }, [])

  // Atualizar contagem de solicitações pendentes ao mudar de página ou voltar ao foco
  useEffect(() => {
    if (!profile || (profile.role !== 'admin' && profile.role !== 'master')) return
    async function refreshCount() {
      const [solRes, solicitantesRes] = await Promise.all([
        supabase.from('solicitacoes_alteracao')
          .select('*', { count: 'exact', head: true }).eq('status', 'em_analise'),
        supabase.from('profiles')
          .select('*', { count: 'exact', head: true }).eq('role', 'solicitante'),
      ])
      setPendingSolicitacoes(solRes.count || 0)
      setPendingSolicitantes(solicitantesRes.count || 0)
    }
    refreshCount()
    const onFocus = () => refreshCount()
    const onSolicitacaoUpdate = () => refreshCount()
    window.addEventListener('focus', onFocus)
    window.addEventListener('solicitacao-updated', onSolicitacaoUpdate)
    return () => {
      window.removeEventListener('focus', onFocus)
      window.removeEventListener('solicitacao-updated', onSolicitacaoUpdate)
    }
  }, [profile, pathname])

  // Mostrar tooltip do manual apenas na primeira visita
  useEffect(() => {
    if (!profile) return
    const key = `manual_tooltip_dismissed_${profile.id}`
    if (!localStorage.getItem(key)) {
      const t = setTimeout(() => setManualTooltip(true), 800)
      return () => clearTimeout(t)
    }
  }, [profile])

  function dismissManualTooltip() {
    if (!profile) return
    localStorage.setItem(`manual_tooltip_dismissed_${profile.id}`, '1')
    setManualTooltip(false)
  }

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
                <span className="font-bold text-sm block leading-tight tracking-wide">SIGPLAN</span>
                <span className="text-[11px] text-gray-400">Governança e Planejamento • SEDEC-RJ</span>
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
              <button onClick={() => router.push('/dashboard/calendario')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors">
                <CalendarDays size={15} /> Calendário
              </button>
              <button onClick={() => router.push('/dashboard/painel-gantt')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors">
                <BarChart3 size={15} /> Painel Gantt
              </button>
            </nav>

            <div className="flex items-center gap-4">
              {(profile?.role === 'admin' || profile?.role === 'master') && (
                <div className="flex items-center gap-3">
                  {pendingSolicitantes > 0 && (
                    <button onClick={() => router.push('/admin?tab=usuarios')}
                      className="flex items-center gap-1.5 text-yellow-400 hover:text-yellow-300 text-xs transition-colors">
                      <User size={14} />
                      <span className="hidden sm:inline">{pendingSolicitantes} cadastro(s) pendente(s)</span>
                      <span className="sm:hidden bg-yellow-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">{pendingSolicitantes}</span>
                    </button>
                  )}
                  {pendingSolicitacoes > 0 && (
                    <button onClick={() => router.push('/admin')}
                      className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 text-xs transition-colors animate-pulse">
                      <Bell size={14} />
                      <span className="hidden sm:inline">{pendingSolicitacoes} solicitação(ões)</span>
                      <span className="sm:hidden bg-amber-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">{pendingSolicitacoes}</span>
                    </button>
                  )}
                  <button
                    onClick={() => router.push('/admin')}
                    className="flex items-center gap-1.5 text-gray-400 hover:text-orange-400 text-sm transition-colors"
                  >
                    <Settings size={16} />
                    <span className="hidden sm:inline">{profile?.role === 'master' ? 'Gestão' : 'Admin'}</span>
                  </button>
                </div>
              )}

              <button onClick={() => router.push('/dashboard/perfil')}
                className="flex items-center gap-2 text-sm hover:opacity-80 transition-opacity" title="Meu Perfil">
                <User size={16} className="text-gray-400" />
                <div className="hidden sm:flex flex-col items-end leading-tight">
                  <span className="text-gray-300 text-xs">{profile?.nome}</span>
                  {profile?.role !== 'admin' && (profile as any)?.setores?.codigo && (
                    <span className="text-[10px] text-gray-500">{(profile as any).setores.codigo}</span>
                  )}
                </div>
                <span className="text-xs bg-orange-600 px-2 py-0.5 rounded-full capitalize">{profile?.role}</span>
              </button>

              <div className="relative">
                <button
                  onClick={() => { dismissManualTooltip(); setManualOpen(true) }}
                  className="text-gray-400 hover:text-sedec-400 transition-colors"
                  title="Manual de Utilização"
                >
                  <BookOpen size={18} />
                </button>

                {manualTooltip && (
                  <div className="absolute right-0 top-8 z-[200] w-56 animate-in fade-in slide-in-from-top-1 duration-200">
                    {/* Seta */}
                    <div className="absolute -top-1.5 right-2 w-3 h-3 bg-sedec-600 rotate-45 rounded-sm" />
                    <div className="bg-sedec-600 text-white text-xs rounded-xl shadow-xl px-4 py-3 leading-relaxed">
                      <p className="font-semibold mb-1">📖 Manual disponível</p>
                      <p className="text-sedec-100">Consulte as instruções de uso do sistema aqui sempre que precisar.</p>
                      <button
                        onClick={e => { e.stopPropagation(); dismissManualTooltip() }}
                        className="mt-2 text-sedec-200 hover:text-white underline underline-offset-2 text-[11px]"
                      >
                        Entendi, não mostrar novamente
                      </button>
                    </div>
                  </div>
                )}
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
          <button onClick={() => router.push('/dashboard/calendario')}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs text-gray-400 hover:text-white hover:bg-white/5 border-l border-gray-700">
            <CalendarDays size={13} /> Calendário
          </button>
          <button onClick={() => router.push('/dashboard/painel-gantt')}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs text-gray-400 hover:text-white hover:bg-white/5 border-l border-gray-700">
            <BarChart3 size={13} /> Gantt
          </button>
        </div>
      </header>

      {urgentActivities > 0 && (
        <div onClick={() => router.push(`/dashboard/projetos${urgentProjectIds.length > 0 ? `?alerta=${urgentProjectIds.join(',')}` : ''}`)}
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2.5 flex items-center justify-center gap-2 text-sm shadow-inner cursor-pointer transition-colors z-40 relative">
          <AlertCircle size={18} className="animate-pulse shrink-0" />
          <span className="font-medium text-center">
            Atenção! Você é responsável por {urgentActivities} item(ns) com prazo para os próximos 7 dias.
          </span>
        </div>
      )}

      {alertas.length > 0 && (() => {
        // Group alerts by projeto_id
        const grouped: Record<number, { projeto_nome: string; items: typeof alertas }> = {}
        for (const al of alertas) {
          const pid = al.projeto_id || 0
          if (!grouped[pid]) grouped[pid] = { projeto_nome: al.projeto_nome || 'Sem projeto', items: [] }
          grouped[pid].items.push(al)
        }
        return (
          <div className="bg-orange-500 text-white z-40 relative">
            {/* Header bar - always visible */}
            <div
              className="px-4 py-2.5 flex items-center justify-center gap-2 text-sm cursor-pointer hover:bg-orange-600 transition-colors"
              onClick={() => setAlertasExpanded(!alertasExpanded)}
            >
              <AlertCircle size={18} className="shrink-0" />
              <span className="font-medium">
                {alertas.length} notificação{alertas.length > 1 ? 'ões' : ''} não lida{alertas.length > 1 ? 's' : ''}
              </span>
              {alertasExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              <button
                onClick={async (e) => {
                  e.stopPropagation()
                  await supabase.from('alertas').update({ lido: true }).eq('destinatario_id', profile!.id).eq('lido', false)
                  setAlertas([])
                  setAlertasExpanded(false)
                }}
                className="ml-2 text-white/80 hover:text-white text-xs underline"
                title="Marcar todos como lidos"
              >
                Limpar tudo
              </button>
            </div>
            {/* Expandable section */}
            {alertasExpanded && (
              <div className="bg-orange-600/90 px-4 pb-3 max-h-64 overflow-y-auto">
                {Object.entries(grouped).map(([pid, group]) => (
                  <div key={pid} className="mb-2">
                    <button
                      onClick={() => router.push(`/dashboard/projetos/${pid}`)}
                      className="text-xs font-bold text-orange-100 hover:text-white hover:underline mb-1 block"
                    >
                      {group.projeto_nome}
                    </button>
                    {group.items.map((al) => (
                      <div key={al.id} className="flex items-start gap-2 text-xs text-orange-50 py-0.5 pl-3">
                        <span className="flex-1">{al.descricao}</span>
                        <button
                          onClick={async (e) => {
                            e.stopPropagation()
                            await supabase.from('alertas').update({ lido: true }).eq('id', al.id)
                            setAlertas(prev => prev.filter(a => a.id !== al.id))
                          }}
                          className="text-orange-200 hover:text-white shrink-0 mt-0.5"
                          title="Dispensar"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })()}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo-sedec.png" alt="SEDEC-RJ" className="h-6 opacity-60" />
            <span className="text-xs text-gray-400">SIGPLAN — Secretaria de Estado de Defesa Civil do Rio de Janeiro</span>
          </div>
          <span className="text-xs text-gray-300">Desenvolvido por ICTDEC</span>
        </div>
      </footer>

      <ManualModal open={manualOpen} onClose={() => setManualOpen(false)} />
    </div>
  )
}
