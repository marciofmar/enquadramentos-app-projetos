'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Search, Filter, X, ChevronRight, Layers, Target, Compass } from 'lucide-react'

interface AcaoCard {
  id: number
  numero: string
  nome: string
  eixo: string
  oe: string
  estrategia: string
}

export default function DashboardPage() {
  const [acoes, setAcoes] = useState<AcaoCard[]>([])
  const [setores, setSetores] = useState<{ codigo: string; nome_completo: string }[]>([])
  const [eixos, setEixos] = useState<{ codigo: string; nome: string }[]>([])
  const [oes, setOes] = useState<{ codigo: string; nome: string }[]>([])
  const [setorFilter, setSetorFilter] = useState('')
  const [eixoFilter, setEixoFilter] = useState('')
  const [oeFilter, setOeFilter] = useState('')
  const [search, setSearch] = useState('')
  const [setorAcoes, setSetorAcoes] = useState<Record<string, number[]>>({})
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      // Load ações with relations
      const { data: acoesData } = await supabase
        .from('acoes_estrategicas')
        .select(`id, numero, nome,
          eixo_prioritario:eixo_prioritario_id(codigo, nome),
          objetivo_estrategico:objetivo_estrategico_id(codigo, nome),
          estrategia:estrategia_id(codigo, nome)`)
        .order('numero')

      if (acoesData) {
        setAcoes(acoesData.map((a: any) => ({
          id: a.id,
          numero: a.numero,
          nome: a.nome,
          eixo: a.eixo_prioritario?.nome || '',
          oe: a.objetivo_estrategico?.nome || '',
          estrategia: a.estrategia?.nome || '',
        })))
      }

      // Load filters data
      const { data: setoresData } = await supabase.from('setores').select('codigo, nome_completo').order('codigo')
      if (setoresData) setSetores(setoresData)

      const { data: eixosData } = await supabase.from('eixos_prioritarios').select('codigo, nome').order('codigo')
      if (eixosData) setEixos(eixosData)

      const { data: oesData } = await supabase.from('objetivos_estrategicos').select('codigo, nome').order('codigo')
      if (oesData) setOes(oesData)

      // Load setor-acao mapping for filtering
      const { data: fsData } = await supabase
        .from('ficha_setores')
        .select('setor_id, fichas!inner(acao_estrategica_id)')

      if (fsData) {
        const { data: setoresAll } = await supabase.from('setores').select('id, codigo')
        const setorMap: Record<number, string> = {}
        setoresAll?.forEach((s: any) => { setorMap[s.id] = s.codigo })

        const map: Record<string, Set<number>> = {}
        fsData.forEach((fs: any) => {
          const cod = setorMap[fs.setor_id]
          if (cod) {
            if (!map[cod]) map[cod] = new Set()
            map[cod].add((fs.fichas as any).acao_estrategica_id)
          }
        })
        const result: Record<string, number[]> = {}
        for (const [k, v] of Object.entries(map)) result[k] = Array.from(v)
        setSetorAcoes(result)
      }

      setLoading(false)
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    let result = acoes

    if (search) {
      const q = search.toLowerCase()
      result = result.filter(a =>
        a.numero.includes(q) || a.nome.toLowerCase().includes(q)
      )
    }

    if (eixoFilter) {
      result = result.filter(a => a.eixo.includes(eixoFilter))
    }

    if (oeFilter) {
      result = result.filter(a => a.oe.includes(oeFilter))
    }

    if (setorFilter) {
      const ids = setorAcoes[setorFilter] || []
      result = result.filter(a => ids.includes(a.id))
    }

    return result
  }, [acoes, search, eixoFilter, oeFilter, setorFilter, setorAcoes])

  const hasFilters = search || eixoFilter || oeFilter || setorFilter

  function clearFilters() {
    setSearch(''); setEixoFilter(''); setOeFilter(''); setSetorFilter('')
  }

  // Extract eixo short name
  function eixoShort(nome: string) {
    const m = nome.match(/EIXO\s*(\d+)/)
    return m ? `Eixo ${m[1]}` : nome.substring(0, 15)
  }

  function eixoColor(nome: string): string {
    const m = nome.match(/EIXO\s*(\d+)/)
    if (!m) return 'bg-gray-100 text-gray-700'
    const colors: Record<string, string> = {
      '1': 'bg-blue-100 text-blue-700',
      '2': 'bg-amber-100 text-amber-700',
      '3': 'bg-emerald-100 text-emerald-700',
      '4': 'bg-purple-100 text-purple-700',
      '5': 'bg-rose-100 text-rose-700',
    }
    return colors[m[1]] || 'bg-gray-100 text-gray-700'
  }

  if (loading) {
    return (
      <div>
        <div className="skeleton h-8 w-72 mb-2" />
        <div className="skeleton h-4 w-96 mb-8" />
        <div className="skeleton h-14 w-full rounded-xl mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="skeleton-card">
              <div className="skeleton h-5 w-20" />
              <div className="skeleton-text" />
              <div className="skeleton-text-sm" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 tracking-tight">Ações Estratégicas Prioritárias</h1>
        <p className="text-gray-400 text-sm mt-0.5">Enquadramentos Estratégicos Setoriais — Exercício 2026</p>
      </div>

      {/* KPI bar */}
      <div className="flex gap-3 mb-6 overflow-x-auto pb-1">
        <div className="kpi-pill">
          <span className="kpi-pill-value text-sedec-600">{acoes.length}</span>
          <span className="kpi-pill-label">Ações totais</span>
        </div>
        <div className="kpi-pill">
          <span className="kpi-pill-value text-blue-600">{eixos.length}</span>
          <span className="kpi-pill-label">Eixos</span>
        </div>
        <div className="kpi-pill">
          <span className="kpi-pill-value text-amber-600">{oes.length}</span>
          <span className="kpi-pill-label">Objetivos</span>
        </div>
        {hasFilters && (
          <div className="kpi-pill border-orange-200 bg-orange-50">
            <span className="kpi-pill-value text-orange-600">{filtered.length}</span>
            <span className="kpi-pill-label text-orange-500">Filtradas</span>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200/80 p-4 mb-6">
        <div className="flex items-center gap-2 text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
          <Filter size={14} />
          Filtros
          {hasFilters && (
            <button onClick={clearFilters} className="ml-auto text-xs text-red-400 hover:text-red-600 flex items-center gap-1 normal-case tracking-normal">
              <X size={13} /> Limpar
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por número ou nome..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field pl-9"
            />
          </div>

          <select value={setorFilter} onChange={e => setSetorFilter(e.target.value)} className="input-field">
            <option value="">Todos os setores</option>
            {setores.map(s => (
              <option key={s.codigo} value={s.codigo}>{s.codigo} — {s.nome_completo}</option>
            ))}
          </select>

          <select value={eixoFilter} onChange={e => setEixoFilter(e.target.value)} className="input-field">
            <option value="">Todos os eixos</option>
            {eixos.map(e => (
              <option key={e.codigo} value={e.nome}>{e.nome}</option>
            ))}
          </select>

          <select value={oeFilter} onChange={e => setOeFilter(e.target.value)} className="input-field">
            <option value="">Todos os OEs</option>
            {oes.map(o => (
              <option key={o.codigo} value={o.nome}>{o.codigo} — {o.nome.substring(0, 50)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 items-start">
        {filtered.map(acao => (
          <button
            key={acao.id}
            onClick={() => router.push(`/dashboard/acao/${acao.numero}`)}
            className="card p-5 text-left group hover:border-orange-300/60 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-orange-400 opacity-0 group-hover:opacity-100 transition-opacity rounded-l-xl" />
            <div className="flex items-start justify-between mb-3">
              <span className="text-lg font-bold text-sedec-600">AE {acao.numero}</span>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${eixoColor(acao.eixo)}`}>
                {eixoShort(acao.eixo)}
              </span>
            </div>

            <h3 className="text-sm font-semibold text-gray-800 mb-3 leading-snug min-h-[2.5rem] line-clamp-2 group-hover:line-clamp-none">
              {acao.nome}
            </h3>

            <div className="space-y-1.5 text-xs text-gray-500">
              <div className="flex items-start gap-1.5">
                <Target size={12} className="mt-0.5 shrink-0 text-gray-400" />
                <span className="line-clamp-1">{acao.oe}</span>
              </div>
              <div className="flex items-start gap-1.5">
                <Compass size={12} className="mt-0.5 shrink-0 text-gray-400" />
                <span className="line-clamp-1">{acao.estrategia}</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center text-xs text-orange-600 font-medium group-hover:text-orange-700">
              Ver enquadramento completo
              <ChevronRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          Nenhuma ação encontrada com os filtros aplicados.
        </div>
      )}
    </div>
  )
}
