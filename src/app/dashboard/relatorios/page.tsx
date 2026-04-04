'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { FileBarChart, Search, CheckSquare, Square, Loader2 } from 'lucide-react'
import type { Profile } from '@/lib/types'
import { generateReportPDF } from '@/lib/generate-report-pdf'

export default function RelatoriosPage() {
  const supabase = createClient()
  const router = useRouter()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')

  const [projetos, setProjetos] = useState<{ id: number; nome: string; setor_codigo?: string }[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [search, setSearch] = useState('')

  const [sections, setSections] = useState({
    projeto: true,
    entregas: true,
    atividades: true,
  })

  const [reportName, setReportName] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data } = await supabase
        .from('profiles')
        .select('*, setores(codigo)')
        .eq('id', user.id)
        .single()

      if (!data || (data.role !== 'admin' && data.role !== 'master')) {
        router.push('/dashboard')
        return
      }
      setProfile(data as Profile)

      const { data: projs } = await supabase
        .from('projetos')
        .select('id, nome, setor_lider:setor_lider_id(codigo)')
        .order('nome')

      if (projs) {
        setProjetos(projs.map((p: any) => ({
          id: p.id,
          nome: p.nome,
          setor_codigo: p.setor_lider?.codigo || '',
        })))
      }

      setLoading(false)
    }
    load()
  }, [])

  const filteredProjetos = projetos.filter(p =>
    p.nome.toLowerCase().includes(search.toLowerCase()) ||
    (p.setor_codigo && p.setor_codigo.toLowerCase().includes(search.toLowerCase()))
  )

  function toggleProject(id: number) {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function selectAll() {
    setSelectedIds(new Set(filteredProjetos.map(p => p.id)))
  }

  function clearSelection() {
    setSelectedIds(new Set())
  }

  async function handleGenerate() {
    setError('')

    if (!reportName.trim()) {
      setError('Informe o nome do relatório.')
      return
    }
    if (selectedIds.size === 0) {
      setError('Selecione pelo menos um projeto.')
      return
    }
    if (!sections.projeto && !sections.entregas && !sections.atividades) {
      setError('Selecione pelo menos uma seção.')
      return
    }

    setGenerating(true)
    try {
      await generateReportPDF(
        Array.from(selectedIds),
        { reportName: reportName.trim(), sections },
        supabase
      )
    } catch (err: any) {
      setError(err.message || 'Erro ao gerar relatório.')
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-pulse text-sedec-500 font-medium">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <FileBarChart size={24} className="text-sedec-600" />
        <h1 className="text-2xl font-bold text-gray-800">Gerar Relatório PDF</h1>
      </div>

      {/* Nome do relatório */}
      <div className="card p-5 mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Nome do Relatório
        </label>
        <input
          type="text"
          className="input-field"
          placeholder="Ex: Relatório Trimestral Q1 2026"
          value={reportName}
          onChange={e => setReportName(e.target.value)}
        />
        <p className="text-xs text-gray-400 mt-1.5">
          O nome será usado como título do documento e no nome do arquivo (em snake_case, com data e hora).
        </p>
      </div>

      {/* Seções */}
      <div className="card p-5 mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Seções do Relatório
        </label>
        <div className="flex flex-wrap gap-3">
          {([
            { key: 'projeto' as const, label: 'Informações do Projeto' },
            { key: 'entregas' as const, label: 'Entregas' },
            { key: 'atividades' as const, label: 'Atividades' },
          ]).map(s => (
            <label
              key={s.key}
              className={`flex items-center gap-2 text-sm px-4 py-2.5 rounded-lg border cursor-pointer transition-all ${
                sections[s.key]
                  ? 'bg-sedec-50 border-sedec-300 text-sedec-700 font-medium'
                  : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              <input
                type="checkbox"
                checked={sections[s.key]}
                onChange={() => setSections(prev => ({ ...prev, [s.key]: !prev[s.key] }))}
                className="accent-sedec-600"
              />
              {s.label}
            </label>
          ))}
        </div>
      </div>

      {/* Seleção de projetos */}
      <div className="card p-5 mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Projetos ({selectedIds.size} de {projetos.length} selecionados)
        </label>

        {/* Busca + ações */}
        <div className="flex flex-col sm:flex-row gap-2 mb-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              className="input-field pl-8"
              placeholder="Buscar projeto..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button onClick={selectAll} className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1">
              <CheckSquare size={13} /> Selecionar todos
            </button>
            <button onClick={clearSelection} className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1">
              <Square size={13} /> Limpar
            </button>
          </div>
        </div>

        {/* Lista */}
        <div className="max-h-80 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
          {filteredProjetos.length === 0 && (
            <div className="text-center text-sm text-gray-400 py-6">Nenhum projeto encontrado.</div>
          )}
          {filteredProjetos.map(p => (
            <label
              key={p.id}
              className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors ${
                selectedIds.has(p.id) ? 'bg-sedec-50/50' : ''
              }`}
            >
              <input
                type="checkbox"
                checked={selectedIds.has(p.id)}
                onChange={() => toggleProject(p.id)}
                className="accent-sedec-600 shrink-0"
              />
              <div className="min-w-0">
                <span className="text-sm text-gray-800 block truncate">{p.nome}</span>
                {p.setor_codigo && (
                  <span className="text-xs text-gray-400">{p.setor_codigo}</span>
                )}
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Erro */}
      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 mb-4">
          {error}
        </div>
      )}

      {/* Botão gerar */}
      <button
        onClick={handleGenerate}
        disabled={generating}
        className="btn-primary w-full py-3 text-base font-semibold flex items-center justify-center gap-2"
      >
        {generating ? (
          <>
            <Loader2 size={18} className="animate-spin" /> Gerando relatório...
          </>
        ) : (
          <>
            <FileBarChart size={18} /> Gerar PDF
          </>
        )}
      </button>
    </div>
  )
}
