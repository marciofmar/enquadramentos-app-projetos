'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { CalendarDays, ChevronLeft, ChevronRight, Filter, X, ExternalLink, Edit3, Save } from 'lucide-react'
import type { Profile } from '@/lib/types'

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
  // Campos para edição de datas e exibição
  setor_lider_id: number
  setor_lider_codigo: string
  setor_lider_nome: string
  entrega_id: number | null // para atividades: ID da entrega pai
  entrega_data_final: string | null // para atividades: data limite da entrega
  atividades_datas: { nome: string; data: string }[] // para entregas: datas das atividades filhas
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

const QUINZENAS = (() => {
  const opts: { value: string; label: string }[] = []
  const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
  for (let y = 2026; y <= 2027; y++) {
    for (let m = 0; m < 12; m++) {
      for (const q of [1, 2]) {
        const day = q === 1 ? 15 : new Date(y, m + 1, 0).getDate()
        const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
        opts.push({ value: dateStr, label: `${meses[m]}/${String(y).slice(-2)} – ${q}ª quinzena` })
      }
    }
  }
  return opts
})()

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
  const [projetoFilter, setProjetoFilter] = useState('')
  const [selectedItem, setSelectedItem] = useState<CalendarItem | null>(null)

  // Reference data
  const [oes, setOes] = useState<{ codigo: string; nome: string }[]>([])
  const [acoes, setAcoes] = useState<{ numero: string; nome: string; oe_codigo: string }[]>([])
  const [setores, setSetores] = useState<{ id: number; codigo: string; nome_completo: string }[]>([])

  // Auth, configs, solicitações
  const [profile, setProfile] = useState<Profile | null>(null)
  const [configs, setConfigs] = useState<Record<string, string>>({})
  const [solicitacoes, setSolicitacoes] = useState<any[]>([])

  // Date editing
  const [editingDate, setEditingDate] = useState(false)
  const [newDate, setNewDate] = useState('')
  const [savingDate, setSavingDate] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    setLoading(true)

    // Load user profile
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (p) setProfile(p as any)
    }

    const [oesRes, acoesRes, setoresRes, projRes, cfgsRes, solsRes] = await Promise.all([
      supabase.from('objetivos_estrategicos').select('codigo, nome').order('codigo'),
      supabase.from('acoes_estrategicas')
        .select('numero, nome, objetivo_estrategico:objetivo_estrategico_id(codigo)')
        .order('numero'),
      supabase.from('setores').select('id, codigo, nome_completo').order('codigo'),
      supabase.from('projetos')
        .select(`id, nome, setor_lider_id, setor_lider:setor_lider_id(codigo, nome_completo),
          projeto_acoes(acao_estrategica:acao_estrategica_id(numero, nome, objetivo_estrategico:objetivo_estrategico_id(codigo))),
          entregas(id, nome, data_final_prevista, status, motivo_status, criterios_aceite, dependencias_criticas,
            entrega_participantes(setor_id, tipo_participante, setor:setor_id(codigo)),
            atividades(id, nome, data_prevista, status, motivo_status,
              atividade_participantes(setor_id, tipo_participante, setor:setor_id(codigo)))
          )`)
        .order('nome'),
      supabase.from('configuracoes').select('chave, valor'),
      supabase.from('solicitacoes_alteracao').select('*').eq('status', 'em_analise'),
    ])

    if (oesRes.data) setOes(oesRes.data)
    if (acoesRes.data) setAcoes(acoesRes.data.map((a: any) => ({
      numero: a.numero, nome: a.nome, oe_codigo: a.objetivo_estrategico?.codigo || ''
    })))
    if (setoresRes.data) setSetores(setoresRes.data)
    if (cfgsRes.data) { const m: Record<string, string> = {}; cfgsRes.data.forEach((c: any) => { m[c.chave] = c.valor }); setConfigs(m) }
    if (solsRes.data) setSolicitacoes(solsRes.data)

    if (projRes.data) {
      const calItems: CalendarItem[] = []

      projRes.data.forEach((p: any) => {
        const projetoAcoes = (p.projeto_acoes || []).map((pa: any) => ({
          numero: pa.acao_estrategica?.numero || '',
          oe_codigo: pa.acao_estrategica?.objetivo_estrategico?.codigo || '',
        }))

        ;(p.entregas || []).forEach((e: any) => {
          // Collect setores from entrega (incluindo setor líder do projeto)
          const setorSet = new Set<string>()
          if (p.setor_lider?.codigo) setorSet.add(p.setor_lider.codigo)
          e.entrega_participantes?.forEach((ep: any) => {
            if (ep.tipo_participante === 'setor' && ep.setor) setorSet.add(ep.setor.codigo)
            else if (ep.tipo_participante === 'externo_subsegop') setorSet.add('Ext. SUBSEGOP')
            else if (ep.tipo_participante === 'externo_sedec') setorSet.add('Ext. SEDEC')
          })

          // Collect atividades dates for entrega validation
          const ativDatas = (e.atividades || [])
            .filter((a: any) => a.data_prevista)
            .map((a: any) => ({ nome: a.nome, data: a.data_prevista }))

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
              setor_lider_id: p.setor_lider_id,
              setor_lider_codigo: p.setor_lider?.codigo || '',
              setor_lider_nome: p.setor_lider?.nome_completo || '',
              entrega_id: null,
              entrega_data_final: null,
              atividades_datas: ativDatas,
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
                setor_lider_id: p.setor_lider_id,
                setor_lider_codigo: p.setor_lider?.codigo || '',
                setor_lider_nome: p.setor_lider?.nome_completo || '',
                entrega_id: e.id,
                entrega_data_final: e.data_final_prevista || null,
                atividades_datas: [],
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

  // Derive unique projects from items, filtered by selected sector
  const filteredProjetos = useMemo(() => {
    const map = new Map<number, { id: number; nome: string }>()
    items.forEach(item => {
      if (setorFilter && !item.setores.includes(setorFilter)) return
      if (!map.has(item.projeto_id)) {
        map.set(item.projeto_id, { id: item.projeto_id, nome: item.projeto_nome })
      }
    })
    return Array.from(map.values()).sort((a, b) => a.nome.localeCompare(b.nome))
  }, [items, setorFilter])

  // Reset project filter when sector changes (selected project may no longer be valid)
  useEffect(() => { setProjetoFilter('') }, [setorFilter])

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      if (oeFilter && !item.acoes.some(a => a.oe_codigo === oeFilter)) return false
      if (acaoFilter && !item.acoes.some(a => a.numero === acaoFilter)) return false
      if (setorFilter && !item.setores.includes(setorFilter)) return false
      if (projetoFilter && item.projeto_id !== Number(projetoFilter)) return false
      return true
    })
  }, [items, oeFilter, acaoFilter, setorFilter, projetoFilter])

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

  const hasFilters = !!(oeFilter || acaoFilter || setorFilter || projetoFilter)

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

  // Permission logic
  const isAdminOrMaster = profile?.role === 'admin' || profile?.role === 'master'

  function canEditDate(item: CalendarItem): boolean {
    if (!profile) return false
    if (isAdminOrMaster) return true
    if (profile.role !== 'gestor' || profile.setor_id !== item.setor_lider_id) return false
    if (item.tipo === 'entrega') return configs['proj_permitir_edicao_datas'] !== 'false'
    if (item.tipo === 'atividade') return configs['proj_permitir_edicao_datas_atividades'] !== 'false'
    return false
  }

  function needsApprovalForItem(item: CalendarItem): boolean {
    if (isAdminOrMaster) return false
    return profile?.role === 'gestor' && profile.setor_id === item.setor_lider_id
      && configs['proj_exigir_aprovacao_edicao'] === 'true'
  }

  function hasPendingSolicitacao(tipoEntidade: string, entidadeId: number) {
    return solicitacoes.some(s => s.tipo_entidade === tipoEntidade && s.entidade_id === entidadeId && s.status === 'em_analise')
  }

  async function auditLog(tipo: string, entidade: string, entidadeId: number, anterior: any, novo: any) {
    await supabase.from('audit_log').insert({
      usuario_id: profile!.id, usuario_nome: profile!.nome,
      tipo_acao: tipo, entidade, entidade_id: entidadeId,
      conteudo_anterior: anterior, conteudo_novo: novo
    })
  }

  async function saveDate(item: CalendarItem) {
    // Não houve alteração
    if (newDate === item.data) { setEditingDate(false); return }

    // Não permitir remover a data pelo calendário (item desapareceria)
    if (!newDate) {
      alert('Não é possível remover a data pelo calendário. Para remover o prazo, edite diretamente no projeto.')
      return
    }

    setSavingDate(true)

    // Validação para entregas: atividades não podem ter data posterior
    if (item.tipo === 'entrega') {
      const posteriores = item.atividades_datas.filter(a => a.data > newDate)
      if (posteriores.length > 0) {
        const nomes = posteriores.map(a => `"${a.nome}"`).join(', ')
        alert(`Não é possível definir esta quinzena. As atividades ${nomes} têm datas posteriores. Ajuste-as primeiro.`)
        setSavingDate(false); return
      }
    }

    // Validação para atividades: data não pode ser posterior à quinzena da entrega
    if (item.tipo === 'atividade' && item.entrega_data_final && newDate > item.entrega_data_final) {
      alert(`A data da atividade não pode ser posterior à quinzena da entrega (${item.entrega_data_final}).`)
      setSavingDate(false); return
    }

    // Fluxo de aprovação
    if (needsApprovalForItem(item)) {
      if (hasPendingSolicitacao(item.tipo, item.id)) {
        alert(`Já existe uma solicitação pendente para esta ${item.tipo === 'entrega' ? 'entrega' : 'atividade'}. Aguarde a avaliação.`)
        setSavingDate(false); return
      }
      const dados = item.tipo === 'entrega'
        ? { data_final_prevista: newDate }
        : { data_prevista: newDate }
      const { error } = await supabase.from('solicitacoes_alteracao').insert({
        solicitante_id: profile!.id,
        solicitante_nome: profile!.nome,
        tipo_entidade: item.tipo,
        entidade_id: item.id,
        entidade_nome: item.nome,
        projeto_id: item.projeto_id,
        tipo_operacao: 'edicao',
        dados_alteracao: dados,
      })
      if (error) { alert(`Erro ao criar solicitação: ${error.message}`); setSavingDate(false); return }
      alert('Solicitação enviada para o Gabinete de Gestão de Projetos para avaliação.')
      setEditingDate(false); setSavingDate(false); loadAll(); return
    }

    // Edição direta
    if (item.tipo === 'entrega') {
      const { error } = await supabase.from('entregas').update({ data_final_prevista: newDate }).eq('id', item.id)
      if (error) { alert(error.message); setSavingDate(false); return }
      await auditLog('update', 'entrega', item.id, { data_final_prevista: item.data }, { data_final_prevista: newDate })
    } else {
      const { error } = await supabase.from('atividades').update({ data_prevista: newDate }).eq('id', item.id)
      if (error) { alert(error.message); setSavingDate(false); return }
      await auditLog('update', 'atividade', item.id, { data_prevista: item.data }, { data_prevista: newDate })
    }

    setEditingDate(false); setSavingDate(false)
    setSelectedItem(null)
    loadAll()
  }

  function handleItemClick(item: CalendarItem, e: React.MouseEvent) {
    e.stopPropagation()
    setSelectedItem(item)
    setEditingDate(false)
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
            <button onClick={() => { setOeFilter(''); setAcaoFilter(''); setSetorFilter(''); setProjetoFilter('') }}
              className="ml-auto text-xs text-red-500 hover:text-red-700 flex items-center gap-1">
              <X size={14} /> Limpar
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
          <select value={projetoFilter} onChange={e => setProjetoFilter(e.target.value)} className="input-field">
            <option value="">Todos os projetos</option>
            {filteredProjetos.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
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
                  <p className="text-xs text-gray-400 mt-0.5">
                    {selectedItem.projeto_nome}
                    {selectedItem.setor_lider_codigo && (
                      <> — <span className="font-medium">{selectedItem.setor_lider_codigo}</span></>
                    )}
                  </p>
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
              {!editingDate ? (
                <div className="flex items-center gap-2 text-sm">
                  <CalendarDays size={14} className="text-gray-400 shrink-0" />
                  <span className="text-gray-500 font-medium">Prazo:</span>
                  <span className="text-gray-700">
                    {(() => {
                      const [y, m, d] = selectedItem.data.split('-').map(Number)
                      return new Date(y, m - 1, d).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
                    })()}
                  </span>
                  {canEditDate(selectedItem) && (
                    <button
                      onClick={() => { setEditingDate(true); setNewDate(selectedItem.data) }}
                      className="text-gray-400 hover:text-orange-500 transition-colors p-0.5"
                      title="Alterar data"
                    >
                      <Edit3 size={13} />
                    </button>
                  )}
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    <CalendarDays size={13} /> Alterar prazo
                  </div>
                  {selectedItem.tipo === 'entrega' ? (
                    <select
                      value={newDate}
                      onChange={ev => setNewDate(ev.target.value)}
                      className="input-field text-sm"
                    >
                      {QUINZENAS.map(q => <option key={q.value} value={q.value}>{q.label}</option>)}
                    </select>
                  ) : (
                    <input
                      type="date"
                      value={newDate}
                      max={selectedItem.entrega_data_final || undefined}
                      onChange={ev => {
                        const nd = ev.target.value
                        if (nd && selectedItem.entrega_data_final && nd > selectedItem.entrega_data_final) {
                          alert(`A data não pode ser posterior à quinzena da entrega (${selectedItem.entrega_data_final}).`)
                          return
                        }
                        setNewDate(nd)
                      }}
                      className="input-field text-sm"
                    />
                  )}
                  {selectedItem.tipo === 'atividade' && selectedItem.entrega_data_final && (
                    <p className="text-[10px] text-gray-500">
                      Data máxima: {(() => {
                        const [y, m, d] = selectedItem.entrega_data_final!.split('-').map(Number)
                        return new Date(y, m - 1, d).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
                      })()}
                    </p>
                  )}
                  {needsApprovalForItem(selectedItem) && (
                    <p className="text-[11px] text-amber-600 bg-amber-50 border border-amber-100 rounded px-2 py-1">
                      A alteração será enviada como solicitação para aprovação do Gabinete de Gestão de Projetos.
                    </p>
                  )}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => saveDate(selectedItem)}
                      disabled={savingDate}
                      className="flex items-center gap-1 text-xs bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Save size={12} /> {savingDate ? 'Salvando...' : 'Salvar'}
                    </button>
                    <button
                      onClick={() => setEditingDate(false)}
                      className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 px-2 py-1.5 transition-colors"
                    >
                      <X size={12} /> Cancelar
                    </button>
                  </div>
                </div>
              )}

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
