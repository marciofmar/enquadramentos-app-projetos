'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Plus, Filter, X, Search, FolderKanban, Clock, AlertTriangle, CheckCircle, ChevronRight, Building2 } from 'lucide-react'
import type { Profile } from '@/lib/types'

interface ProjetoCard {
  id: number
  nome: string
  descricao: string
  setor_lider_id: number
  setor_lider_codigo: string
  setor_lider_nome: string
  acoes: { numero: string; nome: string; oe_codigo: string }[]
  setores_participantes: string[]
  proxima_entrega: string | null
  pontualidade: 'em_dia' | 'proximo' | 'atrasado'
}

const PONT_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; icon: any }> = {
  em_dia: { label: 'Em dia', color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200', icon: CheckCircle },
  proximo: { label: 'Próximo do prazo', color: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-300', icon: Clock },
  atrasado: { label: 'Atrasado', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-300', icon: AlertTriangle },
}

export default function ProjetosPage() {
  const [projetos, setProjetos] = useState<ProjetoCard[]>([])
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [configs, setConfigs] = useState<Record<string, string>>({})

  // Filters
  const [searchText, setSearchText] = useState('')
  const [oeFilter, setOeFilter] = useState('')
  const [acaoFilter, setAcaoFilter] = useState('')
  const [setorFilter, setSetorFilter] = useState('')

  // Reference data
  const [oes, setOes] = useState<{ codigo: string; nome: string }[]>([])
  const [acoes, setAcoes] = useState<{ numero: string; nome: string; oe_codigo: string }[]>([])
  const [setores, setSetores] = useState<{ id: number; codigo: string; nome_completo: string }[]>([])

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    setLoading(true)

    // Profile
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (p) setProfile(p as any)
    }

    // Configs
    const { data: cfgs } = await supabase.from('configuracoes').select('chave, valor')
    if (cfgs) {
      const m: Record<string, string> = {}
      cfgs.forEach((c: any) => { m[c.chave] = c.valor })
      setConfigs(m)
    }

    // Reference data
    const { data: oesData } = await supabase.from('objetivos_estrategicos').select('codigo, nome').order('codigo')
    if (oesData) setOes(oesData)

    const { data: acoesData } = await supabase.from('acoes_estrategicas')
      .select('numero, nome, objetivo_estrategico:objetivo_estrategico_id(codigo)')
      .order('numero')
    if (acoesData) setAcoes(acoesData.map((a: any) => ({
      numero: a.numero, nome: a.nome, oe_codigo: a.objetivo_estrategico?.codigo || ''
    })))

    const { data: setoresData } = await supabase.from('setores').select('id, codigo, nome_completo').order('codigo')
    if (setoresData) setSetores(setoresData)

    // Projects with all related data
    const { data: projData } = await supabase.from('projetos')
      .select(`id, nome, descricao, setor_lider_id,
        setor_lider:setor_lider_id(codigo, nome_completo),
        projeto_acoes(acao_estrategica:acao_estrategica_id(numero, nome, objetivo_estrategico:objetivo_estrategico_id(codigo))),
        entregas(id, data_final_prevista, status,
          entrega_participantes(setor_id, tipo_participante, setor:setor_id(codigo)),
          atividades(atividade_participantes(setor_id, tipo_participante, setor:setor_id(codigo)))
        )`)
      .order('nome')

    if (projData) {
      const cards: ProjetoCard[] = projData.map((p: any) => {
        // Collect participante setores (unique)
        const setorSet = new Set<string>()
        p.entregas?.forEach((e: any) => {
          e.entrega_participantes?.forEach((ep: any) => {
            if (ep.tipo_participante === 'setor' && ep.setor) setorSet.add(ep.setor.codigo)
            else if (ep.tipo_participante === 'externo_subsegop') setorSet.add('Ext. SUBSEGOP')
            else if (ep.tipo_participante === 'externo_sedec') setorSet.add('Ext. SEDEC')
          })
          e.atividades?.forEach((a: any) => {
            a.atividade_participantes?.forEach((ap: any) => {
              if (ap.tipo_participante === 'setor' && ap.setor) setorSet.add(ap.setor.codigo)
              else if (ap.tipo_participante === 'externo_subsegop') setorSet.add('Ext. SUBSEGOP')
              else if (ap.tipo_participante === 'externo_sedec') setorSet.add('Ext. SEDEC')
            })
          })
        })

        // Calculate pontualidade
        const now = new Date()
        now.setHours(0, 0, 0, 0)
        const quinzena = new Date(now)
        quinzena.setDate(quinzena.getDate() + 15)

        let pontualidade: 'em_dia' | 'proximo' | 'atrasado' = 'em_dia'
        let proximaEntrega: string | null = null
        const activeEntregas = (p.entregas || []).filter((e: any) =>
          e.status !== 'resolvida' && e.status !== 'cancelada' && e.data_final_prevista
        )

        const hasAtrasada = activeEntregas.some((e: any) => new Date(e.data_final_prevista) < now)
        const hasProxima = activeEntregas.some((e: any) => {
          const d = new Date(e.data_final_prevista)
          return d >= now && d <= quinzena
        })

        if (hasAtrasada) pontualidade = 'atrasado'
        else if (hasProxima) pontualidade = 'proximo'

        // Próxima entrega
        const futuras = activeEntregas
          .filter((e: any) => new Date(e.data_final_prevista) >= now)
          .sort((a: any, b: any) => new Date(a.data_final_prevista).getTime() - new Date(b.data_final_prevista).getTime())
        if (futuras.length > 0) proximaEntrega = futuras[0].data_final_prevista
        else if (activeEntregas.length > 0) {
          // All overdue, show most recent
          const sorted = [...activeEntregas].sort((a: any, b: any) =>
            new Date(b.data_final_prevista).getTime() - new Date(a.data_final_prevista).getTime())
          proximaEntrega = sorted[0].data_final_prevista
        }

        return {
          id: p.id,
          nome: p.nome,
          descricao: p.descricao,
          setor_lider_id: p.setor_lider_id,
          setor_lider_codigo: p.setor_lider?.codigo || '',
          setor_lider_nome: p.setor_lider?.nome_completo || '',
          acoes: (p.projeto_acoes || []).map((pa: any) => ({
            numero: pa.acao_estrategica?.numero || '',
            nome: pa.acao_estrategica?.nome || '',
            oe_codigo: pa.acao_estrategica?.objetivo_estrategico?.codigo || '',
          })),
          setores_participantes: Array.from(setorSet),
          proxima_entrega: proximaEntrega,
          pontualidade,
        }
      })
      setProjetos(cards)
    }

    setLoading(false)
  }

  // Filter acoes by selected OE
  const filteredAcoes = useMemo(() => {
    if (!oeFilter) return acoes
    return acoes.filter(a => a.oe_codigo === oeFilter)
  }, [acoes, oeFilter])

  // When OE changes, reset acao filter
  useEffect(() => { setAcaoFilter('') }, [oeFilter])

  // Filtered projects
  const filtered = useMemo(() => {
    return projetos.filter(p => {
      if (searchText) {
        const s = searchText.toLowerCase()
        if (!p.nome.toLowerCase().includes(s) && !p.descricao.toLowerCase().includes(s)) return false
      }
      if (oeFilter) {
        if (!p.acoes.some(a => a.oe_codigo === oeFilter)) return false
      }
      if (acaoFilter) {
        if (!p.acoes.some(a => a.numero === acaoFilter)) return false
      }
      if (setorFilter) {
        const isLider = p.setor_lider_codigo === setorFilter
        const isParticipante = p.setores_participantes.includes(setorFilter)
        if (!isLider && !isParticipante) return false
      }
      return true
    })
  }, [projetos, searchText, oeFilter, acaoFilter, setorFilter])

  // Group by setor lider, sort by proxima entrega
  const grouped = useMemo(() => {
    const groups: Record<string, ProjetoCard[]> = {}
    const sorted = [...filtered].sort((a, b) => {
      if (!a.proxima_entrega && !b.proxima_entrega) return 0
      if (!a.proxima_entrega) return 1
      if (!b.proxima_entrega) return -1
      return new Date(a.proxima_entrega).getTime() - new Date(b.proxima_entrega).getTime()
    })
    sorted.forEach(p => {
      const key = p.setor_lider_codigo
      if (!groups[key]) groups[key] = []
      groups[key].push(p)
    })
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b))
  }, [filtered])

  const hasFilters = !!(searchText || oeFilter || acaoFilter || setorFilter)
  const canCreate = profile?.role === 'admin' || (profile?.role === 'gestor' && configs['proj_permitir_cadastro'] !== 'false')

  function formatQuinzena(dateStr: string | null) {
    if (!dateStr) return '—'
    const d = new Date(dateStr + 'T00:00:00')
    const month = d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')
    const year = d.getFullYear().toString().slice(-2)
    const q = d.getDate() <= 15 ? '1ª' : '2ª'
    return `${month}/${year} – ${q} quinz.`
  }

  if (loading) return <div className="flex justify-center py-20"><div className="animate-pulse text-sedec-500">Carregando...</div></div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FolderKanban size={24} className="text-orange-500" /> Gestão de Projetos
          </h1>
          <p className="text-gray-500 text-sm mt-1">Projetos vinculados às Ações Estratégicas Prioritárias</p>
        </div>
        {canCreate && (
          <button onClick={() => router.push('/dashboard/projetos/novo')}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
            <Plus size={18} /> Novo projeto
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
          <Filter size={16} /> Filtros
          {hasFilters && (
            <button onClick={() => { setSearchText(''); setOeFilter(''); setAcaoFilter(''); setSetorFilter('') }}
              className="ml-auto text-xs text-red-500 hover:text-red-700 flex items-center gap-1">
              <X size={14} /> Limpar
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Buscar projeto..." value={searchText}
              onChange={e => setSearchText(e.target.value)} className="input-field pl-9" />
          </div>
          <select value={oeFilter} onChange={e => setOeFilter(e.target.value)} className="input-field">
            <option value="">Todos os objetivos</option>
            {oes.map(o => <option key={o.codigo} value={o.codigo}>{o.codigo} — {o.nome.substring(0, 60)}</option>)}
          </select>
          <select value={acaoFilter} onChange={e => setAcaoFilter(e.target.value)} className="input-field">
            <option value="">Todas as ações</option>
            {filteredAcoes.map(a => <option key={a.numero} value={a.numero}>AE {a.numero}</option>)}
          </select>
          <select value={setorFilter} onChange={e => setSetorFilter(e.target.value)} className="input-field">
            <option value="">Todos os setores</option>
            {setores.map(s => <option key={s.codigo} value={s.codigo}>{s.codigo}</option>)}
          </select>
        </div>
      </div>

      <p className="text-sm text-gray-500 mb-4">{filtered.length} projeto(s){hasFilters ? ' filtrado(s)' : ''}</p>

      {grouped.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          {projetos.length === 0 ? 'Nenhum projeto cadastrado ainda.' : 'Nenhum projeto encontrado com os filtros aplicados.'}
        </div>
      )}

      {grouped.map(([setorCodigo, projs]) => (
        <div key={setorCodigo} className="mb-8">
          <h2 className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3 pb-2 border-b border-gray-200">
            <Building2 size={16} className="text-sedec-500" />
            {setorCodigo} — {setores.find(s => s.codigo === setorCodigo)?.nome_completo || ''}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 items-start">
            {projs.map(p => {
              const pont = PONT_CONFIG[p.pontualidade]
              const PontIcon = pont.icon
              const highlight = setorFilter && p.setores_participantes.includes(setorFilter) && p.setor_lider_codigo !== setorFilter
              return (
                <button key={p.id} onClick={() => router.push(`/dashboard/projetos/${p.id}`)}
                  className={`card p-5 text-left group hover:border-orange-300 transition-colors ${pont.border} border-l-4`}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-sm font-semibold text-gray-800 leading-snug min-h-[2.5rem] line-clamp-2 group-hover:line-clamp-none">
                      {p.nome}
                    </h3>
                    <span className={`flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${pont.bg} ${pont.color}`}>
                      <PontIcon size={11} /> {pont.label}
                    </span>
                  </div>

                  <p className="text-xs text-gray-500 line-clamp-2 mb-3">{p.descricao}</p>

                  <div className="space-y-1.5 text-xs text-gray-500">
                    <div className="flex flex-wrap gap-1">
                      {p.acoes.map(a => (
                        <span key={a.numero} className="bg-sedec-50 text-sedec-600 px-1.5 py-0.5 rounded text-[10px] font-medium">
                          AE {a.numero}
                        </span>
                      ))}
                    </div>
                    {p.setores_participantes.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {p.setores_participantes.slice(0, 5).map(s => (
                          <span key={s} className={`px-1.5 py-0.5 rounded text-[10px] ${
                            setorFilter && s === setorFilter ? 'bg-orange-100 text-orange-700 font-bold' : 'bg-gray-100 text-gray-500'
                          }`}>{s}</span>
                        ))}
                        {p.setores_participantes.length > 5 && (
                          <span className="text-[10px] text-gray-400">+{p.setores_participantes.length - 5}</span>
                        )}
                      </div>
                    )}
                    {p.proxima_entrega && (
                      <div className="flex items-center gap-1 text-[11px]">
                        <Clock size={11} className="text-gray-400" />
                        Próx. entrega: <span className="font-medium">{formatQuinzena(p.proxima_entrega)}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 pt-2 border-t border-gray-100 flex items-center text-xs text-orange-600 font-medium group-hover:text-orange-700">
                    Ver detalhes <ChevronRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
