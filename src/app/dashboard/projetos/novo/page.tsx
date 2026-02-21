'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Trash2, Save, PackagePlus, ListPlus, Info } from 'lucide-react'
import type { Profile } from '@/lib/types'

interface Participante { setor_id: number | null; tipo_participante: string; papel: string }
interface Atividade { nome: string; descricao: string; data_prevista: string; participantes: Participante[] }
interface Entrega {
  nome: string; descricao: string; dependencias_criticas: string
  quinzena: string; participantes: Participante[]; atividades: Atividade[]
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

export default function NovoProjetoPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [setores, setSetores] = useState<{ id: number; codigo: string; nome_completo: string }[]>([])
  const [acoes, setAcoes] = useState<{ id: number; numero: string; nome: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Form state
  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [problemaResolve, setProblemaResolve] = useState('')
  const [setorLiderId, setSetorLiderId] = useState<number | ''>('')
  const [acoesSelecionadas, setAcoesSelecionadas] = useState<number[]>([])
  const [entregas, setEntregas] = useState<Entrega[]>([])

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (p) {
        setProfile(p as any)
        if (p.role === 'gestor' && p.setor_id) setSetorLiderId(p.setor_id)
      }

      const { data: s } = await supabase.from('setores').select('id, codigo, nome_completo').order('codigo')
      if (s) setSetores(s)

      const { data: a } = await supabase.from('acoes_estrategicas').select('id, numero, nome').order('numero')
      if (a) setAcoes(a)

      setLoading(false)
    }
    load()
  }, [])

  function addEntrega() {
    setEntregas([...entregas, {
      nome: '', descricao: '', dependencias_criticas: '', quinzena: '',
      participantes: [{ setor_id: null, tipo_participante: 'setor', papel: '' }],
      atividades: []
    }])
  }

  function updateEntrega(idx: number, field: string, value: any) {
    setEntregas(prev => prev.map((e, i) => i === idx ? { ...e, [field]: value } : e))
  }

  function removeEntrega(idx: number) {
    if (!confirm('Remover esta entrega e todas as suas atividades?')) return
    setEntregas(prev => prev.filter((_, i) => i !== idx))
  }

  function addParticipanteEntrega(entregaIdx: number) {
    setEntregas(prev => prev.map((e, i) =>
      i === entregaIdx ? { ...e, participantes: [...e.participantes, { setor_id: null, tipo_participante: 'setor', papel: '' }] } : e))
  }

  function updateParticipanteEntrega(eIdx: number, pIdx: number, field: string, value: any) {
    setEntregas(prev => prev.map((e, i) => i === eIdx ? {
      ...e, participantes: e.participantes.map((p, j) => j === pIdx ? { ...p, [field]: value } : p)
    } : e))
  }

  function removeParticipanteEntrega(eIdx: number, pIdx: number) {
    setEntregas(prev => prev.map((e, i) => i === eIdx ? {
      ...e, participantes: e.participantes.filter((_, j) => j !== pIdx)
    } : e))
  }

  function addAtividade(entregaIdx: number) {
    setEntregas(prev => prev.map((e, i) => i === entregaIdx ? {
      ...e, atividades: [...e.atividades, { nome: '', descricao: '', data_prevista: '', participantes: [] }]
    } : e))
  }

  function updateAtividade(eIdx: number, aIdx: number, field: string, value: any) {
    setEntregas(prev => prev.map((e, i) => i === eIdx ? {
      ...e, atividades: e.atividades.map((a, j) => j === aIdx ? { ...a, [field]: value } : a)
    } : e))
  }

  function removeAtividade(eIdx: number, aIdx: number) {
    if (!confirm('Remover esta atividade?')) return
    setEntregas(prev => prev.map((e, i) => i === eIdx ? {
      ...e, atividades: e.atividades.filter((_, j) => j !== aIdx)
    } : e))
  }

  function addParticipanteAtividade(eIdx: number, aIdx: number) {
    setEntregas(prev => prev.map((e, i) => i === eIdx ? {
      ...e, atividades: e.atividades.map((a, j) => j === aIdx ? {
        ...a, participantes: [...a.participantes, { setor_id: null, tipo_participante: 'setor', papel: '' }]
      } : a)
    } : e))
  }

  function updateParticipanteAtividade(eIdx: number, aIdx: number, pIdx: number, field: string, value: any) {
    setEntregas(prev => prev.map((e, i) => i === eIdx ? {
      ...e, atividades: e.atividades.map((a, j) => j === aIdx ? {
        ...a, participantes: a.participantes.map((p, k) => k === pIdx ? { ...p, [field]: value } : p)
      } : a)
    } : e))
  }

  function removeParticipanteAtividade(eIdx: number, aIdx: number, pIdx: number) {
    setEntregas(prev => prev.map((e, i) => i === eIdx ? {
      ...e, atividades: e.atividades.map((a, j) => j === aIdx ? {
        ...a, participantes: a.participantes.filter((_, k) => k !== pIdx)
      } : a)
    } : e))
  }

  function toggleAcao(acaoId: number) {
    setAcoesSelecionadas(prev =>
      prev.includes(acaoId) ? prev.filter(id => id !== acaoId) : [...prev, acaoId])
  }

  async function handleSave() {
    if (!nome.trim() || !descricao.trim() || !problemaResolve.trim() || !setorLiderId || acoesSelecionadas.length === 0) {
      alert('Preencha todos os campos obrigatórios e selecione ao menos uma ação estratégica.')
      return
    }
    for (const e of entregas) {
      if (!e.nome.trim() || !e.descricao.trim()) {
        alert('Preencha nome e descrição de todas as entregas.')
        return
      }
      const validParticipantes = e.participantes.filter(p => p.papel.trim())
      if (validParticipantes.length === 0) {
        alert(`A entrega "${e.nome}" precisa de ao menos um participante com papel definido.`)
        return
      }
      // Check duplicate setores in entrega
      const keys = validParticipantes.map(p => p.tipo_participante === 'setor' ? `s_${p.setor_id}` : p.tipo_participante)
      if (new Set(keys).size !== keys.length) {
        alert(`A entrega "${e.nome}" tem setores/participantes duplicados. Use o campo "papel" para múltiplos papéis do mesmo setor.`)
        return
      }
      for (const a of e.atividades) {
        if (!a.nome.trim() || !a.descricao.trim()) {
          alert('Preencha nome e descrição de todas as atividades.')
          return
        }
        // Check atividade date <= entrega quinzena
        if (a.data_prevista && e.quinzena && a.data_prevista > e.quinzena) {
          alert(`A atividade "${a.nome}" tem data posterior à quinzena da entrega "${e.nome}".`)
          return
        }
        // Check atividade participantes are subset of entrega participantes
        const entregaKeys = new Set(validParticipantes.map(p => p.tipo_participante === 'setor' ? `s_${p.setor_id}` : p.tipo_participante))
        const ativValidP = a.participantes.filter(p => p.papel.trim())
        for (const ap of ativValidP) {
          const apKey = ap.tipo_participante === 'setor' ? `s_${ap.setor_id}` : ap.tipo_participante
          if (!entregaKeys.has(apKey)) {
            alert(`A atividade "${a.nome}" inclui um participante que não está na entrega "${e.nome}".`)
            return
          }
        }
        // Check duplicate setores in atividade
        const aKeys = ativValidP.map(p => p.tipo_participante === 'setor' ? `s_${p.setor_id}` : p.tipo_participante)
        if (new Set(aKeys).size !== aKeys.length) {
          alert(`A atividade "${a.nome}" tem participantes duplicados. Use o campo "papel" para múltiplos papéis.`)
          return
        }
      }
    }

    setSaving(true)
    try {
      const { data: proj, error: projErr } = await supabase.from('projetos').insert({
        nome: nome.trim(), descricao: descricao.trim(), problema_resolve: problemaResolve.trim(),
        setor_lider_id: setorLiderId, criado_por: profile!.id
      }).select().single()
      if (projErr) throw projErr

      await supabase.from('projeto_acoes').insert(
        acoesSelecionadas.map(aid => ({ projeto_id: proj.id, acao_estrategica_id: aid })))

      await supabase.from('audit_log').insert({
        usuario_id: profile!.id, usuario_nome: profile!.nome,
        tipo_acao: 'create', entidade: 'projeto', entidade_id: proj.id,
        conteudo_novo: { nome: nome.trim(), descricao: descricao.trim(), setor_lider_id: setorLiderId }
      })

      for (const e of entregas) {
        const { data: ent, error: entErr } = await supabase.from('entregas').insert({
          projeto_id: proj.id, nome: e.nome.trim(), descricao: e.descricao.trim(),
          dependencias_criticas: e.dependencias_criticas.trim() || null,
          data_final_prevista: e.quinzena || null,
        }).select().single()
        if (entErr) throw entErr

        const validP = e.participantes.filter(p => p.papel.trim())
        if (validP.length > 0) {
          await supabase.from('entrega_participantes').insert(
            validP.map(p => ({
              entrega_id: ent.id,
              setor_id: p.tipo_participante === 'setor' ? p.setor_id : null,
              tipo_participante: p.tipo_participante,
              papel: p.papel.trim()
            })))
        }

        await supabase.from('audit_log').insert({
          usuario_id: profile!.id, usuario_nome: profile!.nome,
          tipo_acao: 'create', entidade: 'entrega', entidade_id: ent.id,
          conteudo_novo: { nome: e.nome.trim(), projeto_id: proj.id }
        })

        for (const a of e.atividades) {
          const { data: ativ, error: ativErr } = await supabase.from('atividades').insert({
            entrega_id: ent.id, nome: a.nome.trim(), descricao: a.descricao.trim(),
            data_prevista: a.data_prevista || null
          }).select().single()
          if (ativErr) throw ativErr

          const validAP = a.participantes.filter(p => p.papel.trim())
          if (validAP.length > 0) {
            await supabase.from('atividade_participantes').insert(
              validAP.map(p => ({
                atividade_id: ativ.id,
                setor_id: p.tipo_participante === 'setor' ? p.setor_id : null,
                tipo_participante: p.tipo_participante,
                papel: p.papel.trim()
              })))
          }
        }
      }

      router.push(`/dashboard/projetos/${proj.id}`)
    } catch (err: any) {
      alert(`Erro ao salvar: ${err.message}`)
    }
    setSaving(false)
  }

  // Helper: key de um participante para comparação
  function pKey(p: Participante) {
    return p.tipo_participante === 'setor' ? `s_${p.setor_id}` : p.tipo_participante
  }

  // Participante select para ENTREGA (todos os setores, sem duplicados)
  function renderEntregaParticipanteSelect(p: Participante, idx: number, allParts: Participante[], onChange: (field: string, value: any) => void, onRemove: () => void) {
    const usedKeys = new Set(allParts.filter((_, i) => i !== idx).map(pKey))
    return (
      <div className="flex gap-2 items-start">
        <select value={p.tipo_participante === 'setor' ? (p.setor_id || '') : p.tipo_participante}
          onChange={e => {
            const v = e.target.value
            if (v === 'externo_subsegop' || v === 'externo_sedec') {
              onChange('tipo_participante', v); onChange('setor_id', null)
            } else {
              onChange('tipo_participante', 'setor'); onChange('setor_id', parseInt(v) || null)
            }
          }} className="input-field text-xs flex-1">
          <option value="">Selecione o participante...</option>
          <optgroup label="Setores">
            {setores.map(s => (
              <option key={s.id} value={s.id} disabled={usedKeys.has(`s_${s.id}`)}>{s.codigo} — {s.nome_completo}{usedKeys.has(`s_${s.id}`) ? ' (já incluído)' : ''}</option>
            ))}
          </optgroup>
          <optgroup label="Atores Externos">
            <option value="externo_subsegop" disabled={usedKeys.has('externo_subsegop')}>Ator externo à SUBSEGOP{usedKeys.has('externo_subsegop') ? ' (já incluído)' : ''}</option>
            <option value="externo_sedec" disabled={usedKeys.has('externo_sedec')}>Ator externo à SEDEC{usedKeys.has('externo_sedec') ? ' (já incluído)' : ''}</option>
          </optgroup>
        </select>
        <input type="text" value={p.papel} onChange={e => onChange('papel', e.target.value)}
          placeholder="Papel (use este campo para múltiplos papéis)" className="input-field text-xs flex-1" />
        <button type="button" onClick={onRemove} className="text-red-400 hover:text-red-600 mt-2 shrink-0">
          <Trash2 size={14} />
        </button>
      </div>
    )
  }

  // Participante select para ATIVIDADE (apenas setores da entrega, sem duplicados)
  function renderAtividadeParticipanteSelect(p: Participante, idx: number, allParts: Participante[], entregaParts: Participante[], onChange: (field: string, value: any) => void, onRemove: () => void) {
    const usedKeys = new Set(allParts.filter((_, i) => i !== idx).map(pKey))
    const entregaValidParts = entregaParts.filter(ep => ep.papel.trim())
    return (
      <div className="flex gap-2 items-start">
        <select value={p.tipo_participante === 'setor' ? (p.setor_id || '') : p.tipo_participante}
          onChange={e => {
            const v = e.target.value
            if (v === 'externo_subsegop' || v === 'externo_sedec') {
              onChange('tipo_participante', v); onChange('setor_id', null)
            } else {
              onChange('tipo_participante', 'setor'); onChange('setor_id', parseInt(v) || null)
            }
          }} className="input-field text-xs flex-1">
          <option value="">Selecione o participante...</option>
          {entregaValidParts.map(ep => {
            if (ep.tipo_participante === 'setor' && ep.setor_id) {
              const s = setores.find(ss => ss.id === ep.setor_id)
              const k = `s_${ep.setor_id}`
              return <option key={k} value={ep.setor_id} disabled={usedKeys.has(k)}>{s?.codigo || 'Setor'}{usedKeys.has(k) ? ' (já incluído)' : ''}</option>
            } else {
              const label = ep.tipo_participante === 'externo_subsegop' ? 'Ator externo à SUBSEGOP' : 'Ator externo à SEDEC'
              return <option key={ep.tipo_participante} value={ep.tipo_participante} disabled={usedKeys.has(ep.tipo_participante)}>{label}{usedKeys.has(ep.tipo_participante) ? ' (já incluído)' : ''}</option>
            }
          })}
          {entregaValidParts.length === 0 && <option disabled>Adicione participantes na entrega primeiro</option>}
        </select>
        <input type="text" value={p.papel} onChange={e => onChange('papel', e.target.value)}
          placeholder="Papel na atividade" className="input-field text-xs flex-1" />
        <button type="button" onClick={onRemove} className="text-red-400 hover:text-red-600 mt-2 shrink-0">
          <Trash2 size={14} />
        </button>
      </div>
    )
  }

  // Validação cruzada: ao alterar quinzena da entrega, checar se atividades ficam inválidas
  function handleQuinzenaChange(eIdx: number, newQuinzena: string) {
    const entrega = entregas[eIdx]
    if (newQuinzena) {
      const ativComDataPosterior = entrega.atividades.filter(a => a.data_prevista && a.data_prevista > newQuinzena)
      if (ativComDataPosterior.length > 0) {
        const nomes = ativComDataPosterior.map(a => `"${a.nome}"`).join(', ')
        alert(`Não é possível definir esta quinzena. As atividades ${nomes} têm datas posteriores. Ajuste-as primeiro.`)
        return
      }
    }
    updateEntrega(eIdx, 'quinzena', newQuinzena)
  }

  // Validação cruzada: ao remover participante de entrega, checar se está em alguma atividade
  function handleRemoveParticipanteEntrega(eIdx: number, pIdx: number) {
    const entrega = entregas[eIdx]
    const removendo = entrega.participantes[pIdx]
    const rKey = pKey(removendo)
    const ativComEsseSetor = entrega.atividades.filter(a =>
      a.participantes.some(ap => pKey(ap) === rKey)
    )
    if (ativComEsseSetor.length > 0) {
      const nomes = ativComEsseSetor.map(a => `"${a.nome}"`).join(', ')
      alert(`Não é possível remover este participante. Ele está incluído nas atividades: ${nomes}. Remova-o das atividades primeiro.`)
      return
    }
    removeParticipanteEntrega(eIdx, pIdx)
  }

  if (loading) return <div className="flex justify-center py-20"><div className="animate-pulse text-sedec-500">Carregando...</div></div>

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={() => router.push('/dashboard/projetos')}
        className="flex items-center gap-2 text-sm text-sedec-500 hover:text-sedec-700 mb-4">
        <ArrowLeft size={16} /> Voltar aos projetos
      </button>

      <h1 className="text-2xl font-bold text-gray-800 mb-6">Novo Projeto</h1>

      <div className="space-y-6">
        {/* Dados do projeto */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-base font-semibold text-gray-700">Dados do Projeto</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome do projeto <span className="text-red-500">*</span></label>
            <input type="text" value={nome} onChange={e => setNome(e.target.value)} className="input-field" placeholder="Nome claro e objetivo" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Setor líder <span className="text-red-500">*</span></label>
            {profile?.role === 'gestor' ? (
              <div className="input-field bg-gray-50 text-gray-600">
                {setores.find(s => s.id === profile.setor_id)?.codigo || ''} — {setores.find(s => s.id === profile.setor_id)?.nome_completo || ''}
              </div>
            ) : (
              <select value={setorLiderId} onChange={e => setSetorLiderId(parseInt(e.target.value) || '')} className="input-field">
                <option value="">Selecione o setor líder...</option>
                {setores.map(s => <option key={s.id} value={s.id}>{s.codigo} — {s.nome_completo}</option>)}
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição — O quê <span className="text-red-500">*</span></label>
            <textarea value={descricao} onChange={e => setDescricao(e.target.value)} rows={3}
              className="input-field resize-none" placeholder="Descreva o que este projeto entregará" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Problema que soluciona — Por quê <span className="text-red-500">*</span></label>
            <textarea value={problemaResolve} onChange={e => setProblemaResolve(e.target.value)} rows={3}
              className="input-field resize-none" placeholder="Qual problema concreto este projeto resolve?" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ações estratégicas vinculadas <span className="text-red-500">*</span></label>
            <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-2 space-y-1">
              {acoes.map(a => (
                <label key={a.id} className="flex items-center gap-2 text-xs p-1.5 rounded hover:bg-gray-50 cursor-pointer">
                  <input type="checkbox" checked={acoesSelecionadas.includes(a.id)}
                    onChange={() => toggleAcao(a.id)} className="rounded border-gray-300 text-orange-500 focus:ring-orange-400" />
                  <span className="font-medium text-sedec-600">AE {a.numero}</span>
                  <span className="text-gray-600 line-clamp-1">{a.nome}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Entregas */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-700">Entregas</h2>
            <button type="button" onClick={addEntrega}
              className="flex items-center gap-1.5 text-sm text-orange-600 hover:text-orange-700 font-medium">
              <PackagePlus size={16} /> Adicionar entrega
            </button>
          </div>

          {entregas.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">Nenhuma entrega adicionada. Entregas podem ser adicionadas agora ou posteriormente.</p>
          )}

          <div className="space-y-6">
            {entregas.map((e, eIdx) => (
              <div key={eIdx} className="border border-gray-200 rounded-lg p-4 bg-gray-50/50">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-sm font-semibold text-gray-600">Entrega {eIdx + 1}</span>
                  <button type="button" onClick={() => removeEntrega(eIdx)} className="text-red-400 hover:text-red-600">
                    <Trash2 size={15} />
                  </button>
                </div>

                <div className="space-y-3">
                  <input type="text" value={e.nome} onChange={ev => updateEntrega(eIdx, 'nome', ev.target.value)}
                    placeholder="Nome da entrega *" className="input-field text-sm" />
                  <textarea value={e.descricao} onChange={ev => updateEntrega(eIdx, 'descricao', ev.target.value)}
                    placeholder="Descrição da entrega *" className="input-field text-sm resize-none" rows={2} />

                  {/* Participantes */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-600">Participantes <span className="text-red-500">*</span></span>
                      <button type="button" onClick={() => addParticipanteEntrega(eIdx)}
                        className="text-[11px] text-orange-500 hover:text-orange-700 font-medium">+ Participante</button>
                    </div>
                    <div className="space-y-2">
                      {e.participantes.map((p, pIdx) => (
                        <div key={pIdx}>
                          {renderEntregaParticipanteSelect(p, pIdx, e.participantes,
                            (f, v) => updateParticipanteEntrega(eIdx, pIdx, f, v),
                            () => handleRemoveParticipanteEntrega(eIdx, pIdx))}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-gray-500">Dependências críticas</label>
                      <input type="text" value={e.dependencias_criticas}
                        onChange={ev => updateEntrega(eIdx, 'dependencias_criticas', ev.target.value)}
                        placeholder="ex: custos específicos, tempo de licitação..." className="input-field text-xs" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500">Quinzena de entrega</label>
                      <select value={e.quinzena} onChange={ev => handleQuinzenaChange(eIdx, ev.target.value)}
                        className="input-field text-xs">
                        <option value="">Sem prazo definido</option>
                        {QUINZENAS.map(q => <option key={q.value} value={q.value}>{q.label}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Atividades */}
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-600">Atividades</span>
                      <button type="button" onClick={() => addAtividade(eIdx)}
                        className="text-[11px] text-orange-500 hover:text-orange-700 font-medium flex items-center gap-1">
                        <ListPlus size={13} /> Atividade
                      </button>
                    </div>

                    {e.atividades.length === 0 && (
                      <div className="flex items-start gap-2 text-xs text-gray-400 bg-white/70 rounded p-2">
                        <Info size={13} className="mt-0.5 shrink-0" />
                        <span>As atividades podem incluir reuniões de brainstorm, pesquisa bibliográfica, levantamento de preços etc. Podem ser adicionadas posteriormente.</span>
                      </div>
                    )}

                    {e.atividades.map((a, aIdx) => (
                      <div key={aIdx} className="bg-white rounded border border-gray-100 p-3 mb-2">
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-[11px] font-semibold text-gray-500">Atividade {aIdx + 1}</span>
                          <button type="button" onClick={() => removeAtividade(eIdx, aIdx)}
                            className="text-red-400 hover:text-red-600"><Trash2 size={13} /></button>
                        </div>
                        <div className="space-y-2">
                          <input type="text" value={a.nome} onChange={ev => updateAtividade(eIdx, aIdx, 'nome', ev.target.value)}
                            placeholder="Nome da atividade *" className="input-field text-xs" />
                          <input type="text" value={a.descricao} onChange={ev => updateAtividade(eIdx, aIdx, 'descricao', ev.target.value)}
                            placeholder="Descrição da atividade *" className="input-field text-xs" />

                          {/* Data prevista da atividade */}
                          <div>
                            <label className="text-[10px] font-medium text-gray-500">Data prevista (opcional)</label>
                            <input type="date" value={a.data_prevista}
                              max={e.quinzena || undefined}
                              onChange={ev => {
                                const newDate = ev.target.value
                                if (newDate && e.quinzena && newDate > e.quinzena) {
                                  alert(`A data não pode ser posterior à quinzena da entrega (${e.quinzena}).`)
                                  return
                                }
                                updateAtividade(eIdx, aIdx, 'data_prevista', newDate)
                              }}
                              className="input-field text-xs" />
                            {e.quinzena && <span className="text-[9px] text-gray-400">Limite: {e.quinzena}</span>}
                          </div>

                          {/* Participantes da atividade (apenas setores da entrega) */}
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-medium text-gray-500">Participantes</span>
                              <button type="button" onClick={() => {
                                const entregaValid = e.participantes.filter(p => p.papel.trim())
                                if (entregaValid.length === 0) { alert('Adicione participantes na entrega primeiro.'); return }
                                addParticipanteAtividade(eIdx, aIdx)
                              }}
                                className="text-[10px] text-orange-500 hover:text-orange-700 font-medium">+ Participante</button>
                            </div>
                            {e.participantes.filter(p => p.papel.trim()).length === 0 && a.participantes.length === 0 && (
                              <p className="text-[9px] text-gray-400 italic">Disponível após incluir participantes na entrega.</p>
                            )}
                            {a.participantes.map((p, pIdx) => (
                              <div key={pIdx} className="mt-1">
                                {renderAtividadeParticipanteSelect(p, pIdx, a.participantes, e.participantes,
                                  (f, v) => updateParticipanteAtividade(eIdx, aIdx, pIdx, f, v),
                                  () => removeParticipanteAtividade(eIdx, aIdx, pIdx))}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => router.push('/dashboard/projetos')}
            className="px-4 py-2.5 text-sm text-gray-600 hover:text-gray-800">Cancelar</button>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
            <Save size={16} /> {saving ? 'Salvando...' : 'Criar projeto'}
          </button>
        </div>
      </div>
    </div>
  )
}
