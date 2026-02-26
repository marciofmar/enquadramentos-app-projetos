'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Check, X, MessageSquare, Users, FileEdit, Save, ChevronDown, ChevronUp, ExternalLink, Settings, History, Building2, Plus, AlertTriangle, ArrowRight, Edit3, Trash2 } from 'lucide-react'
import { STATUS_CONFIG, BLOCO_LABELS } from '@/lib/utils'
import type { Profile } from '@/lib/types'

export default function AdminPage() {
  const [tab, setTab] = useState<'observacoes' | 'conteudo' | 'usuarios' | 'setores' | 'config' | 'log'>('observacoes')
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function check() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (!data || data.role !== 'admin') { router.push('/dashboard'); return }
      setProfile(data)
      setLoading(false)
    }
    check()
  }, [])

  if (loading) return <div className="flex justify-center py-20"><div className="animate-pulse text-sedec-500">Carregando...</div></div>

  const tabs = [
    { key: 'observacoes' as const, label: 'Observações', icon: MessageSquare },
    { key: 'conteudo' as const, label: 'Editar Conteúdo', icon: FileEdit },
    { key: 'usuarios' as const, label: 'Usuários', icon: Users },
    { key: 'setores' as const, label: 'Setores', icon: Building2 },
    { key: 'config' as const, label: 'Configurações', icon: Settings },
    { key: 'log' as const, label: 'Log de Alterações', icon: History },
  ]

  return (
    <div>
      <button onClick={() => router.push('/dashboard')} className="flex items-center gap-2 text-sm text-sedec-500 hover:text-sedec-700 mb-4">
        <ArrowLeft size={16} /> Voltar ao painel
      </button>

      <h1 className="text-2xl font-bold text-gray-800 mb-6">Administração</h1>

      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t.key ? 'bg-sedec-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}>
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'observacoes' && <ObservacoesAdmin />}
      {tab === 'conteudo' && <ConteudoAdmin />}
      {tab === 'usuarios' && <UsuariosAdmin />}
      {tab === 'setores' && <SetoresAdmin />}
      {tab === 'config' && <ConfiguracoesAdmin />}
      {tab === 'log' && <AuditLogAdmin />}
    </div>
  )
}

// ============================================================
// OBSERVAÇÕES
// ============================================================

function ObservacoesAdmin() {
  const [obs, setObs] = useState<any[]>([])
  const [statusFilter, setStatusFilter] = useState('em_analise')
  const [blocoFilter, setBlocoFilter] = useState('')
  const [resposta, setResposta] = useState<Record<number, string>>({})
  const [updating, setUpdating] = useState<number | null>(null)
  const supabase = createClient()

  useEffect(() => { loadObs() }, [statusFilter, blocoFilter])

  async function loadObs() {
    let q = supabase
      .from('observacoes')
      .select('*, acoes_estrategicas!inner(numero, nome)')
      .order('created_at', { ascending: false })

    if (statusFilter) q = q.eq('status', statusFilter)
    if (blocoFilter) q = q.eq('bloco', blocoFilter)
    const { data } = await q
    if (data) setObs(data)
  }

  async function updateStatus(id: number, status: string) {
    setUpdating(id)
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase.from('observacoes').update({
      status,
      resposta_admin: resposta[id] || null,
      respondido_por: user?.id,
      respondido_em: new Date().toISOString(),
    }).eq('id', id)

    if (error) {
      console.error('Erro ao atualizar observação:', error)
      alert(`Erro: ${error.message}`)
    }

    setUpdating(null)
    loadObs()
  }

  return (
    <div>
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-gray-500 font-medium">Status:</span>
          {(['em_analise', 'absorvida', 'indeferida', ''] as const).map(s => (
            <button key={s || 'all'} onClick={() => setStatusFilter(s)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${statusFilter === s
                ? 'bg-sedec-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              {s ? STATUS_CONFIG[s]?.label : 'Todas'}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-500 font-medium">Bloco:</span>
          <button onClick={() => setBlocoFilter('')}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${!blocoFilter
              ? 'bg-sedec-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            Todos
          </button>
          {Object.entries(BLOCO_LABELS).map(([key, label]) => (
            <button key={key} onClick={() => setBlocoFilter(key)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${blocoFilter === key
                ? 'bg-sedec-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              {label.length > 20 ? label.substring(0, 20) + '…' : label}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-gray-400 mb-3">{obs.length} observação(ões)</p>

      <div className="space-y-3">
        {obs.map(o => {
          const st = STATUS_CONFIG[o.status] || STATUS_CONFIG.em_analise
          return (
            <div key={o.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-sedec-600">AE {o.acoes_estrategicas.numero}</span>
                    <span className="text-xs bg-sedec-50 text-sedec-600 px-2 py-0.5 rounded-full font-medium">
                      {BLOCO_LABELS[o.bloco] || o.bloco}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{o.acoes_estrategicas.nome}</p>
                </div>
                <span className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${st.bg} ${st.color}`}>
                  {st.label}
                </span>
              </div>

              <div className="bg-gray-50 rounded-lg p-3 mb-3 text-sm text-gray-700">{o.conteudo}</div>

              <div className="flex items-center gap-2 text-xs text-gray-400 mb-3 flex-wrap">
                <span className="font-medium text-gray-500">{o.autor_nome}</span>
                {o.autor_setor && <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-500">{o.autor_setor}</span>}
                <span>•</span>
                <span>{new Date(o.created_at).toLocaleDateString('pt-BR')} às {new Date(o.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>

              {o.status === 'em_analise' && (
                <div className="border-t border-gray-100 pt-3">
                  <textarea value={resposta[o.id] || ''}
                    onChange={e => setResposta(prev => ({ ...prev, [o.id]: e.target.value }))}
                    placeholder="Resposta (opcional)..."
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg resize-none mb-2" rows={2} />
                  <div className="flex gap-2">
                    <button onClick={() => updateStatus(o.id, 'absorvida')} disabled={updating === o.id}
                      className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-lg font-medium hover:bg-green-200">
                      <Check size={14} /> Absorver
                    </button>
                    <button onClick={() => updateStatus(o.id, 'indeferida')} disabled={updating === o.id}
                      className="flex items-center gap-1 text-xs bg-red-100 text-red-700 px-3 py-1.5 rounded-lg font-medium hover:bg-red-200">
                      <X size={14} /> Indeferir
                    </button>
                  </div>
                </div>
              )}

              {o.resposta_admin && (
                <div className="mt-2 bg-blue-50 rounded-lg p-3 text-sm text-blue-700 italic">
                  <span className="font-medium">Resposta: </span>{o.resposta_admin}
                </div>
              )}
            </div>
          )
        })}
        {obs.length === 0 && <p className="text-center text-gray-400 py-8">Nenhuma observação encontrada.</p>}
      </div>
    </div>
  )
}

// ============================================================
// EDIÇÃO DE CONTEÚDO
// ============================================================

function ConteudoAdmin() {
  const [acoes, setAcoes] = useState<any[]>([])
  const [selectedAcao, setSelectedAcao] = useState<any>(null)
  const [editData, setEditData] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)
  const [expandedBlock, setExpandedBlock] = useState<string | null>(null)
  const [destaque, setDestaque] = useState<any>(null)
  const [destaqueLinhas, setDestaqueLinhas] = useState<any[]>([])
  const [panoramico, setPanoramico] = useState<any[]>([])
  const [fichas, setFichas] = useState<any[]>([])
  const [fundamentacao, setFundamentacao] = useState<any>(null)
  const [fundItens, setFundItens] = useState<any[]>([])
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    supabase.from('acoes_estrategicas').select('id, numero, nome').order('numero')
      .then(({ data }) => { if (data) setAcoes(data) })
  }, [])

  async function selectAcao(acao: any) {
    setSelectedAcao(acao)
    setExpandedBlock(null)
    setSaved(null)

    const { data: full } = await supabase.from('acoes_estrategicas').select('*').eq('id', acao.id).single()
    if (full) {
      setEditData({
        descricao_o_que: full.descricao_o_que || '',
        descricao_para_que: full.descricao_para_que || '',
        ancoragem: full.ancoragem || '',
        nota_arranjo_institucional: full.nota_arranjo_institucional || '',
      })
    }

    const { data: destData } = await supabase.from('destaques_estrategicos').select('*').eq('acao_estrategica_id', acao.id).single()
    setDestaque(destData)
    if (destData) {
      const { data: linhas } = await supabase.from('destaque_linhas').select('*').eq('destaque_id', destData.id).order('ordem')
      setDestaqueLinhas(linhas || [])
    } else { setDestaqueLinhas([]) }

    const { data: panData } = await supabase.from('panoramico_linhas').select('*').eq('acao_estrategica_id', acao.id).order('ordem')
    setPanoramico(panData || [])

    const { data: fichasData } = await supabase.from('fichas').select('*').eq('acao_estrategica_id', acao.id).order('ordem')
    setFichas(fichasData || [])

    const { data: fundData } = await supabase.from('fundamentacoes').select('*').eq('acao_estrategica_id', acao.id).single()
    setFundamentacao(fundData)
    if (fundData) {
      const { data: itens } = await supabase.from('fundamentacao_itens').select('*').eq('fundamentacao_id', fundData.id).order('ordem')
      setFundItens(itens || [])
    } else { setFundItens([]) }
  }

  async function saveField(field: string) {
    if (!selectedAcao) return
    setSaving(field)
    const { error } = await supabase.from('acoes_estrategicas').update({ [field]: editData[field] || null }).eq('id', selectedAcao.id)
    if (error) alert(`Erro: ${error.message}`)
    else { setSaved(field); setTimeout(() => setSaved(null), 2500) }
    setSaving(null)
  }

  async function saveDestaqueLinha(id: number) {
    const item = destaqueLinhas.find(x => x.id === id)
    if (!item) return
    const key = `dl-${id}`
    setSaving(key)
    const { error } = await supabase.from('destaque_linhas').update({ conteudo: item.conteudo }).eq('id', id)
    if (error) alert(`Erro: ${error.message}`)
    else { setSaved(key); setTimeout(() => setSaved(null), 2500) }
    setSaving(null)
  }

  async function savePanoramicoLinha(id: number) {
    const item = panoramico.find(x => x.id === id)
    if (!item) return
    const key = `pan-${id}`
    setSaving(key)
    const { error } = await supabase.from('panoramico_linhas').update({
      sintese_contribuicao: item.sintese_contribuicao,
      nao_faz: item.nao_faz,
    }).eq('id', id)
    if (error) alert(`Erro: ${error.message}`)
    else { setSaved(key); setTimeout(() => setSaved(null), 2500) }
    setSaving(null)
  }

  async function saveFichaField(fichaId: number, field: string) {
    const item = fichas.find(x => x.id === fichaId)
    if (!item) return
    const key = `f-${fichaId}-${field}`
    setSaving(key)
    const { error } = await supabase.from('fichas').update({ [field]: item[field] }).eq('id', fichaId)
    if (error) alert(`Erro: ${error.message}`)
    else { setSaved(key); setTimeout(() => setSaved(null), 2500) }
    setSaving(null)
  }

  async function saveFund(field: string) {
    if (!fundamentacao) return
    const key = `fund-${field}`
    setSaving(key)
    const { error } = await supabase.from('fundamentacoes').update({ [field]: fundamentacao[field] }).eq('id', fundamentacao.id)
    if (error) alert(`Erro: ${error.message}`)
    else { setSaved(key); setTimeout(() => setSaved(null), 2500) }
    setSaving(null)
  }

  async function saveFundItem(id: number) {
    const item = fundItens.find(x => x.id === id)
    if (!item) return
    const key = `fi-${id}`
    setSaving(key)
    const { error } = await supabase.from('fundamentacao_itens').update({ conteudo: item.conteudo }).eq('id', id)
    if (error) alert(`Erro: ${error.message}`)
    else { setSaved(key); setTimeout(() => setSaved(null), 2500) }
    setSaving(null)
  }

  function SaveBtn({ id, onClick }: { id: string; onClick: () => void }) {
    const isSaving = saving === id
    const isSaved = saved === id
    return (
      <button onClick={onClick} disabled={isSaving}
        className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
          isSaved ? 'bg-green-100 text-green-700' : 'bg-sedec-600 text-white hover:bg-sedec-700'
        } disabled:opacity-50`}>
        {isSaving ? '...' : isSaved ? <><Check size={12} /> Salvo!</> : <><Save size={12} /> Salvar</>}
      </button>
    )
  }

  function toggleBlock(k: string) { setExpandedBlock(expandedBlock === k ? null : k) }

  function BlockHeader({ id, label, count }: { id: string; label: string; count?: number }) {
    return (
      <button onClick={() => toggleBlock(id)}
        className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
        <span className="font-semibold text-gray-700 text-sm">
          {label} {count !== undefined && <span className="text-gray-400 font-normal">({count})</span>}
        </span>
        {expandedBlock === id ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
      </button>
    )
  }

  function arrayToText(arr: string[]) { return (arr || []).join('\n') }
  function textToArray(text: string) { return text.split('\n').filter(l => l.trim()) }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-1">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden sticky top-24">
          <div className="p-3 bg-gray-50 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700">Ações Estratégicas</h3>
          </div>
          <div className="max-h-[70vh] overflow-y-auto divide-y divide-gray-100">
            {acoes.map(a => (
              <button key={a.id} onClick={() => selectAcao(a)}
                className={`w-full text-left px-3 py-2.5 text-xs hover:bg-gray-50 ${
                  selectedAcao?.id === a.id ? 'bg-sedec-50 border-l-4 border-sedec-500' : ''
                }`}>
                <span className="font-bold text-sedec-600">AE {a.numero}</span>
                <p className="text-gray-500 line-clamp-1 mt-0.5">{a.nome}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="lg:col-span-3">
        {!selectedAcao ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
            Selecione uma ação na lista para editar.
          </div>
        ) : (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-sedec-600">AE {selectedAcao.numero}</h2>
                <p className="text-sm text-gray-500">{selectedAcao.nome}</p>
              </div>
              <button onClick={() => router.push(`/dashboard/acao/${selectedAcao.numero}`)}
                className="flex items-center gap-1 text-xs text-sedec-500 hover:text-sedec-700">
                <ExternalLink size={14} /> Ver página
              </button>
            </div>

            {/* Descrição */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <BlockHeader id="descricao" label="Descrição da Ação" />
              {expandedBlock === 'descricao' && (
                <div className="p-4 space-y-4 border-t border-gray-100">
                  <div>
                    <label className="text-xs font-bold text-blue-600 block mb-1">O QUÊ</label>
                    <textarea value={editData.descricao_o_que} onChange={e => setEditData(p => ({ ...p, descricao_o_que: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg resize-y" rows={4} />
                    <div className="mt-2"><SaveBtn id="descricao_o_que" onClick={() => saveField('descricao_o_que')} /></div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-green-600 block mb-1">PARA QUÊ</label>
                    <textarea value={editData.descricao_para_que} onChange={e => setEditData(p => ({ ...p, descricao_para_que: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg resize-y" rows={4} />
                    <div className="mt-2"><SaveBtn id="descricao_para_que" onClick={() => saveField('descricao_para_que')} /></div>
                  </div>
                </div>
              )}
            </div>

            {/* Ancoragem */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <BlockHeader id="ancoragem" label="Ancoragem Estratégica" />
              {expandedBlock === 'ancoragem' && (
                <div className="p-4 border-t border-gray-100">
                  <textarea value={editData.ancoragem} onChange={e => setEditData(p => ({ ...p, ancoragem: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg resize-y" rows={10} />
                  <div className="mt-2"><SaveBtn id="ancoragem" onClick={() => saveField('ancoragem')} /></div>
                </div>
              )}
            </div>

            {/* Destaque */}
            {destaque && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <BlockHeader id="destaque" label="Destaque Estratégico" count={destaqueLinhas.length} />
                {expandedBlock === 'destaque' && (
                  <div className="p-4 space-y-3 border-t border-gray-100">
                    {destaqueLinhas.map(l => (
                      <div key={l.id} className="border border-gray-200 rounded-lg p-3">
                        <label className="text-xs font-bold text-sedec-600 block mb-1">{l.label || '(header)'}</label>
                        <textarea value={l.conteudo || ''} onChange={e => setDestaqueLinhas(prev => prev.map(x => x.id === l.id ? { ...x, conteudo: e.target.value } : x))}
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg resize-y" rows={3} />
                        <div className="mt-2"><SaveBtn id={`dl-${l.id}`} onClick={() => saveDestaqueLinha(l.id)} /></div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Panorâmico */}
            {panoramico.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <BlockHeader id="panoramico" label="Quadro Panorâmico" count={panoramico.length} />
                {expandedBlock === 'panoramico' && (
                  <div className="p-4 space-y-3 border-t border-gray-100">
                    {panoramico.map(p => (
                      <div key={p.id} className="border border-gray-200 rounded-lg p-3">
                        <span className="text-xs font-bold text-sedec-600">{p.setor_display} — {p.papel}</span>
                        <div className="mt-2 space-y-2">
                          <div>
                            <label className="text-xs text-gray-500">Síntese da Contribuição</label>
                            <textarea value={p.sintese_contribuicao || ''} onChange={e => setPanoramico(prev => prev.map(x => x.id === p.id ? { ...x, sintese_contribuicao: e.target.value } : x))}
                              className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 rounded-lg resize-y" rows={2} />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500">NÃO faz</label>
                            <textarea value={p.nao_faz || ''} onChange={e => setPanoramico(prev => prev.map(x => x.id === p.id ? { ...x, nao_faz: e.target.value } : x))}
                              className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 rounded-lg resize-y" rows={2} />
                          </div>
                          <SaveBtn id={`pan-${p.id}`} onClick={() => savePanoramicoLinha(p.id)} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Fichas */}
            {fichas.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <BlockHeader id="fichas" label="Fichas Detalhadas" count={fichas.length} />
                {expandedBlock === 'fichas' && (
                  <div className="p-4 space-y-3 border-t border-gray-100">
                    {fichas.map(f => (
                      <FichaEditor key={f.id} ficha={f} saving={saving} saved={saved}
                        onChange={(field, val) => setFichas(prev => prev.map(x => x.id === f.id ? { ...x, [field]: val } : x))}
                        onSave={(field) => saveFichaField(f.id, field)}
                        SaveBtn={SaveBtn} arrayToText={arrayToText} textToArray={textToArray} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Fundamentação */}
            {fundamentacao && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <BlockHeader id="fundamentacao" label="Fundamentação" count={fundItens.length} />
                {expandedBlock === 'fundamentacao' && (
                  <div className="p-4 space-y-3 border-t border-gray-100">
                    <div>
                      <label className="text-xs font-medium text-gray-500">Introdução</label>
                      <textarea value={fundamentacao.introducao || ''} onChange={e => setFundamentacao((p: any) => ({ ...p, introducao: e.target.value }))}
                        className="w-full mt-1 px-3 py-2 text-sm border border-gray-300 rounded-lg resize-y" rows={3} />
                      <div className="mt-2"><SaveBtn id="fund-introducao" onClick={() => saveFund('introducao')} /></div>
                    </div>
                    {fundItens.map(item => (
                      <div key={item.id} className="border border-gray-200 rounded-lg p-3">
                        <label className="text-xs font-medium text-gray-500">Item {item.ordem}</label>
                        <textarea value={item.conteudo} onChange={e => setFundItens(prev => prev.map(x => x.id === item.id ? { ...x, conteudo: e.target.value } : x))}
                          className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 rounded-lg resize-y" rows={3} />
                        <div className="mt-2"><SaveBtn id={`fi-${item.id}`} onClick={() => saveFundItem(item.id)} /></div>
                      </div>
                    ))}
                    <div>
                      <label className="text-xs font-medium text-gray-500">Conclusão</label>
                      <textarea value={fundamentacao.conclusao || ''} onChange={e => setFundamentacao((p: any) => ({ ...p, conclusao: e.target.value }))}
                        className="w-full mt-1 px-3 py-2 text-sm border border-gray-300 rounded-lg resize-y" rows={3} />
                      <div className="mt-2"><SaveBtn id="fund-conclusao" onClick={() => saveFund('conclusao')} /></div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Nota */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <BlockHeader id="nota" label="Nota sobre Arranjo Institucional" />
              {expandedBlock === 'nota' && (
                <div className="p-4 border-t border-gray-100">
                  <textarea value={editData.nota_arranjo_institucional} onChange={e => setEditData(p => ({ ...p, nota_arranjo_institucional: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg resize-y" rows={6} />
                  <div className="mt-2 flex items-center gap-3">
                    <SaveBtn id="nota_arranjo_institucional" onClick={() => saveField('nota_arranjo_institucional')} />
                    <span className="text-xs text-gray-400">Deixe vazio se esta ação não possui nota.</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================
// EDITOR DE FICHA
// ============================================================

function FichaEditor({ ficha, saving, saved, onChange, onSave, SaveBtn, arrayToText, textToArray }: {
  ficha: any; saving: string | null; saved: string | null
  onChange: (field: string, value: any) => void
  onSave: (field: string) => void
  SaveBtn: any; arrayToText: (a: string[]) => string; textToArray: (t: string) => string[]
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button onClick={() => setOpen(!open)}
        className="w-full bg-sedec-50 px-4 py-3 flex items-center justify-between text-sm font-medium text-sedec-700 hover:bg-sedec-100">
        <span className="text-left">{ficha.titulo}</span>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {open && (
        <div className="p-4 space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-500">Justificativa</label>
            <textarea value={ficha.justificativa || ''} onChange={e => onChange('justificativa', e.target.value)}
              className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 rounded-lg resize-y" rows={4} />
            <div className="mt-1"><SaveBtn id={`f-${ficha.id}-justificativa`} onClick={() => onSave('justificativa')} /></div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500">Contribuição esperada <span className="text-gray-400">(um item por linha)</span></label>
            <textarea value={arrayToText(ficha.contribuicao_esperada)} onChange={e => onChange('contribuicao_esperada', textToArray(e.target.value))}
              className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 rounded-lg resize-y font-mono" rows={4} />
            <div className="mt-1"><SaveBtn id={`f-${ficha.id}-contribuicao_esperada`} onClick={() => onSave('contribuicao_esperada')} /></div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500">NÃO-ESCOPO <span className="text-gray-400">(um item por linha)</span></label>
            <textarea value={arrayToText(ficha.nao_escopo)} onChange={e => onChange('nao_escopo', textToArray(e.target.value))}
              className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 rounded-lg resize-y font-mono" rows={3} />
            <div className="mt-1"><SaveBtn id={`f-${ficha.id}-nao_escopo`} onClick={() => onSave('nao_escopo')} /></div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500">Dependências críticas <span className="text-gray-400">(um item por linha)</span></label>
            <textarea value={arrayToText(ficha.dependencias_criticas)} onChange={e => onChange('dependencias_criticas', textToArray(e.target.value))}
              className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 rounded-lg resize-y font-mono" rows={3} />
            <div className="mt-1"><SaveBtn id={`f-${ficha.id}-dependencias_criticas`} onClick={() => onSave('dependencias_criticas')} /></div>
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================
// USUÁRIOS
// ============================================================

function UsuariosAdmin() {
  const [users, setUsers] = useState<any[]>([])
  const [setores, setSetores] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    supabase.from('profiles').select('*, setores:setor_id(codigo, nome_completo)').order('nome')
      .then(({ data }) => { if (data) setUsers(data) })
    supabase.from('setores').select('id, codigo, nome_completo').order('codigo')
      .then(({ data }) => { if (data) setSetores(data) })
  }, [])

  async function updateRole(userId: string, newRole: string) {
    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId)
    if (error) { alert(`Erro: ${error.message}`); return }
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u))
  }

  async function updateSetor(userId: string, setorId: number | null) {
    const { error } = await supabase.from('profiles').update({ setor_id: setorId }).eq('id', userId)
    if (error) { alert(`Erro: ${error.message}`); return }
    const { data } = await supabase.from('profiles').select('*, setores:setor_id(codigo, nome_completo)').order('nome')
    if (data) setUsers(data)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="px-4 py-3 text-left font-medium text-gray-600">Nome</th>
            <th className="px-4 py-3 text-left font-medium text-gray-600">Email</th>
            <th className="px-4 py-3 text-left font-medium text-gray-600">Setor</th>
            <th className="px-4 py-3 text-left font-medium text-gray-600">Perfil</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {users.map(u => (
            <tr key={u.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-medium text-gray-800">{u.nome}</td>
              <td className="px-4 py-3 text-gray-500">{u.email}</td>
              <td className="px-4 py-3">
                <select value={u.setor_id || ''} onChange={e => updateSetor(u.id, e.target.value ? Number(e.target.value) : null)}
                  className="text-xs border border-gray-200 rounded px-2 py-1">
                  <option value="">Sem setor</option>
                  {setores.map(s => <option key={s.id} value={s.id}>{s.codigo}</option>)}
                </select>
              </td>
              <td className="px-4 py-3">
                <select value={u.role} onChange={e => updateRole(u.id, e.target.value)}
                  className={`text-xs font-medium rounded px-2 py-1 border ${
                    u.role === 'admin' ? 'bg-purple-50 border-purple-200 text-purple-700' :
                    u.role === 'gestor' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                    'bg-gray-50 border-gray-200 text-gray-600'
                  }`}>
                  <option value="usuario">Usuário</option>
                  <option value="gestor">Gestor</option>
                  <option value="admin">Admin</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ============================================================
// CONFIGURAÇÕES
// ============================================================

function ConfiguracoesAdmin() {
  const [configs, setConfigs] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.from('configuracoes').select('chave, valor')
      .then(({ data }) => {
        if (data) {
          const map: Record<string, string> = {}
          data.forEach((c: any) => { map[c.chave] = c.valor })
          setConfigs(map)
        }
      })
  }, [])

  async function toggle(chave: string) {
    const novoValor = configs[chave] === 'true' ? 'false' : 'true'
    setSaving(chave)

    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('configuracoes').update({
      valor: novoValor,
      atualizado_por: user?.id,
    }).eq('chave', chave)

    if (error) {
      alert(`Erro: ${error.message}`)
    } else {
      setConfigs(prev => ({ ...prev, [chave]: novoValor }))
      setSaved(chave)
      setTimeout(() => setSaved(null), 2000)
    }
    setSaving(null)
  }

  const items = [
    {
      grupo: 'Observações',
      toggles: [
        {
          chave: 'obs_permitir_criacao',
          titulo: 'Permitir criação de observações',
          descricao: 'Quando desligado, usuários não conseguem submeter novas observações em nenhuma ação. Observações existentes permanecem visíveis conforme a configuração abaixo.',
          ligado: 'Usuários podem criar observações',
          desligado: 'Criação de observações bloqueada',
        },
        {
          chave: 'obs_exibir_para_usuarios',
          titulo: 'Exibir observações na visualização',
          descricao: 'Quando desligado, as observações não aparecem na tela de detalhe da ação para usuários comuns. Admins continuam vendo tudo na área administrativa.',
          ligado: 'Observações visíveis para todos',
          desligado: 'Observações ocultas para usuários',
        },
      ],
    },
    {
      grupo: 'Módulo de Projetos',
      toggles: [
        {
          chave: 'proj_permitir_cadastro',
          titulo: 'Permitir cadastro de projetos/entregas/atividades',
          descricao: 'Quando desligado, apenas administradores podem criar novos projetos, entregas e atividades. Gestores ficam somente com visualização.',
          ligado: 'Gestores podem cadastrar',
          desligado: 'Só admin pode cadastrar',
        },
        {
          chave: 'proj_permitir_edicao',
          titulo: 'Permitir edição/exclusão de projetos/entregas/atividades',
          descricao: 'Quando desligado, apenas administradores podem editar ou excluir elementos. Gestores ficam somente com visualização.',
          ligado: 'Gestores podem editar/excluir',
          desligado: 'Só admin pode editar/excluir',
        },
        {
          chave: 'proj_permitir_edicao_datas',
          titulo: 'Permitir edição de datas das entregas',
          descricao: 'Quando desligado, as datas (quinzenas) das entregas ficam travadas para gestores, mesmo que a edição geral esteja habilitada. Admins sempre podem alterar datas.',
          ligado: 'Gestores podem alterar datas',
          desligado: 'Datas travadas para gestores',
        },
      ],
    },
  ]

  return (
    <div className="max-w-2xl">
      {items.map(group => (
        <div key={group.grupo} className="mb-8">
          <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-3">{group.grupo}</h3>
          <div className="space-y-4">
            {group.toggles.map(item => {
              const ativo = configs[item.chave] === 'true'
              const isSaving = saving === item.chave
              const isSaved = saved === item.chave

              return (
                <div key={item.chave} className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-gray-800">{item.titulo}</h3>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">{item.descricao}</p>
                      <div className="mt-2">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
                          ativo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          <span className={`w-2 h-2 rounded-full ${ativo ? 'bg-green-500' : 'bg-red-500'}`} />
                          {ativo ? item.ligado : item.desligado}
                        </span>
                        {isSaved && <span className="text-xs text-green-600 ml-2">Salvo!</span>}
                      </div>
                    </div>

                    <button
                      onClick={() => toggle(item.chave)}
                      disabled={isSaving}
                      className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out disabled:opacity-50 ${
                        ativo ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                      role="switch"
                      aria-checked={ativo}
                    >
                      <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        ativo ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-xs text-amber-700 leading-relaxed">
          <span className="font-semibold">Nota:</span> Estas configurações têm efeito imediato. 
          Usuários que estiverem com a página aberta verão a mudança ao navegar para outra página ou recarregar.
        </p>
      </div>
    </div>
  )
}

// ============================================================
// GESTÃO DE SETORES
// ============================================================

interface SetorRow {
  id: number
  codigo: string
  nome_completo: string
  created_at: string
  _deps?: { profiles: number; projetos: number; entrega_participantes: number; atividade_participantes: number; panoramico_setores: number; ficha_setores: number; total: number }
}

function SetoresAdmin() {
  const [setores, setSetores] = useState<SetorRow[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Formulário de criação/edição
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formCodigo, setFormCodigo] = useState('')
  const [formNome, setFormNome] = useState('')

  // Modal de exclusão
  const [deleteTarget, setDeleteTarget] = useState<SetorRow | null>(null)
  const [transferToId, setTransferToId] = useState<string>('')
  const [checkingDeps, setCheckingDeps] = useState(false)

  const supabase = createClient()

  useEffect(() => { loadSetores() }, [])

  async function loadSetores() {
    setLoading(true)
    const { data } = await supabase.from('setores').select('*').order('codigo')
    if (data) {
      // Carrega dependências para cada setor
      const withDeps = await Promise.all(data.map(async (s: any) => {
        const { data: deps } = await supabase.rpc('check_setor_dependencies', { p_setor_id: s.id })
        return { ...s, _deps: deps }
      }))
      setSetores(withDeps)
    }
    setLoading(false)
  }

  function startCreate() {
    setEditingId(null)
    setFormCodigo('')
    setFormNome('')
    setShowForm(true)
  }

  function startEdit(s: SetorRow) {
    setEditingId(s.id)
    setFormCodigo(s.codigo)
    setFormNome(s.nome_completo)
    setShowForm(true)
  }

  function cancelForm() {
    setShowForm(false)
    setEditingId(null)
    setFormCodigo('')
    setFormNome('')
  }

  async function saveSetor() {
    if (!formCodigo.trim() || !formNome.trim()) {
      alert('Código e nome são obrigatórios.')
      return
    }

    setSaving(true)

    if (editingId) {
      // Edição
      const { error } = await supabase.from('setores')
        .update({ codigo: formCodigo.trim().toUpperCase(), nome_completo: formNome.trim() })
        .eq('id', editingId)

      if (error) {
        alert(`Erro ao salvar: ${error.message}`)
        setSaving(false)
        return
      }
    } else {
      // Criação
      const { error } = await supabase.from('setores')
        .insert({ codigo: formCodigo.trim().toUpperCase(), nome_completo: formNome.trim() })

      if (error) {
        if (error.message.includes('unique') || error.message.includes('duplicate')) {
          alert('Já existe um setor com esse código.')
        } else {
          alert(`Erro ao criar: ${error.message}`)
        }
        setSaving(false)
        return
      }
    }

    setSaving(false)
    cancelForm()
    loadSetores()
  }

  async function startDelete(s: SetorRow) {
    setDeleteTarget(s)
    setTransferToId('')
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    const deps = deleteTarget._deps

    if (deps && deps.total > 0 && !transferToId) {
      alert('Este setor possui dependências. Selecione um setor de destino para transferi-las.')
      return
    }

    setSaving(true)

    const { data, error } = await supabase.rpc('admin_delete_setor', {
      p_setor_id: deleteTarget.id,
      p_transfer_to_id: deps && deps.total > 0 ? parseInt(transferToId) : null
    })

    if (error) {
      alert(`Erro ao excluir: ${error.message}`)
      setSaving(false)
      return
    }

    if (data && !data.success) {
      alert('Não foi possível excluir. Verifique as dependências.')
      setSaving(false)
      return
    }

    setSaving(false)
    setDeleteTarget(null)
    loadSetores()
  }

  const depLabels: Record<string, string> = {
    profiles: 'Usuários vinculados',
    projetos: 'Projetos como líder',
    entrega_participantes: 'Participações em entregas',
    atividade_participantes: 'Participações em atividades',
    panoramico_setores: 'Quadros panorâmicos',
    ficha_setores: 'Fichas de enquadramento',
  }

  if (loading) return <div className="animate-pulse text-sedec-500 py-8 text-center">Carregando setores...</div>

  return (
    <div className="max-w-4xl">
      {/* Header + botão novo */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">{setores.length} setor(es) cadastrado(s)</p>
        <button onClick={startCreate}
          className="flex items-center gap-1.5 text-sm bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-lg font-medium transition-colors">
          <Plus size={16} /> Novo setor
        </button>
      </div>

      {/* Formulário de criação/edição */}
      {showForm && (
        <div className="bg-blue-50 border border-blue-300 rounded-xl p-4 mb-4 space-y-3">
          <h3 className="text-sm font-bold text-gray-700">
            {editingId ? 'Editar setor' : 'Novo setor'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">Código (sigla)</label>
              <input type="text" value={formCodigo}
                onChange={e => setFormCodigo(e.target.value.toUpperCase())}
                placeholder="Ex: ICTDEC"
                className="input-field text-sm uppercase" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-gray-500 block mb-1">Nome completo</label>
              <input type="text" value={formNome}
                onChange={e => setFormNome(e.target.value)}
                placeholder="Ex: Instituto Científico e Tecnológico de Defesa Civil"
                className="input-field text-sm" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={saveSetor} disabled={saving}
              className="flex items-center gap-1 text-xs bg-green-500 text-white px-3 py-1.5 rounded-lg font-medium disabled:opacity-50">
              <Save size={13} /> {saving ? 'Salvando...' : 'Salvar'}
            </button>
            <button onClick={cancelForm}
              className="flex items-center gap-1 text-xs text-gray-500 px-3 py-1.5">
              <X size={13} /> Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Lista de setores */}
      <div className="space-y-2">
        {setores.map(s => {
          const deps = s._deps
          const hasDeps = deps && deps.total > 0
          return (
            <div key={s.id} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-sedec-600">{s.codigo}</span>
                    <span className="text-sm text-gray-700">{s.nome_completo}</span>
                  </div>
                  {/* Dependências */}
                  {hasDeps && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {Object.entries(depLabels).map(([key, label]) => {
                        const count = (deps as any)[key]
                        if (!count || count === 0) return null
                        return (
                          <span key={key} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                            {label}: <span className="font-bold">{count}</span>
                          </span>
                        )
                      })}
                    </div>
                  )}
                  {!hasDeps && (
                    <span className="text-[10px] text-gray-400 mt-1 block">Sem dependências — pode ser excluído livremente</span>
                  )}
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <button onClick={() => startEdit(s)} className="text-gray-400 hover:text-orange-500 p-1" title="Editar">
                    <Edit3 size={15} />
                  </button>
                  <button onClick={() => startDelete(s)} className="text-gray-400 hover:text-red-500 p-1" title="Excluir">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal de exclusão */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl">
            <div className="flex items-center gap-2 text-red-600 mb-4">
              <AlertTriangle size={20} />
              <h3 className="text-lg font-bold">Excluir setor</h3>
            </div>

            <p className="text-sm text-gray-700 mb-2">
              Você está prestes a excluir o setor <span className="font-bold">{deleteTarget.codigo}</span> ({deleteTarget.nome_completo}).
            </p>

            {deleteTarget._deps && deleteTarget._deps.total > 0 ? (
              <div className="space-y-3">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-xs font-bold text-amber-700 mb-2 flex items-center gap-1">
                    <AlertTriangle size={13} /> Este setor possui {deleteTarget._deps.total} dependência(s):
                  </p>
                  <div className="space-y-1">
                    {Object.entries(depLabels).map(([key, label]) => {
                      const count = (deleteTarget._deps as any)?.[key]
                      if (!count || count === 0) return null
                      return (
                        <div key={key} className="text-xs text-amber-800 flex justify-between">
                          <span>{label}</span>
                          <span className="font-bold">{count}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Transferir todas as dependências para:
                  </label>
                  <select value={transferToId} onChange={e => setTransferToId(e.target.value)}
                    className="input-field text-sm">
                    <option value="">— Selecione o setor de destino —</option>
                    {setores.filter(s => s.id !== deleteTarget.id).map(s => (
                      <option key={s.id} value={s.id}>{s.codigo} — {s.nome_completo}</option>
                    ))}
                  </select>
                  <p className="text-[10px] text-gray-400 mt-1">
                    Todos os usuários, projetos e participações serão transferidos para o setor selecionado antes da exclusão.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-xs text-green-700">
                  Este setor não possui dependências e pode ser excluído com segurança.
                </p>
              </div>
            )}

            <div className="flex gap-2 mt-4 justify-end">
              <button onClick={() => setDeleteTarget(null)}
                className="text-sm text-gray-500 px-4 py-2">
                Cancelar
              </button>
              <button onClick={confirmDelete} disabled={saving || (deleteTarget._deps?.total! > 0 && !transferToId)}
                className="flex items-center gap-1 text-sm bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50">
                <Trash2 size={14} /> {saving ? 'Excluindo...' : 'Confirmar exclusão'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Nota informativa */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-6">
        <p className="text-xs text-blue-700 leading-relaxed">
          <span className="font-semibold">Sobre a exclusão:</span> Setores com dependências (usuários, projetos, participações)
          não podem ser excluídos diretamente. É necessário transferir todas as dependências para outro setor antes da exclusão.
          Campos de texto em registros históricos (como o nome do setor em observações) permanecem inalterados.
        </p>
      </div>
    </div>
  )
}

// ============================================================
// LOG DE ALTERAÇÕES (AUDITORIA)
// ============================================================

function AuditLogAdmin() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filterEntidade, setFilterEntidade] = useState('')
  const [filterTipo, setFilterTipo] = useState('')
  const [page, setPage] = useState(0)
  const PAGE_SIZE = 30
  const supabase = createClient()

  useEffect(() => { loadLogs() }, [filterEntidade, filterTipo, page])

  async function loadLogs() {
    setLoading(true)
    let query = supabase.from('audit_log').select('*')
      .order('created_at', { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

    if (filterEntidade) query = query.eq('entidade', filterEntidade)
    if (filterTipo) query = query.eq('tipo_acao', filterTipo)

    const { data } = await query
    if (data) setLogs(data)
    setLoading(false)
  }

  const TIPO_LABELS: Record<string, { label: string; color: string }> = {
    create: { label: 'Criação', color: 'bg-green-100 text-green-700' },
    update: { label: 'Edição', color: 'bg-blue-100 text-blue-700' },
    delete: { label: 'Exclusão', color: 'bg-red-100 text-red-700' },
  }

  const ENTIDADE_LABELS: Record<string, string> = {
    projeto: 'Projeto',
    entrega: 'Entrega',
    atividade: 'Atividade',
    entrega_participante: 'Partic. Entrega',
    atividade_participante: 'Partic. Atividade',
  }

  function formatDate(iso: string) {
    const d = new Date(iso)
    return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }

  function renderJson(obj: any) {
    if (!obj) return <span className="text-gray-300">—</span>
    const entries = Object.entries(obj).slice(0, 5)
    return (
      <div className="text-[10px] text-gray-500 space-y-0.5">
        {entries.map(([k, v]) => (
          <div key={k}><span className="font-medium text-gray-600">{k}:</span> {String(v).substring(0, 80)}{String(v).length > 80 ? '...' : ''}</div>
        ))}
        {Object.entries(obj).length > 5 && <div className="text-gray-400">+{Object.entries(obj).length - 5} campos</div>}
      </div>
    )
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <select value={filterEntidade} onChange={e => { setFilterEntidade(e.target.value); setPage(0) }} className="input-field text-xs w-40">
          <option value="">Todas as entidades</option>
          {Object.entries(ENTIDADE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={filterTipo} onChange={e => { setFilterTipo(e.target.value); setPage(0) }} className="input-field text-xs w-36">
          <option value="">Todos os tipos</option>
          {Object.entries(TIPO_LABELS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-400 text-sm">Carregando...</div>
      ) : logs.length === 0 ? (
        <div className="text-center py-8 text-gray-400 text-sm">Nenhum registro encontrado.</div>
      ) : (
        <>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-3 py-2 font-medium text-gray-500">Data</th>
                  <th className="text-left px-3 py-2 font-medium text-gray-500">Usuário</th>
                  <th className="text-left px-3 py-2 font-medium text-gray-500">Ação</th>
                  <th className="text-left px-3 py-2 font-medium text-gray-500">Entidade</th>
                  <th className="text-left px-3 py-2 font-medium text-gray-500">ID</th>
                  <th className="text-left px-3 py-2 font-medium text-gray-500">Anterior</th>
                  <th className="text-left px-3 py-2 font-medium text-gray-500">Novo</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => {
                  const tipo = TIPO_LABELS[log.tipo_acao] || { label: log.tipo_acao, color: 'bg-gray-100 text-gray-600' }
                  return (
                    <tr key={log.id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="px-3 py-2 text-gray-500 whitespace-nowrap">{formatDate(log.created_at)}</td>
                      <td className="px-3 py-2 text-gray-700 font-medium">{log.usuario_nome || '—'}</td>
                      <td className="px-3 py-2">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${tipo.color}`}>{tipo.label}</span>
                      </td>
                      <td className="px-3 py-2 text-gray-600">{ENTIDADE_LABELS[log.entidade] || log.entidade}</td>
                      <td className="px-3 py-2 text-gray-400">#{log.entidade_id}</td>
                      <td className="px-3 py-2 max-w-48">{renderJson(log.conteudo_anterior)}</td>
                      <td className="px-3 py-2 max-w-48">{renderJson(log.conteudo_novo)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-3">
            <button disabled={page === 0} onClick={() => setPage(p => p - 1)}
              className="text-xs text-sedec-500 hover:text-sedec-700 disabled:opacity-30 disabled:cursor-not-allowed">
              ← Anterior
            </button>
            <span className="text-xs text-gray-400">Página {page + 1}</span>
            <button disabled={logs.length < PAGE_SIZE} onClick={() => setPage(p => p + 1)}
              className="text-xs text-sedec-500 hover:text-sedec-700 disabled:opacity-30 disabled:cursor-not-allowed">
              Próxima →
            </button>
          </div>
        </>
      )}
    </div>
  )
}
