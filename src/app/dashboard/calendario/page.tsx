'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { CalendarDays, ChevronLeft, ChevronRight, Filter, X, ExternalLink } from 'lucide-react'

interface CalendarItem {
  id: number
  tipo: 'entrega' | 'atividade'
  nome: string
  entrega_nome: string | null // only for atividade
  data: string // YYYY-MM-DD
  status: string
  motivo_status: string | null
  criterios_aceite: string | null // only for entrega
  dependencias_criticas: string | null // only for entrega
  projeto_id: number
  projeto_nome: string
  setores: string[]
  acoes: { numero: string; oe_codigo: string }[]
}

const STATUS_COLORS: Record<string, string> = {
  aberta: 'bg-gray-100 text-gray-700',
  em_andamento: 'bg-blue-100 text-blue-700',
  aguardando: 'bg-yellow-100 text-yellow-700',
  resolvida: 'bg-green-100 text-green-700',
  cancelada: 'bg-red-100 text-red-700',
}

function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  // Monday=0 ... Sunday=6
  let startDow = firstDay.getDay() - 1
  if (startDow < 0) startDow = 6

  const days: { date: Date; isCurrentMonth: boolean }[] = []

  // Days from previous month
  for (let i = startDow - 1; i >= 0; i--) {
    const d = new Date(year, month, -i)
    days.push({ date: d, isCurrentMonth: false })
  }

  // Days of current month
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push({ date: new Date(year, month, i), isCurrentMonth: true })
  }

  // Fill remaining to complete weeks
  while (days.length % 7 !== 0) {
    const next = new Date(year, month + 1, days.length - startDow - lastDay.getDate() + 1)
    days.push({ date: next, isCurrentMonth: false })
  }

  return days
}

function getWeekDays(weekStart: Date) {
  const days: Date[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart)
    d.setDate(weekStart.getDate() + i)
    days.push(d)
  }
  return days
}

function getMondayOfWeek(date: Date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function formatDateKey(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const MONTH_NAMES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']
const MONTH_ABBR = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
const DAY_NAMES = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

export default function CalendarioPage() {
  const [items, setItems] = useState<CalendarItem[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'mes' | 'semana'>('mes')

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [currentWeekStart, setCurrentWeekStart] = useState(getMondayOfWeek(today))

  const [oeFilter, setOeFilter] = useState('')
  const [acaoFilter, setAcaoFilter] = useState('')
  const [setorFilter, setSetorFilter] = useState('')
  const [selectedItem, setSelectedItem] = useState<CalendarItem | null>(null)

  // Reference data
  const [oes, setOes] = useState<{ codigo: string; nome: string }[]>([])
  const [acoes, setAcoes] = useState<{ numero: string; nome: string; oe_codigo: string }[]>([])
  const [setores, setSetores] = useState<{ id: number; codigo: string; nome_completo: string }[]>([])

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    setLoading(true)

    const [oesRes, acoesRes, setoresRes, projRes] = await Promise.all([
      supabase.from('objetivos_estrategicos').select('codigo, nome').order('codigo'),
      supabase.from('acoes_estrategicas')
        .select('numero, nome, objetivo_estrategico:objetivo_estrategico_id(codigo)')
        .order('numero'),
      supabase.from('setores').select('id, codigo, nome_completo').order('codigo'),
      supabase.from('projetos')
        .select(`id, nome,
          projeto_acoes(acao_estrategica:acao_estrategica_id(numero, nome, objetivo_estrategico:objetivo_estrategico_id(codigo))),
          entregas(id, nome, data_final_prevista, status, motivo_status, criterios_aceite, dependencias_criticas,
            entrega_participantes(setor_id, tipo_participante, setor:setor_id(codigo)),
            atividades(id, nome, data_prevista, status, motivo_status,
              atividade_participantes(setor_id, tipo_participante, setor:setor_id(codigo)))
          )`)
        .order('nome'),
    ])

    if (oesRes.data) setOes(oesRes.data)
    if (acoesRes.data) setAcoes(acoesRes.data.map((a: any) => ({
      numero: a.numero, nome: a.nome, oe_codigo: a.objetivo_estrategico?.codigo || ''
    })))
    if (setoresRes.data) setSetores(setoresRes.data)

    if (projRes.data) {
      const calItems: CalendarItem[] = []

      projRes.data.forEach((p: any) => {
        const projetoAcoes = (p.projeto_acoes || []).map((pa: any) => ({
          numero: pa.acao_estrategica?.numero || '',
          oe_codigo: pa.acao_estrategica?.objetivo_estrategico?.codigo || '',
        }))

        ;(p.entregas || []).forEach((e: any) => {
          // Collect setores from entrega
          const setorSet = new Set<string>()
          e.entrega_participantes?.forEach((ep: any) => {
            if (ep.tipo_participante === 'setor' && ep.setor) setorSet.add(ep.setor.codigo)
            else if (ep.tipo_participante === 'externo_subsegop') setorSet.add('Ext. SUBSEGOP')
            else if (ep.tipo_participante === 'externo_sedec') setorSet.add('Ext. SEDEC')
          })

          if (e.data_final_prevista) {
            calItems.push({
              id: e.id,
              tipo: 'entrega',
              nome: e.nome,
              entrega_nome: null,
              data: e.data_final_prevista,
              status: e.status || 'aberta',
              motivo_status: e.motivo_status || null,
              criterios_aceite: e.criterios_aceite || null,
              dependencias_criticas: e.dependencias_criticas || null,
              projeto_id: p.id,
              projeto_nome: p.nome,
              setores: Array.from(setorSet),
              acoes: projetoAcoes,
            })
          }

          ;(e.atividades || []).forEach((a: any) => {
            const aSetorSet = new Set<string>(setorSet)
            a.atividade_participantes?.forEach((ap: any) => {
              if (ap.tipo_participante === 'setor' && ap.setor) aSetorSet.add(ap.setor.codigo)
              else if (ap.tipo_participante === 'externo_subsegop') aSetorSet.add('Ext. SUBSEGOP')
              else if (ap.tipo_participante === 'externo_sedec') aSetorSet.add('Ext. SEDEC')
            })

            if (a.data_prevista) {
              calItems.push({
                id: a.id,
                tipo: 'atividade',
                nome: a.nome,
                entrega_nome: e.nome,
                data: a.data_prevista,
                status: a.status || 'aberta',
                motivo_status: a.motivo_status || null,
                criterios_aceite: null,
                dependencias_criticas: null,
                projeto_id: p.id,
                projeto_nome: p.nome,
                setores: Array.from(aSetorSet),
                acoes: projetoAcoes,
              })
            }
          })
        })
      })

      setItems(calItems)
    }

    setLoading(false)
  }

  // Filter acoes by selected OE
  const filteredAcoes = useMemo(() => {
    if (!oeFilter) return acoes
    return acoes.filter(a => a.oe_codigo === oeFilter)
  }, [acoes, oeFilter])

  useEffect(() => { setAcaoFilter('') }, [oeFilter])

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      if (oeFilter && !item.acoes.some(a => a.oe_codigo === oeFilter)) return false
      if (acaoFilter && !item.acoes.some(a => a.numero === acaoFilter)) return false
      if (setorFilter && !item.setores.includes(setorFilter)) return false
      return true
    })
  }, [items, oeFilter, acaoFilter, setorFilter])

  // Group by date
  const itemsByDate = useMemo(() => {
    const map: Record<string, CalendarItem[]> = {}
    filteredItems.forEach(item => {
      if (!map[item.data]) map[item.data] = []
      map[item.data].push(item)
    })
    return map
  }, [filteredItems])

  // Count items in visible period
  const visibleItemCount = useMemo(() => {
    if (viewMode === 'mes') {
      const days = getCalendarDays(currentYear, currentMonth)
      let count = 0
      days.forEach(d => {
        if (d.isCurrentMonth) {
          const key = formatDateKey(d.date)
          count += (itemsByDate[key] || []).length
        }
      })
      return count
    } else {
      const days = getWeekDays(currentWeekStart)
      let count = 0
      days.forEach(d => {
        const key = formatDateKey(d)
        count += (itemsByDate[key] || []).length
      })
      return count
    }
  }, [viewMode, currentYear, currentMonth, currentWeekStart, itemsByDate])

  const hasFilters = !!(oeFilter || acaoFilter || setorFilter)

  // Navigation
  function goToday() {
    const t = new Date()
    t.setHours(0, 0, 0, 0)
    setCurrentYear(t.getFullYear())
    setCurrentMonth(t.getMonth())
    setCurrentWeekStart(getMondayOfWeek(t))
  }

  function goPrev() {
    if (viewMode === 'mes') {
      if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1) }
      else setCurrentMonth(m => m - 1)
    } else {
      const prev = new Date(currentWeekStart)
      prev.setDate(prev.getDate() - 7)
      setCurrentWeekStart(prev)
    }
  }

  function goNext() {
    if (viewMode === 'mes') {
      if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1) }
      else setCurrentMonth(m => m + 1)
    } else {
      const next = new Date(currentWeekStart)
      next.setDate(next.getDate() + 7)
      setCurrentWeekStart(next)
    }
  }

  function handleItemClick(item: CalendarItem, e: React.MouseEvent) {
    e.stopPropagation()
    setSelectedItem(item)
  }

  function switchToWeekOf(date: Date) {
    setCurrentWeekStart(getMondayOfWeek(date))
    setViewMode('semana')
  }

  // Title
  const title = viewMode === 'mes'
    ? `${MONTH_NAMES[currentMonth]} ${currentYear}`
    : (() => {
        const end = new Date(currentWeekStart)
        end.setDate(end.getDate() + 6)
        const startDay = currentWeekStart.getDate()
        const endDay = end.getDate()
        if (currentWeekStart.getMonth() === end.getMonth()) {
          return `${startDay}–${endDay} ${MONTH_ABBR[currentWeekStart.getMonth()]} ${currentWeekStart.getFullYear()}`
        }
        return `${startDay} ${MONTH_ABBR[currentWeekStart.getMonth()]}–${endDay} ${MONTH_ABBR[end.getMonth()]} ${end.getFullYear()}`
      })()

  const todayKey = formatDateKey(today)

  if (loading) return <div className="flex justify-center py-20"><div className="animate-pulse text-sedec-500">Carregando...</div></div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <CalendarDays size={24} className="text-orange-500" /> Calendário
          </h1>
          <p className="text-gray-500 text-sm mt-1">Entregas e atividades dos projetos</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
          <Filter size={16} /> Filtros
          {hasFilters && (
            <button onClick={() => { setOeFilter(''); setAcaoFilter(''); setSetorFilter('') }}
              className="ml-auto text-xs text-red-500 hover:text-red-700 flex items-center gap-1">
              <X size={14} /> Limpar
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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

      {/* Calendar header */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {/* View toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
            <button onClick={() => setViewMode('mes')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'mes' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              Mês
            </button>
            <button onClick={() => setViewMode('semana')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'semana' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              Semana
            </button>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-2">
            <button onClick={goPrev} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors">
              <ChevronLeft size={20} />
            </button>
            <h2 className="text-lg font-semibold text-gray-800 min-w-[180px] text-center capitalize">{title}</h2>
            <button onClick={goNext} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors">
              <ChevronRight size={20} />
            </button>
            <button onClick={goToday}
              className="ml-2 px-3 py-1.5 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-600 transition-colors">
              Hoje
            </button>
          </div>

          <span className="text-sm text-gray-500">{visibleItemCount} item(ns)</span>
        </div>
      </div>

      {/* Calendar grid */}
      {viewMode === 'mes' ? (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-gray-200">
            {DAY_NAMES.map(d => (
              <div key={d} className="py-2 text-center text-xs font-semibold text-gray-500 uppercase">{d}</div>
            ))}
          </div>
          {/* Day cells */}
          <div className="grid grid-cols-7">
            {getCalendarDays(currentYear, currentMonth).map((day, i) => {
              const key = formatDateKey(day.date)
              const dayItems = itemsByDate[key] || []
              const isToday = key === todayKey
              const maxPills = 3
              const overflow = dayItems.length - maxPills

              return (
                <div key={i}
                  className={`min-h-[80px] md:min-h-[100px] border-b border-r border-gray-100 p-1 transition-colors
                    ${!day.isCurrentMonth ? 'bg-gray-50' : ''}
                    ${isToday ? 'ring-2 ring-inset ring-orange-400' : ''}`}>
                  <div className={`text-xs font-medium mb-1 ${!day.isCurrentMonth ? 'text-gray-300' : isToday ? 'text-orange-600 font-bold' : 'text-gray-600'}`}>
                    {day.date.getDate()}
                  </div>
                  <div className="space-y-0.5">
                    {dayItems.slice(0, maxPills).map(item => (
                      <div key={`${item.tipo}-${item.id}`}
                        onClick={(e) => handleItemClick(item, e)}
                        title={`${item.nome} — ${item.projeto_nome}`}
                        className={`text-[10px] px-1 py-0.5 rounded truncate cursor-pointer hover:opacity-80
                          border-l-2 ${item.tipo === 'entrega' ? 'border-orange-400 font-semibold' : 'border-blue-300 font-normal'}
                          ${STATUS_COLORS[item.status] || 'bg-gray-100 text-gray-700'}`}>
                        {item.nome}
                      </div>
                    ))}
                    {overflow > 0 && (
                      <div className="text-[10px] text-gray-400 pl-1 font-medium">+{overflow} mais</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Week headers */}
          <div className="grid grid-cols-7 border-b border-gray-200">
            {getWeekDays(currentWeekStart).map((d, i) => {
              const key = formatDateKey(d)
              const isToday = key === todayKey
              return (
                <div key={i} className={`py-2 text-center text-xs font-semibold ${isToday ? 'text-orange-600 bg-orange-50' : 'text-gray-500'}`}>
                  {DAY_NAMES[i]} {d.getDate()} {MONTH_ABBR[d.getMonth()]}
                </div>
              )
            })}
          </div>
          {/* Week cells */}
          <div className="grid grid-cols-7">
            {getWeekDays(currentWeekStart).map((d, i) => {
              const key = formatDateKey(d)
              const dayItems = itemsByDate[key] || []
              const isToday = key === todayKey

              return (
                <div key={i}
                  className={`min-h-[200px] md:min-h-[300px] border-r border-gray-100 p-1.5
                    ${isToday ? 'ring-2 ring-inset ring-orange-400' : ''}`}>
                  <div className="overflow-y-auto max-h-[280px] space-y-1">
                    {dayItems.map(item => (
                      <div key={`${item.tipo}-${item.id}`}
                        onClick={(e) => handleItemClick(item, e)}
                        title={`${item.nome} — ${item.projeto_nome}`}
                        className={`text-[10px] px-1.5 py-1 rounded cursor-pointer hover:opacity-80
                          border-l-2 ${item.tipo === 'entrega' ? 'border-orange-400 font-semibold' : 'border-blue-300 font-normal'}
                          ${STATUS_COLORS[item.status] || 'bg-gray-100 text-gray-700'}`}>
                        <div className="truncate">{item.nome}</div>
                        <div className="truncate text-[9px] opacity-70">{item.projeto_nome}</div>
                      </div>
                    ))}
                    {dayItems.length === 0 && (
                      <div className="text-[10px] text-gray-300 text-center pt-4">—</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Item detail popup */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setSelectedItem(null)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div className={`p-5 rounded-t-xl border-b ${
              selectedItem.tipo === 'entrega' ? 'bg-orange-50 border-orange-100' : 'bg-blue-50 border-blue-100'
            }`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[11px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wide ${
                      selectedItem.tipo === 'entrega' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {selectedItem.tipo === 'entrega' ? 'Entrega' : 'Atividade'}
                    </span>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[selectedItem.status] || 'bg-gray-100 text-gray-700'}`}>
                      {selectedItem.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-gray-800 leading-snug">{selectedItem.nome}</h3>
                  {selectedItem.entrega_nome && (
                    <p className="text-xs text-gray-500 mt-1">Entrega: <span className="font-medium">{selectedItem.entrega_nome}</span></p>
                  )}
                  <p className="text-xs text-gray-400 mt-0.5">{selectedItem.projeto_nome}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => { setSelectedItem(null); router.push(`/dashboard/projetos/${selectedItem.projeto_id}`) }}
                    className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg transition-colors ${
                      selectedItem.tipo === 'entrega'
                        ? 'bg-orange-500 hover:bg-orange-600 text-white'
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }`}
                    title="Ver projeto"
                  >
                    <ExternalLink size={13} /> Ver projeto
                  </button>
                  <button onClick={() => setSelectedItem(null)} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
                    <X size={20} />
                  </button>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">

              {/* Prazo */}
              <div className="flex items-center gap-2 text-sm">
                <CalendarDays size={14} className="text-gray-400 shrink-0" />
                <span className="text-gray-500 font-medium">Prazo:</span>
                <span className="text-gray-700">
                  {(() => {
                    const [y, m, d] = selectedItem.data.split('-').map(Number)
                    return new Date(y, m - 1, d).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
                  })()}
                </span>
              </div>

              {/* Motivo do status */}
              {selectedItem.motivo_status && (
                <div className="text-sm bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                  <span className="font-bold text-amber-700">Motivo do status:</span>
                  <span className="text-gray-700 ml-1 italic">{selectedItem.motivo_status}</span>
                </div>
              )}

              {/* Setores participantes */}
              {selectedItem.setores.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Participantes</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedItem.setores.map(s => (
                      <span key={s} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded font-medium border border-gray-200">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Critérios de aceite (entrega only) */}
              {selectedItem.criterios_aceite && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Critérios de aceite</p>
                  <ul className="space-y-1">
                    {selectedItem.criterios_aceite.split('\n').filter(l => l.trim()).map((line, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-sm text-gray-700">
                        <span className="text-gray-400 font-bold mt-0.5 shrink-0">•</span>
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Dependências críticas (entrega only) */}
              {selectedItem.dependencias_criticas && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Dependências críticas</p>
                  <ul className="space-y-1">
                    {selectedItem.dependencias_criticas.split('\n').filter(l => l.trim()).map((line, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-sm text-gray-700">
                        <span className="text-amber-500 font-bold mt-0.5 shrink-0">⚠</span>
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}


            </div>
          </div>
        </div>
      )}
    </div>
  )
}
