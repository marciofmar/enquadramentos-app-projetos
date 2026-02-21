'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft, Edit3, Trash2, Save, X, Plus, PackagePlus, ListPlus,
  CheckCircle, Clock, AlertTriangle, Info, ChevronDown, ChevronUp
} from 'lucide-react'
import type { Profile } from '@/lib/types'

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

const STATUS_ENTREGA: Record<string, { label: string; color: string; bg: string }> = {
  aberta: { label: 'Aberta', color: 'text-gray-600', bg: 'bg-gray-100' },
  em_andamento: { label: 'Em andamento', color: 'text-blue-700', bg: 'bg-blue-100' },
  aguardando: { label: 'Aguardando', color: 'text-yellow-700', bg: 'bg-yellow-100' },
  resolvida: { label: 'Resolvida', color: 'text-green-700', bg: 'bg-green-100' },
  cancelada: { label: 'Cancelada', color: 'text-red-700', bg: 'bg-red-100' },
}

const PONT_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; icon: any }> = {
  em_dia: { label: 'Em dia', color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-300', icon: CheckCircle },
  proximo: { label: 'Próximo do prazo', color: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-300', icon: Clock },
  atrasado: { label: 'Atrasado', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-300', icon: AlertTriangle },
}

export default function ProjetoDetalhePage() {
  const params = useParams()
  const id = parseInt(params.id as string)
  const router = useRouter()
  const supabase = createClient()

  const [projeto, setProjeto] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [configs, setConfigs] = useState<Record<string, string>>({})
  const [setores, setSetores] = useState<any[]>([])
  const [acoes, setAcoes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Edit states
  const [editingProjeto, setEditingProjeto] = useState(false)
  const [editingEntrega, setEditingEntrega] = useState<number | null>(null)
  const [editingAtividade, setEditingAtividade] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<any>({})
  const [expanded, setExpanded] = useState<Record<number, boolean>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadAll() }, [id])

  async function loadAll() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (p) setProfile(p as any)
    }

    const { data: cfgs } = await supabase.from('configuracoes').select('chave, valor')
    if (cfgs) { const m: Record<string, string> = {}; cfgs.forEach((c: any) => { m[c.chave] = c.valor }); setConfigs(m) }

    const { data: s } = await supabase.from('setores').select('id, codigo, nome_completo').order('codigo')
    if (s) setSetores(s)

    const { data: a } = await supabase.from('acoes_estrategicas').select('id, numero, nome').order('numero')
    if (a) setAcoes(a)

    const { data: proj } = await supabase.from('projetos')
      .select(`*, setor_lider:setor_lider_id(codigo, nome_completo),
        projeto_acoes(acao_estrategica:acao_estrategica_id(id, numero, nome)),
        entregas(id, nome, descricao, dependencias_criticas, data_final_prevista, status, motivo_status,
          entrega_participantes(id, setor_id, tipo_participante, papel, setor:setor_id(codigo, nome_completo)),
          atividades(id, nome, descricao, data_prevista, status, motivo_status,
            atividade_participantes(id, setor_id, tipo_participante, papel, setor:setor_id(codigo, nome_completo))
          )
        )`)
      .eq('id', id).single()

    if (proj) {
      proj.entregas?.sort((a: any, b: any) => a.id - b.id)
      proj.entregas?.forEach((e: any) => e.atividades?.sort((a: any, b: any) => a.id - b.id))
      setProjeto(proj)
      // Expand all entregas by default
      const exp: Record<number, boolean> = {}
      proj.entregas?.forEach((e: any) => { exp[e.id] = true })
      setExpanded(exp)
    }
    setLoading(false)
  }

  // Permission checks
  const isAdmin = profile?.role === 'admin'
  const isGestorDoSetor = profile?.role === 'gestor' && profile.setor_id === projeto?.setor_lider_id
  const canEdit = isAdmin || (isGestorDoSetor && configs['proj_permitir_edicao'] !== 'false')
  const canEditDates = isAdmin || (canEdit && configs['proj_permitir_edicao_datas'] !== 'false')
  const canCreate = isAdmin || (isGestorDoSetor && configs['proj_permitir_cadastro'] !== 'false')

  // Pontualidade
  const pontualidade = useMemo(() => {
    if (!projeto?.entregas) return 'em_dia'
    const now = new Date(); now.setHours(0, 0, 0, 0)
    const quinzena = new Date(now); quinzena.setDate(quinzena.getDate() + 15)
    const active = projeto.entregas.filter((e: any) => e.status !== 'resolvida' && e.status !== 'cancelada' && e.data_final_prevista)
    if (active.some((e: any) => new Date(e.data_final_prevista) < now)) return 'atrasado'
    if (active.some((e: any) => { const d = new Date(e.data_final_prevista); return d >= now && d <= quinzena })) return 'proximo'
    return 'em_dia'
  }, [projeto])

  async function auditLog(tipo: string, entidade: string, entidadeId: number, anterior: any, novo: any) {
    await supabase.from('audit_log').insert({
      usuario_id: profile!.id, usuario_nome: profile!.nome,
      tipo_acao: tipo, entidade, entidade_id: entidadeId,
      conteudo_anterior: anterior, conteudo_novo: novo
    })
  }

  // Project edit
  function startEditProjeto() {
    setEditForm({
      nome: projeto.nome, descricao: projeto.descricao, problema_resolve: projeto.problema_resolve,
      setor_lider_id: projeto.setor_lider_id,
      acoes: projeto.projeto_acoes?.map((pa: any) => pa.acao_estrategica?.id) || []
    })
    setEditingProjeto(true)
  }

  async function saveEditProjeto() {
    setSaving(true)
    const anterior = { nome: projeto.nome, descricao: projeto.descricao }
    const { error } = await supabase.from('projetos').update({
      nome: editForm.nome, descricao: editForm.descricao, problema_resolve: editForm.problema_resolve,
      setor_lider_id: editForm.setor_lider_id,
    }).eq('id', projeto.id)
    if (error) { alert(error.message); setSaving(false); return }

    // Update acoes
    await supabase.from('projeto_acoes').delete().eq('projeto_id', projeto.id)
    if (editForm.acoes.length > 0) {
      await supabase.from('projeto_acoes').insert(
        editForm.acoes.map((aid: number) => ({ projeto_id: projeto.id, acao_estrategica_id: aid })))
    }

    await auditLog('update', 'projeto', projeto.id, anterior, { nome: editForm.nome, descricao: editForm.descricao })
    setEditingProjeto(false); setSaving(false); loadAll()
  }

  async function deleteProject() {
    if (!confirm(`Excluir o projeto "${projeto.nome}"?\n\nTodas as entregas e atividades serão excluídas permanentemente.`)) return
    await auditLog('delete', 'projeto', projeto.id, { nome: projeto.nome }, null)
    await supabase.from('projetos').delete().eq('id', projeto.id)
    router.push('/dashboard/projetos')
  }

  // Entrega edit
  function startEditEntrega(e: any) {
    setEditForm({
      nome: e.nome, descricao: e.descricao, dependencias_criticas: e.dependencias_criticas || '',
      data_final_prevista: e.data_final_prevista || '', status: e.status, motivo_status: e.motivo_status || '',
      participantes: e.entrega_participantes?.map((p: any) => ({
        id: p.id, setor_id: p.setor_id, tipo_participante: p.tipo_participante, papel: p.papel
      })) || []
    })
    setEditingEntrega(e.id)
  }

  async function saveEditEntrega(entregaId: number) {
    setSaving(true)

    // Validate: no duplicate participantes
    const validP = editForm.participantes.filter((p: any) => p.papel?.trim())
    const pKeys = validP.map((p: any) => p.tipo_participante === 'setor' ? `s_${p.setor_id}` : p.tipo_participante)
    if (new Set(pKeys).size !== pKeys.length) {
      alert('Há participantes duplicados nesta entrega. Use o campo "papel" para múltiplos papéis do mesmo setor.')
      setSaving(false); return
    }

    // Validate: if quinzena changed, check atividades dates
    const entrega = projeto.entregas.find((e: any) => e.id === entregaId)
    if (editForm.data_final_prevista && entrega?.atividades) {
      const ativPosterior = entrega.atividades.filter((a: any) => a.data_prevista && a.data_prevista > editForm.data_final_prevista)
      if (ativPosterior.length > 0) {
        const nomes = ativPosterior.map((a: any) => `"${a.nome}"`).join(', ')
        alert(`Não é possível definir esta quinzena. As atividades ${nomes} têm datas posteriores. Ajuste-as primeiro.`)
        setSaving(false); return
      }
    }

    // Validate: if participante removed, check atividades don't reference them
    if (entrega?.atividades) {
      const newKeys = new Set(validP.map((p: any) => p.tipo_participante === 'setor' ? `s_${p.setor_id}` : p.tipo_participante))
      for (const ativ of entrega.atividades) {
        for (const ap of (ativ.atividade_participantes || [])) {
          const apKey = ap.tipo_participante === 'setor' ? `s_${ap.setor_id}` : ap.tipo_participante
          if (!newKeys.has(apKey)) {
            const label = ap.tipo_participante === 'setor' ? (ap.setor?.codigo || 'Setor') : ap.tipo_participante
            alert(`Não é possível remover "${label}" desta entrega. Está incluído na atividade "${ativ.nome}". Remova-o da atividade primeiro.`)
            setSaving(false); return
          }
        }
      }
    }

    const { error } = await supabase.from('entregas').update({
      nome: editForm.nome, descricao: editForm.descricao,
      dependencias_criticas: editForm.dependencias_criticas || null,
      data_final_prevista: editForm.data_final_prevista || null,
      status: editForm.status, motivo_status: editForm.motivo_status || null,
    }).eq('id', entregaId)
    if (error) { alert(error.message); setSaving(false); return }

    // Rebuild participantes
    await supabase.from('entrega_participantes').delete().eq('entrega_id', entregaId)
    if (validP.length > 0) {
      await supabase.from('entrega_participantes').insert(validP.map((p: any) => ({
        entrega_id: entregaId,
        setor_id: p.tipo_participante === 'setor' ? p.setor_id : null,
        tipo_participante: p.tipo_participante, papel: p.papel.trim()
      })))
    }

    await auditLog('update', 'entrega', entregaId, null, { nome: editForm.nome, status: editForm.status })
    setEditingEntrega(null); setSaving(false); loadAll()
  }

  async function deleteEntrega(e: any) {
    if (!confirm(`Excluir a entrega "${e.nome}"?\n\nTodas as atividades desta entrega serão excluídas.`)) return
    await auditLog('delete', 'entrega', e.id, { nome: e.nome }, null)
    await supabase.from('entregas').delete().eq('id', e.id)
    loadAll()
  }

  async function addNewEntrega() {
    const { data, error } = await supabase.from('entregas').insert({
      projeto_id: projeto.id, nome: 'Nova entrega', descricao: 'Descreva esta entrega', status: 'aberta'
    }).select().single()
    if (error) { alert(error.message); return }
    await auditLog('create', 'entrega', data.id, null, { nome: 'Nova entrega', projeto_id: projeto.id })
    loadAll()
    setTimeout(() => startEditEntrega(data), 300)
  }

  // Atividade edit
  function startEditAtividade(a: any, entrega: any) {
    setEditForm({
      nome: a.nome, descricao: a.descricao, data_prevista: a.data_prevista || '',
      status: a.status || 'aberta', motivo_status: a.motivo_status || '',
      entrega_data_final: entrega.data_final_prevista || '',
      entrega_participantes: entrega.entrega_participantes || [],
      participantes: a.atividade_participantes?.map((p: any) => ({
        id: p.id, setor_id: p.setor_id, tipo_participante: p.tipo_participante, papel: p.papel
      })) || []
    })
    setEditingAtividade(a.id)
  }

  async function saveEditAtividade(ativId: number, entregaId: number) {
    setSaving(true)

    // Validate date <= entrega quinzena
    if (editForm.data_prevista && editForm.entrega_data_final && editForm.data_prevista > editForm.entrega_data_final) {
      alert(`A data da atividade não pode ser posterior à quinzena da entrega (${editForm.entrega_data_final}).`)
      setSaving(false); return
    }

    // Validate: participantes are subset of entrega
    const validP = editForm.participantes.filter((p: any) => p.papel?.trim())
    const entregaKeys = new Set((editForm.entrega_participantes || []).map((ep: any) =>
      ep.tipo_participante === 'setor' ? `s_${ep.setor_id}` : ep.tipo_participante))
    for (const ap of validP) {
      const apKey = ap.tipo_participante === 'setor' ? `s_${ap.setor_id}` : ap.tipo_participante
      if (!entregaKeys.has(apKey)) {
        alert('Esta atividade inclui um participante que não está na entrega. Remova-o ou adicione-o à entrega primeiro.')
        setSaving(false); return
      }
    }

    // Validate: no duplicates
    const pKeys = validP.map((p: any) => p.tipo_participante === 'setor' ? `s_${p.setor_id}` : p.tipo_participante)
    if (new Set(pKeys).size !== pKeys.length) {
      alert('Há participantes duplicados nesta atividade. Use o campo "papel" para múltiplos papéis.')
      setSaving(false); return
    }

    const { error } = await supabase.from('atividades').update({
      nome: editForm.nome, descricao: editForm.descricao,
      data_prevista: editForm.data_prevista || null,
      status: editForm.status, motivo_status: editForm.motivo_status || null
    }).eq('id', ativId)
    if (error) { alert(error.message); setSaving(false); return }

    await supabase.from('atividade_participantes').delete().eq('atividade_id', ativId)
    if (validP.length > 0) {
      await supabase.from('atividade_participantes').insert(validP.map((p: any) => ({
        atividade_id: ativId,
        setor_id: p.tipo_participante === 'setor' ? p.setor_id : null,
        tipo_participante: p.tipo_participante, papel: p.papel.trim()
      })))
    }

    await auditLog('update', 'atividade', ativId, null, { nome: editForm.nome })
    setEditingAtividade(null); setSaving(false); loadAll()
  }

  async function deleteAtividade(a: any) {
    if (!confirm(`Excluir a atividade "${a.nome}"?`)) return
    await auditLog('delete', 'atividade', a.id, { nome: a.nome }, null)
    await supabase.from('atividades').delete().eq('id', a.id)
    loadAll()
  }

  async function addNewAtividade(entregaId: number) {
    const { data, error } = await supabase.from('atividades').insert({
      entrega_id: entregaId, nome: 'Nova atividade', descricao: 'Descreva esta atividade'
    }).select().single()
    if (error) { alert(error.message); return }
    await auditLog('create', 'atividade', data.id, null, { nome: 'Nova atividade' })
    loadAll()
  }

  function formatQuinzena(dateStr: string | null) {
    if (!dateStr) return '—'
    const d = new Date(dateStr + 'T00:00:00')
    const month = d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')
    const year = d.getFullYear().toString().slice(-2)
    const q = d.getDate() <= 15 ? '1ª' : '2ª'
    return `${month}/${year} – ${q} quinz.`
  }

  function participanteLabel(p: any) {
    if (p.tipo_participante === 'externo_subsegop') return 'Ator externo à SUBSEGOP'
    if (p.tipo_participante === 'externo_sedec') return 'Ator externo à SEDEC'
    return p.setor?.codigo || 'Setor'
  }

  function pKeyEdit(p: any) {
    return p.tipo_participante === 'setor' ? `s_${p.setor_id}` : p.tipo_participante
  }

  // Participante edit row for ENTREGA (all setores, no duplicates)
  function renderEntregaParticipanteEditRow(p: any, idx: number, allParts: any[], onChange: (i: number, f: string, v: any) => void, onRemove: (i: number) => void) {
    const usedKeys = new Set(allParts.filter((_: any, i: number) => i !== idx).map(pKeyEdit))
    return (
      <div key={idx} className="flex gap-2 items-start">
        <select value={p.tipo_participante === 'setor' ? (p.setor_id || '') : p.tipo_participante}
          onChange={ev => {
            const v = ev.target.value
            if (v === 'externo_subsegop' || v === 'externo_sedec') { onChange(idx, 'tipo_participante', v); onChange(idx, 'setor_id', null) }
            else { onChange(idx, 'tipo_participante', 'setor'); onChange(idx, 'setor_id', parseInt(v) || null) }
          }} className="input-field text-xs flex-1">
          <option value="">Participante...</option>
          <optgroup label="Setores">
            {setores.map((s: any) => <option key={s.id} value={s.id} disabled={usedKeys.has(`s_${s.id}`)}>{s.codigo}{usedKeys.has(`s_${s.id}`) ? ' (já)' : ''}</option>)}
          </optgroup>
          <optgroup label="Externos">
            <option value="externo_subsegop" disabled={usedKeys.has('externo_subsegop')}>Ext. SUBSEGOP{usedKeys.has('externo_subsegop') ? ' (já)' : ''}</option>
            <option value="externo_sedec" disabled={usedKeys.has('externo_sedec')}>Ext. SEDEC{usedKeys.has('externo_sedec') ? ' (já)' : ''}</option>
          </optgroup>
        </select>
        <input type="text" value={p.papel || ''} onChange={ev => onChange(idx, 'papel', ev.target.value)}
          placeholder="Papel (múltiplos papéis aqui)" className="input-field text-xs flex-1" />
        <button type="button" onClick={() => onRemove(idx)} className="text-red-400 hover:text-red-600 mt-2"><Trash2 size={13} /></button>
      </div>
    )
  }

  // Participante edit row for ATIVIDADE (only entrega participantes, no duplicates)
  function renderAtividadeParticipanteEditRow(p: any, idx: number, allParts: any[], entregaParts: any[], onChange: (i: number, f: string, v: any) => void, onRemove: (i: number) => void) {
    const usedKeys = new Set(allParts.filter((_: any, i: number) => i !== idx).map(pKeyEdit))
    return (
      <div key={idx} className="flex gap-2 items-start">
        <select value={p.tipo_participante === 'setor' ? (p.setor_id || '') : p.tipo_participante}
          onChange={ev => {
            const v = ev.target.value
            if (v === 'externo_subsegop' || v === 'externo_sedec') { onChange(idx, 'tipo_participante', v); onChange(idx, 'setor_id', null) }
            else { onChange(idx, 'tipo_participante', 'setor'); onChange(idx, 'setor_id', parseInt(v) || null) }
          }} className="input-field text-xs flex-1">
          <option value="">Participante...</option>
          {entregaParts.map((ep: any) => {
            if (ep.tipo_participante === 'setor' && ep.setor_id) {
              const s = setores.find((ss: any) => ss.id === ep.setor_id)
              const k = `s_${ep.setor_id}`
              return <option key={k} value={ep.setor_id} disabled={usedKeys.has(k)}>{s?.codigo || 'Setor'}{usedKeys.has(k) ? ' (já)' : ''}</option>
            } else {
              const label = ep.tipo_participante === 'externo_subsegop' ? 'Ext. SUBSEGOP' : 'Ext. SEDEC'
              return <option key={ep.tipo_participante} value={ep.tipo_participante} disabled={usedKeys.has(ep.tipo_participante)}>{label}{usedKeys.has(ep.tipo_participante) ? ' (já)' : ''}</option>
            }
          })}
          {entregaParts.length === 0 && <option disabled>Adicione participantes na entrega</option>}
        </select>
        <input type="text" value={p.papel || ''} onChange={ev => onChange(idx, 'papel', ev.target.value)}
          placeholder="Papel na atividade" className="input-field text-xs flex-1" />
        <button type="button" onClick={() => onRemove(idx)} className="text-red-400 hover:text-red-600 mt-2"><Trash2 size={13} /></button>
      </div>
    )
  }

  if (loading) return <div className="flex justify-center py-20"><div className="animate-pulse text-sedec-500">Carregando...</div></div>
  if (!projeto) return <div className="text-center py-20 text-gray-400">Projeto não encontrado.</div>

  const pont = PONT_CONFIG[pontualidade]
  const PontIcon = pont.icon

  return (
    <div>
      <button onClick={() => router.push('/dashboard/projetos')}
        className="flex items-center gap-2 text-sm text-sedec-500 hover:text-sedec-700 mb-4">
        <ArrowLeft size={16} /> Voltar aos projetos
      </button>

      {/* Header do projeto */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
        <div className={`h-1 ${pont.bg === 'bg-green-50' ? 'bg-green-400' : pont.bg === 'bg-yellow-50' ? 'bg-yellow-400' : 'bg-red-400'}`} />
        <div className="p-6">
          {editingProjeto ? (
            <div className="space-y-3">
              <input type="text" value={editForm.nome} onChange={e => setEditForm({ ...editForm, nome: e.target.value })}
                className="input-field text-lg font-bold" />
              {isAdmin && (
                <select value={editForm.setor_lider_id} onChange={e => setEditForm({ ...editForm, setor_lider_id: parseInt(e.target.value) })} className="input-field text-sm">
                  {setores.map((s: any) => <option key={s.id} value={s.id}>{s.codigo} — {s.nome_completo}</option>)}
                </select>
              )}
              <textarea value={editForm.descricao} onChange={e => setEditForm({ ...editForm, descricao: e.target.value })}
                className="input-field text-sm resize-none" rows={3} placeholder="Descrição (O quê)" />
              <textarea value={editForm.problema_resolve} onChange={e => setEditForm({ ...editForm, problema_resolve: e.target.value })}
                className="input-field text-sm resize-none" rows={3} placeholder="Problema que soluciona (Por quê)" />
              <div className="max-h-40 overflow-y-auto border rounded-lg p-2">
                {acoes.map((a: any) => (
                  <label key={a.id} className="flex items-center gap-2 text-xs p-1 hover:bg-gray-50 cursor-pointer">
                    <input type="checkbox" checked={editForm.acoes?.includes(a.id)}
                      onChange={() => setEditForm((prev: any) => ({
                        ...prev, acoes: prev.acoes.includes(a.id) ? prev.acoes.filter((x: number) => x !== a.id) : [...prev.acoes, a.id]
                      }))} className="rounded border-gray-300 text-orange-500" />
                    <span className="font-medium text-sedec-600">AE {a.numero}</span> {a.nome}
                  </label>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={saveEditProjeto} disabled={saving}
                  className="flex items-center gap-1 text-xs bg-green-500 text-white px-3 py-1.5 rounded-lg"><Save size={13} /> Salvar</button>
                <button onClick={() => setEditingProjeto(false)}
                  className="flex items-center gap-1 text-xs text-gray-500 px-3 py-1.5"><X size={13} /> Cancelar</button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h1 className="text-xl font-bold text-gray-800 mb-1">{projeto.nome}</h1>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-medium">
                      {projeto.setor_lider?.codigo} — {projeto.setor_lider?.nome_completo}
                    </span>
                    <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full font-medium ${pont.bg} ${pont.color}`}>
                      <PontIcon size={12} /> {pont.label}
                    </span>
                  </div>
                </div>
                {canEdit && (
                  <div className="flex gap-2 shrink-0">
                    <button onClick={startEditProjeto} className="text-gray-400 hover:text-orange-500" title="Editar"><Edit3 size={18} /></button>
                    <button onClick={deleteProject} className="text-gray-400 hover:text-red-500" title="Excluir"><Trash2 size={18} /></button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm mb-3">
                <div className="bg-blue-50 rounded-lg p-3">
                  <span className="text-xs font-medium text-blue-500 block mb-1">O quê</span>
                  <span className="text-gray-700">{projeto.descricao}</span>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <span className="text-xs font-medium text-green-500 block mb-1">Por quê</span>
                  <span className="text-gray-700">{projeto.problema_resolve}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1">
                {projeto.projeto_acoes?.map((pa: any) => (
                  <span key={pa.acao_estrategica?.id} className="bg-sedec-50 text-sedec-600 px-2 py-0.5 rounded text-xs font-medium">
                    AE {pa.acao_estrategica?.numero}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Gantt Chart */}
      {projeto.entregas?.some((e: any) => e.data_final_prevista) && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Cronograma de Entregas</h2>
          <GanttChart entregas={projeto.entregas} />
        </div>
      )}

      {/* Entregas + Atividades */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-700">Entregas</h2>
        {canCreate && (
          <button onClick={addNewEntrega}
            className="flex items-center gap-1.5 text-sm text-orange-600 hover:text-orange-700 font-medium">
            <PackagePlus size={16} /> Nova entrega
          </button>
        )}
      </div>

      {(!projeto.entregas || projeto.entregas.length === 0) && (
        <div className="text-center py-8 text-gray-400 text-sm">Nenhuma entrega cadastrada.</div>
      )}

      <div className="space-y-4">
        {projeto.entregas?.map((e: any) => {
          const isEditing = editingEntrega === e.id
          const now = new Date(); now.setHours(0, 0, 0, 0)
          const isAtrasada = e.data_final_prevista && e.status !== 'resolvida' && e.status !== 'cancelada' && new Date(e.data_final_prevista) < now
          const st = STATUS_ENTREGA[e.status] || STATUS_ENTREGA.aberta

          return (
            <div key={e.id} className={`bg-white rounded-xl border ${isAtrasada ? 'border-red-300' : 'border-gray-200'} overflow-hidden`}>
              {/* Entrega header */}
              <div className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => !isEditing && setExpanded(prev => ({ ...prev, [e.id]: !prev[e.id] }))}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold text-gray-800">{e.nome}</h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${st.bg} ${st.color}`}>{st.label}</span>
                    {isAtrasada && <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-red-100 text-red-700">Atrasada</span>}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                    {e.data_final_prevista && <span>Prazo: {formatQuinzena(e.data_final_prevista)}</span>}
                    <span>{e.atividades?.length || 0} atividade(s)</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {canEdit && (
                    <>
                      <button onClick={(ev) => { ev.stopPropagation(); isEditing ? setEditingEntrega(null) : startEditEntrega(e) }}
                        className="text-gray-400 hover:text-orange-500"><Edit3 size={15} /></button>
                      <button onClick={(ev) => { ev.stopPropagation(); deleteEntrega(e) }}
                        className="text-gray-400 hover:text-red-500"><Trash2 size={15} /></button>
                    </>
                  )}
                  {expanded[e.id] ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                </div>
              </div>

              {/* Entrega expanded content */}
              {(expanded[e.id] || isEditing) && (
                <div className="border-t border-gray-100 p-4">
                  {isEditing ? (
                    <div className="space-y-3">
                      <input type="text" value={editForm.nome} onChange={ev => setEditForm({ ...editForm, nome: ev.target.value })}
                        className="input-field text-sm" placeholder="Nome" />
                      <textarea value={editForm.descricao} onChange={ev => setEditForm({ ...editForm, descricao: ev.target.value })}
                        className="input-field text-sm resize-none" rows={2} placeholder="Descrição" />
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <select value={editForm.status} onChange={ev => setEditForm({ ...editForm, status: ev.target.value })} className="input-field text-xs">
                          {Object.entries(STATUS_ENTREGA).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                        </select>
                        <select value={editForm.data_final_prevista} disabled={!canEditDates}
                          onChange={ev => setEditForm({ ...editForm, data_final_prevista: ev.target.value })}
                          className={`input-field text-xs ${!canEditDates ? 'opacity-50' : ''}`}>
                          <option value="">Sem prazo</option>
                          {QUINZENAS.map(q => <option key={q.value} value={q.value}>{q.label}</option>)}
                        </select>
                        <input type="text" value={editForm.motivo_status} onChange={ev => setEditForm({ ...editForm, motivo_status: ev.target.value })}
                          placeholder="Motivo do status" className="input-field text-xs" />
                      </div>
                      <input type="text" value={editForm.dependencias_criticas}
                        onChange={ev => setEditForm({ ...editForm, dependencias_criticas: ev.target.value })}
                        placeholder="Dependências críticas" className="input-field text-xs" />

                      {/* Participantes */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-gray-600">Participantes</span>
                          <button type="button" onClick={() => setEditForm((prev: any) => ({
                            ...prev, participantes: [...prev.participantes, { setor_id: null, tipo_participante: 'setor', papel: '' }]
                          }))} className="text-[11px] text-orange-500 font-medium">+ Participante</button>
                        </div>
                        {editForm.participantes?.map((p: any, i: number) =>
                          renderEntregaParticipanteEditRow(p, i, editForm.participantes,
                            (idx, f, v) => setEditForm((prev: any) => ({
                              ...prev, participantes: prev.participantes.map((pp: any, j: number) => j === idx ? { ...pp, [f]: v } : pp)
                            })),
                            (idx) => { if (confirm('Remover participante?')) setEditForm((prev: any) => ({
                              ...prev, participantes: prev.participantes.filter((_: any, j: number) => j !== idx)
                            })) }
                          )
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button onClick={() => saveEditEntrega(e.id)} disabled={saving}
                          className="flex items-center gap-1 text-xs bg-green-500 text-white px-3 py-1.5 rounded-lg"><Save size={13} /> Salvar</button>
                        <button onClick={() => setEditingEntrega(null)}
                          className="flex items-center gap-1 text-xs text-gray-500 px-3 py-1.5"><X size={13} /> Cancelar</button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-gray-600 mb-3">{e.descricao}</p>
                      {e.dependencias_criticas && (
                        <p className="text-xs text-gray-500 mb-2"><span className="font-medium">Dependências:</span> {e.dependencias_criticas}</p>
                      )}
                      {e.motivo_status && (
                        <p className="text-xs text-gray-500 mb-2"><span className="font-medium">Motivo do status:</span> {e.motivo_status}</p>
                      )}

                      {/* Participantes */}
                      {e.entrega_participantes?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {e.entrega_participantes.map((p: any) => (
                            <span key={p.id} className="text-xs bg-gray-100 px-2 py-1 rounded">
                              <span className="font-medium">{participanteLabel(p)}</span>: {p.papel}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Atividades */}
                      <div className="border-t border-gray-100 pt-3 mt-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Atividades</span>
                          {canCreate && (
                            <button onClick={() => addNewAtividade(e.id)}
                              className="text-[11px] text-orange-500 hover:text-orange-700 font-medium flex items-center gap-1">
                              <ListPlus size={13} /> Atividade
                            </button>
                          )}
                        </div>

                        {(!e.atividades || e.atividades.length === 0) && (
                          <div className="flex items-start gap-2 text-xs text-gray-400 bg-gray-50 rounded p-2">
                            <Info size={13} className="mt-0.5 shrink-0" />
                            <span>Nenhuma atividade. Exemplos: reunião de brainstorm, pesquisa bibliográfica, levantamento de preços no mercado.</span>
                          </div>
                        )}

                        {e.atividades?.map((a: any) => {
                          const isEditA = editingAtividade === a.id
                          return (
                            <div key={a.id} className="bg-gray-50 rounded-lg p-3 mb-2">
                              {isEditA ? (
                                <div className="space-y-2">
                                  <input type="text" value={editForm.nome} onChange={ev => setEditForm({ ...editForm, nome: ev.target.value })}
                                    className="input-field text-xs" placeholder="Nome" />
                                  <input type="text" value={editForm.descricao} onChange={ev => setEditForm({ ...editForm, descricao: ev.target.value })}
                                    className="input-field text-xs" placeholder="Descrição" />

                                  {/* Data prevista */}
                                  <div>
                                    <label className="text-[10px] font-medium text-gray-500">Data prevista (opcional)</label>
                                    <input type="date" value={editForm.data_prevista || ''}
                                      max={editForm.entrega_data_final || undefined}
                                      onChange={ev => {
                                        const nd = ev.target.value
                                        if (nd && editForm.entrega_data_final && nd > editForm.entrega_data_final) {
                                          alert(`A data não pode ser posterior à quinzena da entrega (${editForm.entrega_data_final}).`)
                                          return
                                        }
                                        setEditForm({ ...editForm, data_prevista: nd })
                                      }}
                                      className="input-field text-xs" />
                                    {editForm.entrega_data_final && <span className="text-[9px] text-gray-400">Limite: {editForm.entrega_data_final}</span>}
                                  </div>

                                  {/* Status */}
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <label className="text-[10px] font-medium text-gray-500">Status</label>
                                      <select value={editForm.status} onChange={ev => setEditForm({ ...editForm, status: ev.target.value })} className="input-field text-xs">
                                        {Object.entries(STATUS_ENTREGA).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                                      </select>
                                    </div>
                                    <div>
                                      <label className="text-[10px] font-medium text-gray-500">Motivo do status</label>
                                      <input type="text" value={editForm.motivo_status || ''} onChange={ev => setEditForm({ ...editForm, motivo_status: ev.target.value })}
                                        placeholder="Opcional" className="input-field text-xs" />
                                    </div>
                                  </div>

                                  <div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-[10px] font-medium text-gray-500">Participantes</span>
                                      <button type="button" onClick={() => {
                                        if (!editForm.entrega_participantes?.length) { alert('Adicione participantes na entrega primeiro.'); return }
                                        setEditForm((prev: any) => ({
                                          ...prev, participantes: [...prev.participantes, { setor_id: null, tipo_participante: 'setor', papel: '' }]
                                        }))
                                      }} className="text-[10px] text-orange-500 font-medium">+ Participante</button>
                                    </div>
                                    {editForm.participantes?.map((p: any, i: number) =>
                                      renderAtividadeParticipanteEditRow(p, i, editForm.participantes, editForm.entrega_participantes || [],
                                        (idx, f, v) => setEditForm((prev: any) => ({
                                          ...prev, participantes: prev.participantes.map((pp: any, j: number) => j === idx ? { ...pp, [f]: v } : pp)
                                        })),
                                        (idx) => { if (confirm('Remover participante?')) setEditForm((prev: any) => ({
                                          ...prev, participantes: prev.participantes.filter((_: any, j: number) => j !== idx)
                                        })) }
                                      )
                                    )}
                                  </div>
                                  <div className="flex gap-2">
                                    <button onClick={() => saveEditAtividade(a.id, e.id)} disabled={saving}
                                      className="flex items-center gap-1 text-xs bg-green-500 text-white px-3 py-1.5 rounded-lg"><Save size={13} /> Salvar</button>
                                    <button onClick={() => setEditingAtividade(null)}
                                      className="flex items-center gap-1 text-xs text-gray-500 px-3 py-1.5"><X size={13} /> Cancelar</button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-start justify-between">
                                  <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="text-xs font-semibold text-gray-700">{a.nome}</span>
                                      {(() => {
                                        const st = STATUS_ENTREGA[a.status] || STATUS_ENTREGA.aberta
                                        return <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${st.bg} ${st.color}`}>{st.label}</span>
                                      })()}
                                      {a.data_prevista && a.status !== 'resolvida' && a.status !== 'cancelada' && new Date(a.data_prevista) < new Date(new Date().toDateString()) && (
                                        <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium bg-red-100 text-red-700">Atrasada</span>
                                      )}
                                    </div>
                                    <p className="text-xs text-gray-500">{a.descricao}</p>
                                    {a.motivo_status && <p className="text-[10px] text-gray-400 italic">Motivo: {a.motivo_status}</p>}
                                    {a.data_prevista && (
                                      <p className="text-[10px] text-gray-400 mt-0.5">
                                        <Clock size={10} className="inline mr-1" />
                                        {new Date(a.data_prevista + 'T00:00:00').toLocaleDateString('pt-BR')}
                                      </p>
                                    )}
                                    {a.atividade_participantes?.length > 0 && (
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {a.atividade_participantes.map((p: any) => (
                                          <span key={p.id} className="text-[10px] bg-white px-1.5 py-0.5 rounded border border-gray-200">
                                            {participanteLabel(p)}: {p.papel}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                  {canEdit && (
                                    <div className="flex gap-1.5 shrink-0 ml-2">
                                      <button onClick={() => startEditAtividade(a, e)} className="text-gray-400 hover:text-orange-500"><Edit3 size={13} /></button>
                                      <button onClick={() => deleteAtividade(a)} className="text-gray-400 hover:text-red-500"><Trash2 size={13} /></button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ============================================================
// GANTT CHART (lightweight, no deps)
// ============================================================

function GanttChart({ entregas }: { entregas: any[] }) {
  const withDate = entregas.filter((e: any) => e.data_final_prevista)
  if (withDate.length === 0) return null

  const now = new Date()
  now.setHours(0, 0, 0, 0)

  // Find min and max dates
  const dates = withDate.map((e: any) => new Date(e.data_final_prevista + 'T00:00:00'))
  const minDate = new Date(Math.min(...dates.map(d => d.getTime()), now.getTime()))
  const maxDate = new Date(Math.max(...dates.map(d => d.getTime()), now.getTime()))

  // Extend range by 15 days on each side
  minDate.setDate(1)
  maxDate.setMonth(maxDate.getMonth() + 1, 0)

  const totalDays = Math.max(1, (maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24))

  // Generate month labels
  const months: { label: string; left: number; width: number }[] = []
  const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
  const cur = new Date(minDate)
  while (cur <= maxDate) {
    const monthStart = new Date(cur)
    const monthEnd = new Date(cur.getFullYear(), cur.getMonth() + 1, 0)
    const left = Math.max(0, (monthStart.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)) / totalDays * 100
    const right = Math.min(totalDays, (monthEnd.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)) / totalDays * 100
    months.push({ label: `${meses[cur.getMonth()]}/${cur.getFullYear().toString().slice(-2)}`, left, width: right - left })
    cur.setMonth(cur.getMonth() + 1, 1)
  }

  const todayPos = ((now.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)) / totalDays * 100

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[500px]">
        {/* Month labels */}
        <div className="relative h-6 mb-1">
          {months.map((m, i) => (
            <div key={i} className="absolute text-[10px] text-gray-500 font-medium"
              style={{ left: `${m.left}%`, width: `${m.width}%` }}>
              <span className="px-1">{m.label}</span>
            </div>
          ))}
        </div>

        {/* Bars */}
        <div className="relative space-y-2">
          {/* Today line */}
          <div className="absolute top-0 bottom-0 w-px bg-orange-400 z-10" style={{ left: `${todayPos}%` }}>
            <div className="absolute -top-5 -translate-x-1/2 text-[9px] text-orange-500 font-bold whitespace-nowrap">hoje</div>
          </div>

          {withDate.map((e: any) => {
            const eDate = new Date(e.data_final_prevista + 'T00:00:00')
            const isAtrasada = e.status !== 'resolvida' && e.status !== 'cancelada' && eDate < now
            const isResolvida = e.status === 'resolvida'
            const pos = ((eDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)) / totalDays * 100
            // Bar from project start (minDate) to deadline
            const barWidth = Math.max(2, pos)

            let barColor = 'bg-blue-400'
            if (isResolvida) barColor = 'bg-green-400'
            else if (isAtrasada) barColor = 'bg-red-400'

            return (
              <div key={e.id} className="flex items-center gap-2">
                <span className="text-[10px] text-gray-600 font-medium w-32 truncate shrink-0">{e.nome}</span>
                <div className="flex-1 relative h-5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${barColor} transition-all`} style={{ width: `${barWidth}%` }} />
                  {/* Deadline marker */}
                  <div className="absolute top-0 bottom-0 w-0.5 bg-gray-400" style={{ left: `${pos}%` }} />
                </div>
                <span className={`text-[10px] shrink-0 w-20 text-right ${isAtrasada ? 'text-red-600 font-bold' : 'text-gray-500'}`}>
                  {formatQ(e.data_final_prevista)}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function formatQ(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  const m = d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')
  return `${m}/${d.getFullYear().toString().slice(-2)} – ${d.getDate() <= 15 ? '1ª' : '2ª'}q`
}
