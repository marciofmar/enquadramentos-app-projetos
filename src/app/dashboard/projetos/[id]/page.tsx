'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft, Edit3, Trash2, Save, X, Plus, PackagePlus, ListPlus,
  CheckCircle, CheckCircle2, XCircle, Clock, AlertTriangle, Info, ChevronDown, ChevronUp, HelpCircle
} from 'lucide-react'
import ProjectGuidelineModal from '@/components/ProjectGuidelineModal'
import HelpTooltipModal, { HelpType } from '@/components/HelpTooltipModal'
import UserAutocompleteSelect from '@/components/UserAutocompleteSelect'
import RegisterGestorModal from '@/components/RegisterGestorModal'
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

const STATUS_ENTREGA: Record<string, { label: string; color: string; bg: string; hint: string }> = {
  aberta: { label: 'Aberta', color: 'text-gray-600', bg: 'bg-gray-100', hint: 'Ainda não iniciado' },
  em_andamento: { label: 'Em andamento', color: 'text-blue-700', bg: 'bg-blue-100', hint: 'Trabalho em andamento' },
  aguardando: { label: 'Aguardando', color: 'text-yellow-700', bg: 'bg-yellow-100', hint: 'Parado — depende de retorno de outro órgão' },
  resolvida: { label: 'Resolvida', color: 'text-green-700', bg: 'bg-green-100', hint: 'Finalizado' },
  cancelada: { label: 'Cancelada', color: 'text-red-700', bg: 'bg-red-100', hint: 'Não é mais necessário' },
}

const PONT_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; icon: any }> = {
  em_dia: { label: 'Em dia', color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-300', icon: CheckCircle },
  proximo: { label: 'Próximo do prazo', color: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-300', icon: Clock },
  atrasado: { label: 'Atrasado', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-300', icon: AlertTriangle },
  concluido: { label: 'Concluído', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-300', icon: CheckCircle2 },
  cancelado: { label: 'Cancelado', color: 'text-gray-500', bg: 'bg-gray-100', border: 'border-gray-300', icon: XCircle },
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

  const formatDateBR = (dateStr: string | null) => {
    if (!dateStr) return '-'
    const partes = dateStr.includes('T') ? dateStr.split('T')[0].split('-') : dateStr.split('-')
    if (partes.length !== 3) return dateStr
    return `${partes[2]}/${partes[1]}/${partes[0]}`
  }

  // Edit states
  const [editingProjeto, setEditingProjeto] = useState(false)
  const [editingEntrega, setEditingEntrega] = useState<number | null>(null)
  const [editingAtividade, setEditingAtividade] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<any>({})
  const [expanded, setExpanded] = useState<Record<number, boolean>>({})
  const [saving, setSaving] = useState(false)
  const [solicitacoes, setSolicitacoes] = useState<any[]>([])
  const [helpType, setHelpType] = useState<HelpType>(null)
  const [showNewEntregaForm, setShowNewEntregaForm] = useState(false)
  const [newEntregaForm, setNewEntregaForm] = useState<any>({})
  const [allExpanded, setAllExpanded] = useState(false)

  const [eligibleUsers, setEligibleUsers] = useState<{ id: string; nome: string; email: string }[]>([])
  const [showGestorModal, setShowGestorModal] = useState(false)

  const [modalOpen, setModalOpen] = useState(false)
  const [modalShowCheckbox, setModalShowCheckbox] = useState(false)

  useEffect(() => {
    const hideGuideline = localStorage.getItem('hideProjectGuideline')
    if (hideGuideline !== 'true') {
      setModalOpen(true)
      setModalShowCheckbox(true)
    }
  }, [])

  const openHelpModal = () => {
    setModalShowCheckbox(false)
    setModalOpen(true)
  }

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

    const { data: usersData } = await supabase.from('profiles')
      .select('id, nome, email')
      .in('role', ['gestor', 'master', 'admin'])
      .eq('ativo', true)
      .order('nome')
    if (usersData) setEligibleUsers(usersData)

    const { data: a } = await supabase.from('acoes_estrategicas').select('id, numero, nome').order('numero')
    if (a) setAcoes(a)

    const { data: proj } = await supabase.from('projetos')
      .select(`*, responsavel_id, data_inicio, setor_lider:setor_lider_id(codigo, nome_completo),
        projeto_acoes(acao_estrategica:acao_estrategica_id(id, numero, nome)),
        entregas(id, nome, descricao, criterios_aceite, dependencias_criticas, data_final_prevista, status, motivo_status, orgao_responsavel_setor_id, responsavel_entrega_id,
          entrega_participantes(id, setor_id, tipo_participante, papel, setor:setor_id(codigo, nome_completo)),
          atividades(id, nome, descricao, data_prevista, status, motivo_status, responsavel_atividade_id,
            atividade_participantes(id, setor_id, tipo_participante, papel, setor:setor_id(codigo, nome_completo))
          )
        )`)
      .eq('id', id).single()

    if (proj) {
      // Ordenar atividades por data (mais cedo primeiro, sem data por último)
      proj.entregas?.forEach((e: any) => e.atividades?.sort((a: any, b: any) => {
        if (!a.data_prevista && !b.data_prevista) return a.id - b.id
        if (!a.data_prevista) return 1
        if (!b.data_prevista) return -1
        return a.data_prevista.localeCompare(b.data_prevista)
      }))
      // Ordenar entregas pela data da primeira atividade (mais cedo primeiro, sem atividades por último)
      proj.entregas?.sort((a: any, b: any) => {
        const aFirst = a.atividades?.find((at: any) => at.data_prevista)?.data_prevista
        const bFirst = b.atividades?.find((at: any) => at.data_prevista)?.data_prevista
        if (!aFirst && !bFirst) return a.id - b.id
        if (!aFirst) return 1
        if (!bFirst) return -1
        return aFirst.localeCompare(bFirst)
      })
      setProjeto(proj)
      // Entregas recolhidas por padrão
      const exp: Record<number, boolean> = {}
      proj.entregas?.forEach((e: any) => { exp[e.id] = false })
      setExpanded(exp)

      // Carregar solicitações do projeto
      const { data: sols } = await supabase.from('solicitacoes_alteracao')
        .select('*').eq('projeto_id', id).order('created_at', { ascending: false })
      if (sols) setSolicitacoes(sols)
    }
    setLoading(false)
  }

  // Permission checks — granulares por tipo de entidade
  const isAdminOrMaster = profile?.role === 'admin' || profile?.role === 'master'
  const isGestorDoSetor = profile?.role === 'gestor' && profile.setor_id === projeto?.setor_lider_id

  // Projetos e Entregas
  const canCreateProjeto = isAdminOrMaster || (isGestorDoSetor && configs['proj_permitir_cadastro'] !== 'false')
  const canEditProjeto = isAdminOrMaster || (isGestorDoSetor && configs['proj_permitir_edicao'] !== 'false')

  // Atividades
  const canCreateAtividade = isAdminOrMaster || (isGestorDoSetor && configs['proj_permitir_cadastro_atividades'] !== 'false')
  const canEditAtividade = isAdminOrMaster || (isGestorDoSetor && configs['proj_permitir_edicao_atividades'] !== 'false')

  // Datas (independentes da edição geral)
  const canEditDataEntrega = isAdminOrMaster || (isGestorDoSetor && configs['proj_permitir_edicao_datas'] !== 'false')
  const canEditDataAtividade = isAdminOrMaster || (isGestorDoSetor && configs['proj_permitir_edicao_datas_atividades'] !== 'false')

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

  // Status do projeto (calculado a partir das entregas)
  const statusProjeto = useMemo(() => {
    const entregas = projeto?.entregas || []
    if (entregas.length === 0) return 'em_andamento'
    if (entregas.every((e: any) => e.status === 'cancelada')) return 'cancelado'
    if (entregas.every((e: any) => e.status === 'resolvida' || e.status === 'cancelada') && entregas.some((e: any) => e.status === 'resolvida')) return 'concluido'
    return 'em_andamento'
  }, [projeto])

  // Gestores precisam de aprovação para editar/excluir (somente se configuração = 'true')
  const needsApproval = !isAdminOrMaster && isGestorDoSetor && configs['proj_exigir_aprovacao_edicao'] === 'true'

  function hasPendingSolicitacao(tipoEntidade: string, entidadeId: number) {
    return solicitacoes.some(s => s.tipo_entidade === tipoEntidade && s.entidade_id === entidadeId && s.status === 'em_analise')
  }

  async function criarSolicitacao(tipoEntidade: string, entidadeId: number, entidadeNome: string, tipoOperacao: string, dadosAlteracao: any) {
    const { error } = await supabase.from('solicitacoes_alteracao').insert({
      solicitante_id: profile!.id,
      solicitante_nome: profile!.nome,
      tipo_entidade: tipoEntidade,
      entidade_id: entidadeId,
      entidade_nome: entidadeNome,
      projeto_id: projeto.id,
      tipo_operacao: tipoOperacao,
      dados_alteracao: dadosAlteracao,
    })
    if (error) { alert(`Erro ao criar solicitação: ${error.message}`); return false }
    alert('Solicitação enviada para o Gabinete de Gestão de Projetos para avaliação.')
    return true
  }

  async function cancelarSolicitacao(solId: number) {
    if (!confirm('Cancelar esta solicitação?')) return
    const { error } = await supabase.from('solicitacoes_alteracao')
      .update({ status: 'cancelada' }).eq('id', solId)
    if (error) { alert(error.message); return }
    loadAll()
  }

  async function auditLog(tipo: string, entidade: string, entidadeId: number, anterior: any, novo: any) {
    await supabase.from('audit_log').insert({
      usuario_id: profile!.id, usuario_nome: profile!.nome,
      tipo_acao: tipo, entidade, entidade_id: entidadeId,
      conteudo_anterior: anterior, conteudo_novo: novo
    })
  }

  // Project edit
  const TIPOS_ACAO = [
    'Prevenção', 'Mitigação', 'Preparação', 'Resposta', 'Recuperação', 
    'Gestão/Governança', 'Inovação', 'Integração'
  ]

  // Guard helpers — impedir edição simultânea
  function isAnyEditing() {
    return editingProjeto || editingEntrega !== null || editingAtividade !== null || showNewEntregaForm
  }
  function getEditingLabel() {
    if (editingProjeto) return 'o projeto'
    if (editingEntrega !== null) return 'uma entrega'
    if (editingAtividade !== null) return 'uma atividade'
    if (showNewEntregaForm) return 'uma nova entrega'
    return ''
  }

  function startEditProjeto() {
    // Cancelar qualquer edição ativa automaticamente
    if (editingEntrega !== null) setEditingEntrega(null)
    if (editingAtividade !== null) setEditingAtividade(null)
    if (showNewEntregaForm) setShowNewEntregaForm(false)
    setEditForm({
      nome: projeto.nome, descricao: projeto.descricao, problema_resolve: projeto.problema_resolve,
      responsavel_id: projeto.responsavel_id || '',
      data_inicio: projeto.data_inicio || '',
      indicador_sucesso: projeto.indicador_sucesso || '',
      dependencias_projetos: projeto.dependencias_projetos || '',
      tipo_acao: projeto.tipo_acao || [],
      setor_lider_id: projeto.setor_lider_id,
      acoes: projeto.projeto_acoes?.map((pa: any) => pa.acao_estrategica?.id) || []
    })
    setEditingProjeto(true)
  }

  async function saveEditProjeto() {
    setSaving(true)

    // R5: Se data_inicio mudou, validar contra datas de entregas e atividades
    if (editForm.data_inicio && editForm.data_inicio !== projeto.data_inicio) {
      const entregas = projeto.entregas || []
      for (const ent of entregas) {
        if (ent.data_final_prevista && ent.data_final_prevista < editForm.data_inicio) {
          alert(`A data de início não pode ser posterior à quinzena da entrega "${ent.nome}" (${ent.data_final_prevista}).`)
          setSaving(false); return
        }
        for (const ativ of (ent.atividades || [])) {
          if (ativ.data_prevista && ativ.data_prevista < editForm.data_inicio) {
            alert(`A data de início não pode ser posterior à data da atividade "${ativ.nome}" (${ativ.data_prevista}).`)
            setSaving(false); return
          }
        }
      }
    }

    if (needsApproval) {
      if (hasPendingSolicitacao('projeto', projeto.id)) {
        alert('Já existe uma solicitação pendente para este projeto. Aguarde a avaliação.')
        setSaving(false); return
      }
      const dados = {
        nome: editForm.nome, descricao: editForm.descricao, problema_resolve: editForm.problema_resolve,
        responsavel_id: editForm.responsavel_id || null,
        data_inicio: editForm.data_inicio || null,
        indicador_sucesso: editForm.indicador_sucesso?.trim() || null,
        dependencias_projetos: editForm.dependencias_projetos?.trim() || null,
        tipo_acao: editForm.tipo_acao?.length > 0 ? editForm.tipo_acao : null,
        setor_lider_id: editForm.setor_lider_id,
        acoes: editForm.acoes,
      }
      const ok = await criarSolicitacao('projeto', projeto.id, projeto.nome, 'edicao', dados)
      if (ok) { setEditingProjeto(false); loadAll() }
      setSaving(false); return
    }

    const novosDados = {
      nome: editForm.nome, descricao: editForm.descricao, problema_resolve: editForm.problema_resolve,
      responsavel_id: editForm.responsavel_id || null,
      data_inicio: editForm.data_inicio || null,
      indicador_sucesso: editForm.indicador_sucesso?.trim() || null,
      dependencias_projetos: editForm.dependencias_projetos?.trim() || null,
      tipo_acao: editForm.tipo_acao?.length > 0 ? editForm.tipo_acao : null,
      setor_lider_id: editForm.setor_lider_id,
    }
    const anterior = {
      nome: projeto.nome, descricao: projeto.descricao, problema_resolve: projeto.problema_resolve,
      responsavel_id: projeto.responsavel_id, data_inicio: projeto.data_inicio,
      indicador_sucesso: projeto.indicador_sucesso,
      dependencias_projetos: projeto.dependencias_projetos,
      tipo_acao: projeto.tipo_acao, setor_lider_id: projeto.setor_lider_id,
    }
    const { error } = await supabase.from('projetos').update(novosDados).eq('id', projeto.id)
    if (error) { alert(error.message); setSaving(false); return }

    await supabase.from('projeto_acoes').delete().eq('projeto_id', projeto.id)
    if (editForm.acoes.length > 0) {
      await supabase.from('projeto_acoes').insert(
        editForm.acoes.map((aid: number) => ({ projeto_id: projeto.id, acao_estrategica_id: aid })))
    }

    await auditLog('update', 'projeto', projeto.id, anterior, novosDados)
    setEditingProjeto(false); setSaving(false); loadAll()
  }

  async function deleteProject() {
    if (needsApproval) {
      if (hasPendingSolicitacao('projeto', projeto.id)) {
        alert('Já existe uma solicitação pendente para este projeto. Aguarde a avaliação.')
        return
      }
      if (!confirm(`Solicitar exclusão do projeto "${projeto.nome}"?\n\nA solicitação será enviada para avaliação.`)) return
      await criarSolicitacao('projeto', projeto.id, projeto.nome, 'exclusao', null)
      loadAll(); return
    }

    if (!confirm(`Excluir o projeto "${projeto.nome}"?\n\nTodas as entregas e atividades serão excluídas permanentemente.`)) return
    await auditLog('delete', 'projeto', projeto.id, { nome: projeto.nome }, null)
    await supabase.from('projetos').delete().eq('id', projeto.id)
    router.push('/dashboard/projetos')
  }

  // Entrega edit
  function startEditEntrega(e: any) {
    // Cancelar qualquer edição ativa automaticamente
    if (editingProjeto) setEditingProjeto(false)
    if (editingAtividade !== null) setEditingAtividade(null)
    if (showNewEntregaForm) setShowNewEntregaForm(false)
    if (editingEntrega !== null && editingEntrega !== e.id) setEditingEntrega(null)
    setEditForm({
      nome: e.nome, descricao: e.descricao, criterios_aceite: e.criterios_aceite || '',
      dependencias_criticas: e.dependencias_criticas || '',
      data_final_prevista: e.data_final_prevista || '', status: e.status, motivo_status: e.motivo_status || '',
      orgao_responsavel_setor_id: e.orgao_responsavel_setor_id || null,
      responsavel_entrega_id: e.responsavel_entrega_id || '',
      participantes: e.entrega_participantes?.map((p: any) => ({
        id: p.id, setor_id: p.setor_id, tipo_participante: p.tipo_participante, papel: p.papel
      })) || []
    })
    setEditingEntrega(e.id)
  }

  async function saveEditEntrega(entregaId: number) {
    setSaving(true)

    // Validate: participantes com papel preenchido
    const allParts = editForm.participantes || []
    for (const p of allParts) {
      if ((p.setor_id || p.tipo_participante !== 'setor') && !p.papel?.trim()) {
        alert('Preencha o papel de todos os participantes.')
        setSaving(false); return
      }
    }
    const validP = allParts.filter((p: any) => p.papel?.trim() && (p.setor_id || p.tipo_participante !== 'setor'))
    const pKeys = validP.map((p: any) => p.tipo_participante === 'setor' ? `s_${p.setor_id}` : p.tipo_participante)
    if (new Set(pKeys).size !== pKeys.length) {
      alert('Há participantes duplicados nesta entrega. Use o campo "papel" para múltiplos papéis do mesmo setor.')
      setSaving(false); return
    }

    // R5: Validate quinzena against projeto.data_inicio
    if (editForm.data_final_prevista && projeto.data_inicio && editForm.data_final_prevista < projeto.data_inicio) {
      alert(`A quinzena da entrega não pode ser anterior à data de início do projeto (${formatDateBR(projeto.data_inicio)}).`)
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

    // Regra 2.2: Não permitir status 'resolvida' se há atividades pendentes
    if (editForm.status === 'resolvida' && entrega?.atividades?.length > 0) {
      const pendentes = entrega.atividades.filter((a: any) =>
        a.status === 'aberta' || a.status === 'em_andamento' || a.status === 'aguardando'
      )
      if (pendentes.length > 0) {
        const nomes = pendentes.map((a: any) => `"${a.nome}"`).join(', ')
        alert(`Não é possível marcar esta entrega como resolvida. As seguintes atividades ainda não foram concluídas: ${nomes}. Resolva ou cancele essas atividades antes.`)
        setSaving(false); return
      }
    }

    if (needsApproval) {
      if (hasPendingSolicitacao('entrega', entregaId)) {
        alert('Já existe uma solicitação pendente para esta entrega. Aguarde a avaliação.')
        setSaving(false); return
      }
      const dados = {
        nome: editForm.nome, descricao: editForm.descricao,
        criterios_aceite: editForm.criterios_aceite?.trim() || null,
        dependencias_criticas: editForm.dependencias_criticas || null,
        data_final_prevista: editForm.data_final_prevista || null,
        status: editForm.status, motivo_status: editForm.motivo_status || null,
        orgao_responsavel_setor_id: editForm.orgao_responsavel_setor_id || null,
        responsavel_entrega_id: editForm.responsavel_entrega_id || null,
        participantes: validP.map((p: any) => ({
          setor_id: p.tipo_participante === 'setor' ? p.setor_id : null,
          tipo_participante: p.tipo_participante, papel: p.papel.trim()
        })),
      }
      const ok = await criarSolicitacao('entrega', entregaId, entrega?.nome || '', 'edicao', dados)
      if (ok) { setEditingEntrega(null); loadAll() }
      setSaving(false); return
    }

    const novosDadosE = {
      nome: editForm.nome, descricao: editForm.descricao,
      criterios_aceite: editForm.criterios_aceite?.trim() || null,
      dependencias_criticas: editForm.dependencias_criticas || null,
      data_final_prevista: editForm.data_final_prevista || null,
      status: editForm.status, motivo_status: editForm.motivo_status || null,
      orgao_responsavel_setor_id: editForm.orgao_responsavel_setor_id || null,
      responsavel_entrega_id: editForm.responsavel_entrega_id || null,
    }
    const anteriorE = {
      nome: entrega?.nome, descricao: entrega?.descricao,
      criterios_aceite: entrega?.criterios_aceite, dependencias_criticas: entrega?.dependencias_criticas,
      data_final_prevista: entrega?.data_final_prevista,
      status: entrega?.status, motivo_status: entrega?.motivo_status,
      orgao_responsavel_setor_id: entrega?.orgao_responsavel_setor_id,
      responsavel_entrega_id: entrega?.responsavel_entrega_id,
    }
    const { error } = await supabase.from('entregas').update(novosDadosE).eq('id', entregaId)
    if (error) { alert(error.message); setSaving(false); return }

    const { error: delPErr } = await supabase.from('entrega_participantes').delete().eq('entrega_id', entregaId)
    if (delPErr) { alert(`Erro ao atualizar participantes: ${delPErr.message}`); setSaving(false); return }
    if (validP.length > 0) {
      const { error: insPErr } = await supabase.from('entrega_participantes').insert(validP.map((p: any) => ({
        entrega_id: entregaId,
        setor_id: p.tipo_participante === 'setor' ? p.setor_id : null,
        tipo_participante: p.tipo_participante, papel: p.papel.trim()
      })))
      if (insPErr) { alert(`Erro ao salvar participantes: ${insPErr.message}`); setSaving(false); return }
    }

    await auditLog('update', 'entrega', entregaId, anteriorE, novosDadosE)
    setEditingEntrega(null); setSaving(false); loadAll()
  }

  async function deleteEntrega(e: any) {
    if (needsApproval) {
      if (hasPendingSolicitacao('entrega', e.id)) {
        alert('Já existe uma solicitação pendente para esta entrega. Aguarde a avaliação.')
        return
      }
      if (!confirm(`Solicitar exclusão da entrega "${e.nome}"?\n\nA solicitação será enviada para avaliação.`)) return
      await criarSolicitacao('entrega', e.id, e.nome, 'exclusao', null)
      loadAll(); return
    }

    if (!confirm(`Excluir a entrega "${e.nome}"?\n\nTodas as atividades desta entrega serão excluídas.`)) return
    await auditLog('delete', 'entrega', e.id, { nome: e.nome }, null)
    await supabase.from('entregas').delete().eq('id', e.id)
    loadAll()
  }

  function addNewEntrega() {
    // Cancelar qualquer edição ativa automaticamente
    if (editingProjeto) setEditingProjeto(false)
    if (editingEntrega !== null) setEditingEntrega(null)
    if (editingAtividade !== null) setEditingAtividade(null)
    setNewEntregaForm({
      nome: '', descricao: '', criterios_aceite: '', dependencias_criticas: '',
      data_final_prevista: '', status: 'aberta', motivo_status: '',
      orgao_responsavel_setor_id: null, responsavel_entrega_id: '',
      participantes: []
    })
    setShowNewEntregaForm(true)
  }

  async function saveNewEntrega() {
    setSaving(true)
    if (!newEntregaForm.nome?.trim()) { alert('Preencha o nome da entrega.'); setSaving(false); return }

    // Validate participantes
    const allParts = newEntregaForm.participantes || []
    for (const p of allParts) {
      if ((p.setor_id || p.tipo_participante !== 'setor') && !p.papel?.trim()) {
        alert('Preencha o papel de todos os participantes.'); setSaving(false); return
      }
    }
    const validP = allParts.filter((p: any) => p.papel?.trim() && (p.setor_id || p.tipo_participante !== 'setor'))
    const pKeys = validP.map((p: any) => p.tipo_participante === 'setor' ? `s_${p.setor_id}` : p.tipo_participante)
    if (new Set(pKeys).size !== pKeys.length) {
      alert('Há participantes duplicados nesta entrega.'); setSaving(false); return
    }

    // R5: Validate quinzena against projeto.data_inicio
    if (newEntregaForm.data_final_prevista && projeto.data_inicio && newEntregaForm.data_final_prevista < projeto.data_inicio) {
      alert(`A quinzena da entrega não pode ser anterior à data de início do projeto (${formatDateBR(projeto.data_inicio)}).`)
      setSaving(false); return
    }

    const { data, error } = await supabase.from('entregas').insert({
      projeto_id: projeto.id,
      nome: newEntregaForm.nome.trim(),
      descricao: newEntregaForm.descricao?.trim() || '',
      criterios_aceite: newEntregaForm.criterios_aceite?.trim() || null,
      dependencias_criticas: newEntregaForm.dependencias_criticas?.trim() || null,
      data_final_prevista: newEntregaForm.data_final_prevista || null,
      status: newEntregaForm.status,
      motivo_status: newEntregaForm.motivo_status?.trim() || null,
      orgao_responsavel_setor_id: newEntregaForm.orgao_responsavel_setor_id || null,
      responsavel_entrega_id: newEntregaForm.responsavel_entrega_id || null,
    }).select().single()
    if (error) { alert(error.message); setSaving(false); return }

    if (validP.length > 0) {
      const { error: insPErr } = await supabase.from('entrega_participantes').insert(validP.map((p: any) => ({
        entrega_id: data.id,
        setor_id: p.tipo_participante === 'setor' ? p.setor_id : null,
        tipo_participante: p.tipo_participante, papel: p.papel.trim()
      })))
      if (insPErr) { alert(`Erro ao salvar participantes: ${insPErr.message}`); setSaving(false); return }
    }

    await auditLog('create', 'entrega', data.id, null, { nome: newEntregaForm.nome, projeto_id: projeto.id })
    setShowNewEntregaForm(false)
    setSaving(false)
    loadAll()
  }

  // Atividade edit
  function startEditAtividade(a: any, entrega: any) {
    // Cancelar qualquer edição ativa automaticamente
    if (editingProjeto) setEditingProjeto(false)
    if (editingEntrega !== null) setEditingEntrega(null)
    if (showNewEntregaForm) setShowNewEntregaForm(false)
    if (editingAtividade !== null && editingAtividade !== a.id) setEditingAtividade(null)
    setEditForm({
      nome: a.nome, descricao: a.descricao, data_prevista: a.data_prevista || '',
      status: a.status || 'aberta', motivo_status: a.motivo_status || '',
      responsavel_atividade_id: a.responsavel_atividade_id || '',
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
    const isNew = editForm._isNew

    // Validações básicas
    if (!editForm.nome?.trim()) { alert('Preencha o nome da atividade.'); setSaving(false); return }
    if (!editForm.descricao?.trim()) { alert('Preencha a descrição da atividade.'); setSaving(false); return }

    // Validate date <= entrega quinzena
    if (editForm.data_prevista && editForm.entrega_data_final && editForm.data_prevista > editForm.entrega_data_final) {
      alert(`A data da atividade não pode ser posterior à quinzena da entrega (${editForm.entrega_data_final}).`)
      setSaving(false); return
    }

    // R5: Validate data_prevista against projeto.data_inicio
    if (editForm.data_prevista && projeto.data_inicio && editForm.data_prevista < projeto.data_inicio) {
      alert(`A data da atividade não pode ser anterior à data de início do projeto (${formatDateBR(projeto.data_inicio)}).`)
      setSaving(false); return
    }

    // Validate: participantes com papel preenchido
    const allP = editForm.participantes || []
    for (const p of allP) {
      if ((p.setor_id || p.tipo_participante !== 'setor') && !p.papel?.trim()) {
        alert('Preencha o papel de todos os participantes.')
        setSaving(false); return
      }
    }
    const validP = allP.filter((p: any) => p.papel?.trim() && (p.setor_id || p.tipo_participante !== 'setor'))

    // Validate: participantes are subset of entrega
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

    if (needsApproval && !isNew) {
      if (hasPendingSolicitacao('atividade', ativId)) {
        alert('Já existe uma solicitação pendente para esta atividade. Aguarde a avaliação.')
        setSaving(false); return
      }
      const ativ = projeto.entregas?.flatMap((e: any) => e.atividades || []).find((a: any) => a.id === ativId)
      const dados = {
        nome: editForm.nome, descricao: editForm.descricao,
        data_prevista: editForm.data_prevista || null,
        status: editForm.status, motivo_status: editForm.motivo_status || null,
        responsavel_atividade_id: editForm.responsavel_atividade_id || null,
        participantes: validP.map((p: any) => ({
          setor_id: p.tipo_participante === 'setor' ? p.setor_id : null,
          tipo_participante: p.tipo_participante, papel: p.papel.trim()
        })),
      }
      const ok = await criarSolicitacao('atividade', ativId, ativ?.nome || editForm.nome, 'edicao', dados)
      if (ok) { setEditingAtividade(null); loadAll() }
      setSaving(false); return
    }

    const novosDadosA = {
      nome: editForm.nome.trim(), descricao: editForm.descricao.trim(),
      data_prevista: editForm.data_prevista || null,
      status: editForm.status, motivo_status: editForm.motivo_status || null,
      responsavel_atividade_id: editForm.responsavel_atividade_id || null
    }

    let realAtivId = ativId
    if (isNew) {
      // Criar atividade no banco
      const { data: newAtiv, error } = await supabase.from('atividades').insert({
        entrega_id: entregaId, ...novosDadosA
      }).select().single()
      if (error) { alert(error.message); setSaving(false); return }
      realAtivId = newAtiv.id
      await auditLog('create', 'atividade', realAtivId, null, novosDadosA)
    } else {
      const ativAtual = projeto.entregas?.flatMap((e: any) => e.atividades || []).find((a: any) => a.id === ativId)
      const anteriorA = {
        nome: ativAtual?.nome, descricao: ativAtual?.descricao,
        data_prevista: ativAtual?.data_prevista, status: ativAtual?.status, motivo_status: ativAtual?.motivo_status,
      }
      const { error } = await supabase.from('atividades').update(novosDadosA).eq('id', ativId)
      if (error) { alert(error.message); setSaving(false); return }
      await auditLog('update', 'atividade', ativId, anteriorA, novosDadosA)
    }

    if (!isNew) {
      const { error: delAPErr } = await supabase.from('atividade_participantes').delete().eq('atividade_id', realAtivId)
      if (delAPErr) { alert(`Erro ao atualizar participantes: ${delAPErr.message}`); setSaving(false); return }
    }
    if (validP.length > 0) {
      const { error: insAPErr } = await supabase.from('atividade_participantes').insert(validP.map((p: any) => ({
        atividade_id: realAtivId,
        setor_id: p.tipo_participante === 'setor' ? p.setor_id : null,
        tipo_participante: p.tipo_participante, papel: p.papel.trim()
      })))
      if (insAPErr) { alert(`Erro ao salvar participantes: ${insAPErr.message}`); setSaving(false); return }
    }

    // Regras de coerência de status entrega ↔ atividades (somente para saves diretos, não para solicitações)
    if (!needsApproval || isNew) {
      const entrega = projeto.entregas.find((e: any) => e.id === entregaId)
      if (entrega) {
        const statusNaoTerminal = !['resolvida', 'cancelada'].includes(editForm.status)
        const entregaTerminal = entrega.status === 'resolvida' || entrega.status === 'cancelada'

        // Regra 4: Atividade não-terminal numa entrega terminal → reverter status da entrega
        if (entregaTerminal && statusNaoTerminal) {
          const ativAntes = isNew ? null : (entrega.atividades || []).find((a: any) => a.id === realAtivId)
          const antesEraTerminal = isNew || ['resolvida', 'cancelada'].includes(ativAntes?.status)
          if (antesEraTerminal) {
            await supabase.from('entregas').update({ status: 'em_andamento' }).eq('id', entregaId)
            await auditLog('update', 'entrega', entregaId, { status: entrega.status }, { status: 'em_andamento' })
            alert(`O status da entrega "${entrega.nome}" foi alterado de "${STATUS_ENTREGA[entrega.status].label}" para "Em andamento" pois ${isNew ? 'foi adicionada uma nova atividade' : 'uma atividade mudou para status não concluído'}.`)
          }
        }
        // Regra 2.1: Todas as atividades em status terminal → perguntar sobre a entrega
        else if (!entregaTerminal) {
          const atualTerminal = editForm.status === 'resolvida' || editForm.status === 'cancelada'
          if (atualTerminal) {
            const outras = (entrega.atividades || []).filter((a: any) => a.id !== realAtivId)
            const outrasTerminais = outras.every((a: any) => a.status === 'resolvida' || a.status === 'cancelada')

            if (outrasTerminais) {
              const temResolvida = editForm.status === 'resolvida' || outras.some((a: any) => a.status === 'resolvida')
              const todasCanceladas = editForm.status === 'cancelada' && outras.every((a: any) => a.status === 'cancelada')

              if (todasCanceladas) {
                const confirma = confirm('Todas as atividades desta entrega foram canceladas. Deseja cancelar a entrega também?')
                if (confirma) {
                  await supabase.from('entregas').update({ status: 'cancelada' }).eq('id', entregaId)
                  await auditLog('update', 'entrega', entregaId, { status: entrega.status }, { status: 'cancelada' })
                } else {
                  alert('Entendido. Quando possível, crie uma nova atividade para esta entrega.')
                }
              } else if (temResolvida) {
                const confirma = confirm('Todas as atividades desta entrega estão concluídas. Deseja marcar a entrega como resolvida também?')
                if (confirma) {
                  await supabase.from('entregas').update({ status: 'resolvida' }).eq('id', entregaId)
                  await auditLog('update', 'entrega', entregaId, { status: entrega.status }, { status: 'resolvida' })
                } else {
                  alert('Entendido. Quando possível, crie a atividade que falta para que a entrega possa ser considerada resolvida.')
                }
              }
            }
          }
        }
      }
    }

    setEditingAtividade(null); setSaving(false); loadAll()
  }

  async function deleteAtividade(a: any) {
    if (needsApproval) {
      if (hasPendingSolicitacao('atividade', a.id)) {
        alert('Já existe uma solicitação pendente para esta atividade. Aguarde a avaliação.')
        return
      }
      if (!confirm(`Solicitar exclusão da atividade "${a.nome}"?\n\nA solicitação será enviada para avaliação.`)) return
      await criarSolicitacao('atividade', a.id, a.nome, 'exclusao', null)
      loadAll(); return
    }

    if (!confirm(`Excluir a atividade "${a.nome}"?`)) return
    await auditLog('delete', 'atividade', a.id, { nome: a.nome }, null)
    await supabase.from('atividades').delete().eq('id', a.id)
    loadAll()
  }

  function addNewAtividade(entregaId: number) {
    // Cancelar qualquer edição ativa automaticamente
    if (editingProjeto) setEditingProjeto(false)
    if (editingEntrega !== null) setEditingEntrega(null)
    if (showNewEntregaForm) setShowNewEntregaForm(false)
    if (editingAtividade !== null) setEditingAtividade(null)
    const entrega = projeto.entregas.find((e: any) => e.id === entregaId)
    setEditForm({
      nome: '', descricao: '', data_prevista: '',
      status: 'aberta', motivo_status: '',
      responsavel_atividade_id: '',
      entrega_data_final: entrega?.data_final_prevista || '',
      entrega_participantes: entrega?.entrega_participantes || [],
      participantes: [],
      _isNew: true, _entregaId: entregaId
    })
    setEditingAtividade(-entregaId) // Negativo para indicar nova atividade
  }

  function toggleExpandAll() {
    const newVal = !allExpanded
    setAllExpanded(newVal)
    const exp: Record<number, boolean> = {}
    projeto.entregas?.forEach((e: any) => { exp[e.id] = newVal })
    setExpanded(exp)
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

  const pontKey = statusProjeto !== 'em_andamento' ? statusProjeto : pontualidade
  const pont = PONT_CONFIG[pontKey]
  const PontIcon = pont.icon

  return (
    <div>
      <ProjectGuidelineModal isOpen={modalOpen} onClose={() => setModalOpen(false)} showCheckbox={modalShowCheckbox} />
      <HelpTooltipModal type={helpType} onClose={() => setHelpType(null)} />
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => router.push('/dashboard/projetos')}
          className="flex items-center gap-2 text-sm text-sedec-500 hover:text-sedec-700">
          <ArrowLeft size={16} /> Voltar aos projetos
        </button>
        {canCreateProjeto && (
          <button onClick={() => router.push('/dashboard/projetos/novo')}
            className="flex items-center gap-1.5 text-sm bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg font-medium transition-colors">
            <Plus size={15} /> Novo projeto
          </button>
        )}
      </div>

      {/* Header do projeto */}
      <div className={`bg-white rounded-xl border overflow-hidden mb-6 ${editingProjeto ? 'border-blue-400 ring-2 ring-blue-100 shadow-md' : 'border-gray-200'}`}>
        <div className={`h-1 ${pont.bg === 'bg-green-50' ? 'bg-green-400' : pont.bg === 'bg-yellow-50' ? 'bg-yellow-400' : 'bg-red-400'}`} />
        <div className={`p-6 ${editingProjeto ? 'bg-blue-50/20' : ''}`}>
          {editingProjeto ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Nome do projeto</label>
                  <input type="text" value={editForm.nome} onChange={e => setEditForm({ ...editForm, nome: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all font-bold text-gray-800" />
                </div>
                
                {isAdminOrMaster && (
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Setor líder</label>
                    <select value={editForm.setor_lider_id} onChange={e => setEditForm({ ...editForm, setor_lider_id: parseInt(e.target.value) })} 
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-sm">
                      {setores.map((s: any) => <option key={s.id} value={s.id}>{s.codigo} — {s.nome_completo}</option>)}
                    </select>
                  </div>
                )}
                
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Líder do projeto *</label>
                    <button type="button" onClick={openHelpModal} className="text-gray-400 hover:text-orange-500 transition-colors"><HelpCircle size={13} /></button>
                  </div>
                  <UserAutocompleteSelect
                    value={editForm.responsavel_id}
                    onChange={val => setEditForm({...editForm, responsavel_id: val})}
                    users={eligibleUsers}
                    placeholder="Selecione o líder..."
                    required
                    disabled={!canEditProjeto}
                    onRegisterNew={() => setShowGestorModal(true)}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Data de início</label>
                  <input type="date" value={editForm.data_inicio || ''} onChange={e => setEditForm({ ...editForm, data_inicio: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-sm text-gray-700" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-blue-100/50">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Problema que soluciona — Por quê</label>
                    <button type="button" onClick={openHelpModal} className="text-gray-400 hover:text-orange-500 transition-colors"><HelpCircle size={13} /></button>
                  </div>
                  <textarea value={editForm.problema_resolve} onChange={e => setEditForm({ ...editForm, problema_resolve: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-sm text-gray-700 resize-none leading-relaxed" rows={4} placeholder="Qual problema concreto este projeto resolve?" />
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Descrição da solução proposta — O quê</label>
                    <button type="button" onClick={openHelpModal} className="text-gray-400 hover:text-orange-500 transition-colors"><HelpCircle size={13} /></button>
                  </div>
                  <textarea value={editForm.descricao} onChange={e => setEditForm({ ...editForm, descricao: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-sm text-gray-700 resize-none leading-relaxed" rows={4} placeholder="Descreva o que este projeto entregará" />
                </div>
                
                <div className="md:col-span-2">
                  <div className="flex items-center gap-2 mb-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Indicador(es) de sucesso</label>
                    <button type="button" onClick={openHelpModal} className="text-gray-400 hover:text-orange-500 transition-colors"><HelpCircle size={13} /></button>
                  </div>
                  <textarea value={editForm.indicador_sucesso || ''} onChange={e => setEditForm({ ...editForm, indicador_sucesso: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-sm text-gray-700 resize-none leading-relaxed" rows={3} placeholder="Sugestão de indicador de sucesso (opcional)" />
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Dependências com outros projetos</label>
                  <textarea value={editForm.dependencias_projetos || ''} onChange={e => setEditForm({ ...editForm, dependencias_projetos: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-sm text-gray-700 resize-none leading-relaxed" rows={2} placeholder="Ex: Projeto X depende desse projeto ou Esse projeto depende do projeto X" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-blue-100/50">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">Ações estratégicas vinculadas</label>
                  <div className="max-h-56 overflow-y-auto border border-gray-200 rounded-xl p-2 space-y-1 bg-white">
                    {acoes.map((a: any) => (
                      <label key={a.id} className="flex items-start gap-3 text-sm p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                        <input type="checkbox" checked={editForm.acoes?.includes(a.id)}
                          onChange={() => setEditForm((prev: any) => ({
                            ...prev, acoes: prev.acoes.includes(a.id) ? prev.acoes.filter((x: number) => x !== a.id) : [...prev.acoes, a.id]
                          }))} className="mt-0.5 rounded border-gray-300 text-orange-500 focus:ring-orange-500" />
                        <div>
                          <span className="font-bold text-sedec-600 block">AE {a.numero}</span>
                          <span className="text-gray-600 leading-snug">{a.nome}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">Tipo de ação</label>
                  <div className="flex flex-wrap gap-2 border border-gray-200 rounded-xl p-4 bg-white">
                    {TIPOS_ACAO.map(tipo => (
                      <label key={tipo} className="flex items-center gap-2 text-sm bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg cursor-pointer hover:border-orange-300 hover:bg-orange-50 transition-all">
                        <input type="checkbox" checked={editForm.tipo_acao?.includes(tipo) || false}
                          onChange={() => setEditForm((prev: any) => ({
                            ...prev, tipo_acao: prev.tipo_acao?.includes(tipo) ? prev.tipo_acao.filter((t: string) => t !== tipo) : [...(prev.tipo_acao || []), tipo]
                          }))} className="rounded border-gray-300 text-orange-500 focus:ring-orange-500" />
                        <span className="text-gray-700 font-medium">{tipo}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-blue-100/50">
                <button onClick={saveEditProjeto} disabled={saving}
                  className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50"><Save size={16} /> Salvar alterações</button>
                <button onClick={() => setEditingProjeto(false)}
                  className="flex items-center gap-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 px-5 py-2.5 rounded-lg font-medium transition-colors"><X size={16} /> Cancelar</button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1">
                  <div className="mb-2 w-full pr-4">
                    <h1 className="text-xl font-bold text-gray-800 inline leading-tight align-middle">{projeto.nome}</h1>
                    <button type="button" onClick={() => setHelpType('projeto')} className="inline-flex align-middle ml-2 text-gray-400 hover:text-orange-500 transition-colors" title="O que é um Projeto?">
                      <HelpCircle size={18} />
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded font-medium border border-gray-200">
                      {projeto.setor_lider?.codigo} — {projeto.setor_lider?.nome_completo}
                    </span>
                    <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium ${pont.bg} ${pont.color}`}>
                      <PontIcon size={12} /> {pont.label}
                    </span>
                  </div>
                </div>
                {hasPendingSolicitacao('projeto', projeto.id) && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-amber-100 text-amber-700 animate-pulse">Aguardando aprovação</span>
                )}
                {canEditProjeto && (
                  <div className="flex gap-2 shrink-0">
                    <button onClick={startEditProjeto} className="flex items-center gap-1 text-sm bg-blue-50 text-blue-600 px-2.5 py-1.5 rounded-lg hover:bg-blue-100 transition-colors font-medium" title="Editar"><Edit3 size={15} /> Editar</button>
                    {(isAdminOrMaster || canEditProjeto) && (
                      <button onClick={deleteProject} className="flex items-center gap-1 text-sm bg-red-50 text-red-600 px-2.5 py-1.5 rounded-lg hover:bg-red-100 transition-colors font-medium" title="Excluir"><Trash2 size={15} /> Excluir</button>
                    )}
                  </div>
                )}
              </div>

              {(projeto.responsavel_id || projeto.data_inicio) && (
                <div className="mb-5 flex flex-wrap gap-x-6 gap-y-1">
                  {projeto.responsavel_id && (
                    <p className="text-sm text-gray-600"><span className="font-semibold text-gray-700">Líder:</span> {eligibleUsers.find(u => u.id === projeto.responsavel_id)?.nome || '—'}</p>
                  )}
                  {projeto.data_inicio && (
                    <p className="text-sm text-gray-600"><span className="font-semibold text-gray-700">Início:</span> {formatDateBR(projeto.data_inicio)}</p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-sm">
                  <h3 className="font-bold text-gray-800 flex items-center gap-1.5 mb-1.5"><AlertTriangle size={15} className="text-orange-500" /> Problema que soluciona — Por quê</h3>
                  <ul className="space-y-1.5 mt-2">
                    {projeto.problema_resolve?.split('\n').filter((line: string) => line.trim() !== '').map((line: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-orange-500 font-bold mt-0.5">•</span>
                        <span className="text-gray-700 leading-relaxed">{line}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-sm">
                  <h3 className="font-bold text-gray-800 flex items-center gap-1.5 mb-1.5"><CheckCircle size={15} className="text-blue-500" /> Descrição da solução proposta — O quê</h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{projeto.descricao}</p>
                </div>
              </div>

              {projeto.indicador_sucesso && (
                <div className="mb-5 bg-green-50/50 rounded-xl p-4 border border-green-100 text-sm">
                  <h3 className="font-bold text-green-800 flex items-center gap-1.5 mb-1.5">🎯 Indicador(es) de sucesso</h3>
                  <ul className="space-y-1.5 mt-2">
                    {projeto.indicador_sucesso?.split('\n').filter((line: string) => line.trim() !== '').map((line: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-green-600 font-bold mt-0.5">•</span>
                        <span className="text-gray-700 leading-relaxed">{line}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {projeto.dependencias_projetos && (
                <div className="mb-5 bg-purple-50/50 rounded-xl p-4 border border-purple-100 text-sm">
                  <h3 className="font-bold text-purple-800 flex items-center gap-1.5 mb-1.5">🔗 Dependências com outros projetos</h3>
                  <ul className="space-y-1.5 mt-2">
                    {projeto.dependencias_projetos.split('\n').filter((line: string) => line.trim() !== '').map((line: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-purple-600 font-bold mt-0.5">•</span>
                        <span className="text-gray-700 leading-relaxed">{line}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 pt-5 border-t border-gray-100">
                <div className="flex flex-col gap-3">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5"><ListPlus size={14} /> Ações estratégicas vinculadas</h3>
                  <div className="flex flex-col gap-2">
                    {projeto.projeto_acoes?.map((pa: any) => (
                      <div key={pa.acao_estrategica?.id} className="bg-white border border-gray-200 text-gray-700 px-3 py-2.5 rounded-lg text-sm flex items-start gap-3 shadow-sm transition-all hover:bg-gray-50">
                        <span className="font-bold text-sedec-600 shrink-0 bg-sedec-50 px-2 py-0.5 rounded text-xs border border-sedec-100 mt-0.5">AE {pa.acao_estrategica?.numero}</span>
                        <span className="leading-snug">{pa.acao_estrategica?.nome}</span>
                      </div>
                    ))}
                    {(!projeto.projeto_acoes || projeto.projeto_acoes.length === 0) && (
                      <span className="text-sm text-gray-400 italic">Nenhuma ação vinculada.</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5"><PackagePlus size={14} /> Tipo de Ação</h3>
                  {projeto.tipo_acao && projeto.tipo_acao.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {projeto.tipo_acao.map((tipo: string) => (
                        <span key={tipo} className="bg-purple-50 text-purple-700 border border-purple-100 px-2.5 py-1.5 rounded-md text-xs font-semibold shadow-sm">
                          {tipo}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400 italic">Nenhum tipo definido.</span>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Gantt Chart */}
      {projeto.entregas?.some((e: any) => e.data_final_prevista) && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Cronograma de Entregas</h2>
          <GanttChart entregas={projeto.entregas} dataInicio={projeto.data_inicio} />
        </div>
      )}

      {/* Entregas + Atividades */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-gray-700">Entregas</h2>
          <button type="button" onClick={() => setHelpType('entrega')} className="text-gray-400 hover:text-orange-500 transition-colors" title="O que é uma Entrega?"><HelpCircle size={16} /></button>
          {projeto.entregas?.length > 0 && (
            <button onClick={toggleExpandAll}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 ml-2 px-2 py-1 rounded hover:bg-gray-100 transition-colors">
              {allExpanded ? <><ChevronUp size={14} /> Recolher todas</> : <><ChevronDown size={14} /> Expandir todas</>}
            </button>
          )}
        </div>
        {canCreateProjeto && (
          <button onClick={addNewEntrega}
            className="flex items-center gap-1.5 text-sm text-orange-600 hover:text-orange-700 font-medium">
            <PackagePlus size={16} /> Nova entrega
          </button>
        )}
      </div>

      {/* Formulário de nova entrega (inline, no topo) */}
      {showNewEntregaForm && (
        <div className="mb-4 bg-white rounded-xl border-2 border-blue-400 ring-2 ring-blue-100 shadow-md overflow-hidden">
          <div className="p-4 bg-blue-50/30">
            <div className="space-y-3">
              <p className="text-sm font-bold text-blue-800 mb-2">Nova entrega</p>
              <div>
                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide block mb-1">Nome *</label>
                <input type="text" value={newEntregaForm.nome} onChange={ev => setNewEntregaForm({ ...newEntregaForm, nome: ev.target.value })}
                  className="input-field text-sm" placeholder="Nome da entrega" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide block mb-1">Descrição</label>
                <textarea value={newEntregaForm.descricao} onChange={ev => setNewEntregaForm({ ...newEntregaForm, descricao: ev.target.value })}
                  className="input-field text-sm resize-none" rows={2} placeholder="Descreva esta entrega" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide block mb-1">Critérios de aceite</label>
                <textarea value={newEntregaForm.criterios_aceite || ''}
                  onChange={ev => setNewEntregaForm({ ...newEntregaForm, criterios_aceite: ev.target.value })}
                  placeholder="Minuta apresentada e aprovada pelo Superintendente" className="input-field text-xs resize-none" rows={2} />
              </div>

              {/* Órgão responsável + Responsável */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide block mb-1">Órgão responsável</label>
                  <select
                    value={newEntregaForm.orgao_responsavel_setor_id || ''}
                    onChange={ev => setNewEntregaForm({ ...newEntregaForm, orgao_responsavel_setor_id: ev.target.value ? parseInt(ev.target.value) : null })}
                    className="input-field text-xs">
                    <option value="">Selecione...</option>
                    {(newEntregaForm.participantes || [])
                      .filter((p: any) => p.tipo_participante === 'setor' && p.setor_id && p.papel?.trim())
                      .map((p: any) => {
                        const s = setores.find((ss: any) => ss.id === p.setor_id)
                        return s ? <option key={s.id} value={s.id}>{s.codigo} — {s.nome_completo}</option> : null
                      })}
                  </select>
                  {(newEntregaForm.participantes || []).filter((p: any) => p.tipo_participante === 'setor' && p.setor_id && p.papel?.trim()).length === 0 && (
                    <p className="text-[10px] text-gray-400 mt-1 italic">Adicione participantes tipo setor primeiro.</p>
                  )}
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide block mb-1">Responsável pela entrega</label>
                  <UserAutocompleteSelect
                    value={newEntregaForm.responsavel_entrega_id}
                    onChange={val => setNewEntregaForm({...newEntregaForm, responsavel_entrega_id: val})}
                    users={eligibleUsers}
                    placeholder="Selecione o responsável..."
                    onRegisterNew={() => setShowGestorModal(true)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-end gap-3">
                  <div className="min-w-[160px]">
                    <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide block mb-1">Status</label>
                    <select value={newEntregaForm.status} onChange={ev => setNewEntregaForm({ ...newEntregaForm, status: ev.target.value })}
                      className={`w-full px-3 py-2 rounded-lg text-xs font-medium border-2 focus:outline-none focus:ring-2 focus:ring-sedec-500 ${
                        newEntregaForm.status === 'resolvida' ? 'border-green-400 bg-green-50 text-green-800' :
                        newEntregaForm.status === 'cancelada' ? 'border-red-300 bg-red-50 text-red-800' :
                        newEntregaForm.status === 'em_andamento' ? 'border-blue-300 bg-blue-50 text-blue-800' :
                        newEntregaForm.status === 'aguardando' ? 'border-yellow-300 bg-yellow-50 text-yellow-800' :
                        'border-gray-300 bg-white text-gray-700'
                      }`}>
                      {Object.entries(STATUS_ENTREGA).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                  </div>
                  <div className="w-[180px]">
                    <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide block mb-1">Quinzena</label>
                    <select value={newEntregaForm.data_final_prevista}
                      onChange={ev => setNewEntregaForm({ ...newEntregaForm, data_final_prevista: ev.target.value })}
                      className="w-full input-field text-xs">
                      <option value="">Sem prazo</option>
                      {QUINZENAS.map(q => <option key={q.value} value={q.value}>{q.label}</option>)}
                    </select>
                  </div>
                  <div className="flex-1 min-w-[180px]">
                    <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide block mb-1">Motivo do status</label>
                    <input type="text" value={newEntregaForm.motivo_status} onChange={ev => setNewEntregaForm({ ...newEntregaForm, motivo_status: ev.target.value })}
                      placeholder="Opcional" className="input-field text-xs" />
                  </div>
                </div>
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] ${
                  newEntregaForm.status === 'aguardando' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                  newEntregaForm.status === 'em_andamento' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                  newEntregaForm.status === 'resolvida' ? 'bg-green-50 text-green-600 border border-green-100' :
                  newEntregaForm.status === 'cancelada' ? 'bg-red-50 text-red-500 border border-red-100' :
                  'bg-gray-50 text-gray-500 border border-gray-100'
                }`}>
                  <Info size={12} className="shrink-0" />
                  <span>{STATUS_ENTREGA[newEntregaForm.status]?.hint}</span>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide block mb-1">Dependências críticas</label>
                <textarea value={newEntregaForm.dependencias_criticas}
                  onChange={ev => setNewEntregaForm({ ...newEntregaForm, dependencias_criticas: ev.target.value })}
                  placeholder="Ex: Depende de aprovação do projeto de lei XPTO" className="input-field text-xs resize-none leading-relaxed" rows={3} />
                <p className="text-[10px] text-amber-600 mt-1">Caso haja alguma dependência crítica que dependa de outro setor, ajuste com ele antes de inserí-la.</p>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-gray-600">Participantes</span>
                  <button type="button" onClick={() => setNewEntregaForm((prev: any) => ({
                    ...prev, participantes: [...prev.participantes, { setor_id: null, tipo_participante: 'setor', papel: '' }]
                  }))} className="text-[11px] text-orange-500 font-medium">+ Participante</button>
                </div>
                {newEntregaForm.participantes?.map((p: any, i: number) =>
                  renderEntregaParticipanteEditRow(p, i, newEntregaForm.participantes,
                    (idx, f, v) => setNewEntregaForm((prev: any) => ({
                      ...prev, participantes: prev.participantes.map((pp: any, j: number) => j === idx ? { ...pp, [f]: v } : pp)
                    })),
                    (idx) => { if (confirm('Remover participante?')) setNewEntregaForm((prev: any) => ({
                      ...prev, participantes: prev.participantes.filter((_: any, j: number) => j !== idx)
                    })) }
                  )
                )}
              </div>
              <div className="flex gap-2">
                <button onClick={saveNewEntrega} disabled={saving}
                  className="flex items-center gap-1 text-xs bg-green-500 text-white px-3 py-1.5 rounded-lg"><Save size={13} /> Salvar</button>
                <button onClick={() => setShowNewEntregaForm(false)}
                  className="flex items-center gap-1 text-xs text-gray-500 px-3 py-1.5"><X size={13} /> Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {(!projeto.entregas || projeto.entregas.length === 0) && !showNewEntregaForm && (
        <div className="text-center py-8 text-gray-400 text-sm">Nenhuma entrega cadastrada.</div>
      )}

      <div className="space-y-6">
        {projeto.entregas?.map((e: any, entregaIndex: number) => {
          const isEditing = editingEntrega === e.id
          const now = new Date(); now.setHours(0, 0, 0, 0)
          const isAtrasada = e.data_final_prevista && e.status !== 'resolvida' && e.status !== 'cancelada' && new Date(e.data_final_prevista) < now
          const st = STATUS_ENTREGA[e.status] || STATUS_ENTREGA.aberta

          return (
            <div key={e.id} className={`bg-white rounded-xl border overflow-hidden ${
              isEditing ? 'border-blue-400 ring-2 ring-blue-100 shadow-md' : isAtrasada ? 'border-red-300' : 'border-gray-200'
            }`}>
              {/* Entrega header */}
              <div className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 ${isEditing ? 'bg-blue-50/50' : ''}`}
                onClick={() => {
                  if (isEditing) {
                    setEditingEntrega(null)
                    setEditingAtividade(null)
                  } else {
                    if (expanded[e.id]) {
                      // Ao colapsar, limpar edição de atividade dentro desta entrega
                      setEditingAtividade(null)
                    }
                    setExpanded(prev => ({ ...prev, [e.id]: !prev[e.id] }))
                  }
                }}>
                <div className="w-7 h-7 rounded-full bg-sedec-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  {entregaIndex + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold text-gray-800">{e.nome}</h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${st.bg} ${st.color}`}>{st.label}</span>
                    {isAtrasada && <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-red-100 text-red-700">Atrasada</span>}
                    {hasPendingSolicitacao('entrega', e.id) && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-amber-100 text-amber-700 animate-pulse">Aguardando aprovação</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                    {e.data_final_prevista && <span>Prazo: {formatQuinzena(e.data_final_prevista)}</span>}
                    <span>{e.atividades?.length || 0} atividade(s)</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {(canEditProjeto || canEditDataEntrega) && (
                    <>
                      <button onClick={(ev) => { ev.stopPropagation(); isEditing ? setEditingEntrega(null) : startEditEntrega(e) }}
                        className="text-gray-400 hover:text-orange-500"><Edit3 size={15} /></button>
                      {canEditProjeto && <button onClick={(ev) => { ev.stopPropagation(); deleteEntrega(e) }}
                        className="text-gray-400 hover:text-red-500"><Trash2 size={15} /></button>}
                    </>
                  )}
                  {expanded[e.id] ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                </div>
              </div>

              {/* Entrega expanded content */}
              {(expanded[e.id] || isEditing) && (
                <div className={`border-t p-4 ${isEditing ? 'border-blue-200 bg-blue-50/30' : 'border-gray-100'}`}>
                  {isEditing ? (
                    <div className="space-y-3">
                      {(() => { return (<>
                      <div>
                        <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide block mb-1">Nome</label>
                        <input type="text" value={editForm.nome} onChange={ev => setEditForm({ ...editForm, nome: ev.target.value })}
                          disabled={!canEditProjeto} className="input-field text-sm" placeholder="Nome da entrega" />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide block mb-1">Descrição</label>
                        <textarea value={editForm.descricao} onChange={ev => setEditForm({ ...editForm, descricao: ev.target.value })}
                          disabled={!canEditProjeto} className="input-field text-sm resize-none" rows={2} placeholder="Descreva esta entrega" />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide block mb-1">Critérios de aceite</label>
                        <textarea value={editForm.criterios_aceite || ''}
                          onChange={ev => setEditForm({ ...editForm, criterios_aceite: ev.target.value })}
                          disabled={!canEditProjeto} placeholder="Minuta apresentada e aprovada pelo Superintendente" className="input-field text-xs resize-none" rows={2} />
                      </div>

                      {/* Órgão responsável + Responsável */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide block mb-1">Órgão responsável</label>
                          <select
                            value={editForm.orgao_responsavel_setor_id || ''}
                            onChange={ev => setEditForm({ ...editForm, orgao_responsavel_setor_id: ev.target.value ? parseInt(ev.target.value) : null })}
                            disabled={!canEditProjeto}
                            className="input-field text-xs">
                            <option value="">Selecione...</option>
                            {(editForm.participantes || [])
                              .filter((p: any) => p.tipo_participante === 'setor' && p.setor_id && p.papel?.trim())
                              .map((p: any) => {
                                const s = setores.find((ss: any) => ss.id === p.setor_id)
                                return s ? <option key={s.id} value={s.id}>{s.codigo} — {s.nome_completo}</option> : null
                              })}
                          </select>
                          {(editForm.participantes || []).filter((p: any) => p.tipo_participante === 'setor' && p.setor_id && p.papel?.trim()).length === 0 && (
                            <p className="text-[10px] text-gray-400 mt-1 italic">Adicione participantes tipo setor primeiro.</p>
                          )}
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide block mb-1">Responsável pela entrega</label>
                          <UserAutocompleteSelect
                            value={editForm.responsavel_entrega_id}
                            onChange={val => setEditForm({...editForm, responsavel_entrega_id: val})}
                            users={eligibleUsers}
                            placeholder="Selecione o responsável..."
                            disabled={!canEditProjeto}
                            onRegisterNew={() => setShowGestorModal(true)}
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-end gap-3">
                          {/* Status — destaque visual */}
                          <div className="min-w-[160px]">
                            <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide block mb-1">Status</label>
                            <select value={editForm.status} onChange={ev => setEditForm({ ...editForm, status: ev.target.value })}
                              disabled={!canEditProjeto}
                              className={`w-full px-3 py-2 rounded-lg text-xs font-medium border-2 focus:outline-none focus:ring-2 focus:ring-sedec-500 ${
                                editForm.status === 'resolvida' ? 'border-green-400 bg-green-50 text-green-800' :
                                editForm.status === 'cancelada' ? 'border-red-300 bg-red-50 text-red-800' :
                                editForm.status === 'em_andamento' ? 'border-blue-300 bg-blue-50 text-blue-800' :
                                editForm.status === 'aguardando' ? 'border-yellow-300 bg-yellow-50 text-yellow-800' :
                                'border-gray-300 bg-white text-gray-700'
                              }`}>
                              {Object.entries(STATUS_ENTREGA).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                            </select>
                          </div>

                          {/* Quinzena — compacto */}
                          <div className="w-[180px]">
                            <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide block mb-1">Quinzena</label>
                            <select value={editForm.data_final_prevista}
                              onChange={ev => setEditForm({ ...editForm, data_final_prevista: ev.target.value })}
                              disabled={!canEditDataEntrega}
                              className="w-full input-field text-xs">
                              <option value="">Sem prazo</option>
                              {QUINZENAS.map(q => <option key={q.value} value={q.value}>{q.label}</option>)}
                            </select>
                          </div>

                          {/* Motivo */}
                          <div className="flex-1 min-w-[180px]">
                            <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide block mb-1">Motivo do status</label>
                            <input type="text" value={editForm.motivo_status} onChange={ev => setEditForm({ ...editForm, motivo_status: ev.target.value })}
                              disabled={!canEditProjeto} placeholder="Opcional" className="input-field text-xs" />
                          </div>
                        </div>
                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] ${
                          editForm.status === 'aguardando' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          editForm.status === 'em_andamento' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                          editForm.status === 'resolvida' ? 'bg-green-50 text-green-600 border border-green-100' :
                          editForm.status === 'cancelada' ? 'bg-red-50 text-red-500 border border-red-100' :
                          'bg-gray-50 text-gray-500 border border-gray-100'
                        }`}>
                          <Info size={12} className="shrink-0" />
                          <span>{STATUS_ENTREGA[editForm.status]?.hint}</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide block mb-1">Dependências críticas</label>
                        <textarea value={editForm.dependencias_criticas}
                          onChange={ev => setEditForm({ ...editForm, dependencias_criticas: ev.target.value })}
                          disabled={!canEditProjeto} placeholder="Ex: Depende de aprovação do projeto de lei XPTO" className="input-field text-xs resize-none leading-relaxed" rows={3} />
                        <p className="text-[10px] text-amber-600 mt-1">Caso haja alguma dependência crítica que dependa de outro setor, ajuste com ele antes de inserí-la.</p>
                      </div>

                      {/* Participantes */}
                      {canEditProjeto && (
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
                      )}

                      <div className="flex gap-2">
                        <button onClick={() => saveEditEntrega(e.id)} disabled={saving}
                          className="flex items-center gap-1 text-xs bg-green-500 text-white px-3 py-1.5 rounded-lg"><Save size={13} /> Salvar</button>
                        <button onClick={() => setEditingEntrega(null)}
                          className="flex items-center gap-1 text-xs text-gray-500 px-3 py-1.5"><X size={13} /> Cancelar</button>
                      </div>
                      </>)})()}
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-gray-600 mb-3">{e.descricao}</p>
                      {e.criterios_aceite && (
                        <div className="mb-3">
                          <span className="text-sm font-semibold text-gray-700 block mb-1">Critérios de aceite:</span>
                          <ul className="space-y-1">
                            {e.criterios_aceite.split('\n').filter((l: string) => l.trim() !== '').map((line: string, i: number) => (
                              <li key={i} className="flex items-start gap-1.5 text-xs text-gray-600">
                                <span className="text-gray-400 font-bold mt-0.5">•</span>
                                <span className="leading-relaxed">{line}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {e.dependencias_criticas && (
                        <div className="mb-3">
                          <span className="text-sm font-semibold text-gray-700 block mb-1">Dependências críticas:</span>
                          <ul className="space-y-1">
                            {e.dependencias_criticas.split('\n').filter((l: string) => l.trim() !== '').map((line: string, i: number) => (
                              <li key={i} className="flex items-start gap-1.5 text-xs text-gray-600">
                                <span className="text-gray-400 font-bold mt-0.5">•</span>
                                <span className="leading-relaxed">{line}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {e.motivo_status && (
                        <p className="text-xs text-gray-600 mb-2"><span className="font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">Motivo do status:</span> {e.motivo_status}</p>
                      )}

                      {/* Órgão responsável + Responsável */}
                      {(e.orgao_responsavel_setor_id || e.responsavel_entrega_id) && (
                        <div className="flex flex-wrap gap-4 mb-3 text-xs">
                          {e.orgao_responsavel_setor_id && (() => {
                            const p = e.entrega_participantes?.find((pp: any) => pp.tipo_participante === 'setor' && pp.setor_id === e.orgao_responsavel_setor_id)
                            return (
                              <div>
                                <span className="font-semibold text-gray-700">Órgão responsável: </span>
                                <span className="text-gray-600">{p?.setor?.codigo ? `${p.setor.codigo} — ${p.setor.nome_completo}` : setores.find((s: any) => s.id === e.orgao_responsavel_setor_id)?.codigo || 'Setor'}</span>
                              </div>
                            )
                          })()}
                          {e.responsavel_entrega_id && (
                            <div>
                              <span className="font-semibold text-gray-700">Responsável: </span>
                              <span className="text-gray-600">{eligibleUsers.find(u => u.id === e.responsavel_entrega_id)?.nome || '—'}</span>
                            </div>
                          )}
                        </div>
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

                      {/* Atividades Nesting Container */}
                      <div className="mt-5 bg-gray-50/70 border border-gray-200 rounded-xl p-4 ml-2 sm:ml-4 shadow-inner relative">
                        {/* Indicador visual de aninhamento */}
                        <div className="absolute -left-2 top-6 bottom-6 w-0.5 bg-gray-200 rounded-full hidden sm:block"></div>

                        <div className="flex items-center justify-between mb-4 border-b border-gray-200 pb-2">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-gray-600 uppercase tracking-widest flex items-center gap-1.5">
                              <ListPlus size={16} /> Atividades da Entrega
                            </h4>
                            <button type="button" onClick={() => setHelpType('atividade')} className="text-gray-400 hover:text-orange-500 transition-colors" title="O que é uma Atividade?"><HelpCircle size={14} /></button>
                          </div>
                          {canCreateAtividade && (
                            <button onClick={() => addNewAtividade(e.id)}
                              className="text-xs bg-white border border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300 px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition-all shadow-sm">
                              <Plus size={14} /> Adicionar
                            </button>
                          )}
                        </div>

                        {(!e.atividades || e.atividades.length === 0) && (
                          <div className="flex items-start gap-2 text-xs text-gray-500 bg-white border border-gray-100 shadow-sm rounded-lg p-3">
                            <Info size={14} className="mt-0.5 text-blue-500 shrink-0" />
                            <span>Nenhuma atividade cadastrada. Exemplos: reunião de alinhamento, pesquisa documental, elaboração de rascunho.</span>
                          </div>
                        )}

                        <div className="space-y-3 mt-2">
                          {e.atividades?.map((a: any, ativIndex: number) => {
                            const isEditA = editingAtividade === a.id
                            return (
                              <div key={a.id} className={`rounded-xl border transition-all ${isEditA ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-100 shadow-md' : 'bg-white border-gray-200 shadow-sm hover:shadow-md'}`}>
                                <div className="p-4">
                                  {isEditA ? (
                                    <div className="space-y-2">
                                      <div>
                                        <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide block mb-0.5">Nome</label>
                                        <input type="text" value={editForm.nome} onChange={ev => setEditForm({ ...editForm, nome: ev.target.value })}
                                          disabled={!canEditAtividade} className="input-field text-xs" placeholder="Nome da atividade" />
                                      </div>
                                      <div>
                                        <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide block mb-0.5">Descrição</label>
                                        <input type="text" value={editForm.descricao} onChange={ev => setEditForm({ ...editForm, descricao: ev.target.value })}
                                          disabled={!canEditAtividade} className="input-field text-xs" placeholder="Descreva esta atividade" />
                                      </div>
                                      <div>
                                        <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide block mb-0.5">Responsável pela atividade</label>
                                        <UserAutocompleteSelect
                                          value={editForm.responsavel_atividade_id}
                                          onChange={val => setEditForm({...editForm, responsavel_atividade_id: val})}
                                          users={eligibleUsers}
                                          placeholder="Selecione o responsável..."
                                          disabled={!canEditAtividade}
                                          onRegisterNew={() => setShowGestorModal(true)}
                                        />
                                      </div>

                                      <div className="space-y-1.5">
                                        <div className="flex flex-wrap items-end gap-2">
                                          <div className="w-[140px]">
                                            <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide block mb-0.5">Status</label>
                                            <select value={editForm.status} onChange={ev => setEditForm({ ...editForm, status: ev.target.value })}
                                              disabled={!canEditAtividade}
                                              className={`w-full px-2 py-1.5 rounded-lg text-xs font-medium border-2 focus:outline-none focus:ring-2 focus:ring-sedec-500 ${
                                                editForm.status === 'resolvida' ? 'border-green-400 bg-green-50 text-green-800' :
                                                editForm.status === 'cancelada' ? 'border-red-300 bg-red-50 text-red-800' :
                                                editForm.status === 'em_andamento' ? 'border-blue-300 bg-blue-50 text-blue-800' :
                                                editForm.status === 'aguardando' ? 'border-yellow-300 bg-yellow-50 text-yellow-800' :
                                                'border-gray-300 bg-white text-gray-700'
                                              }`}>
                                              {Object.entries(STATUS_ENTREGA).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                                            </select>
                                          </div>

                                          <div className="w-[140px]">
                                            <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide block mb-0.5">Data prevista <span className="text-gray-400 font-normal">(prazo para conclusão)</span></label>
                                            <input type="date" value={editForm.data_prevista || ''}
                                              max={editForm.entrega_data_final || undefined}
                                              disabled={!canEditDataAtividade}
                                              onChange={ev => {
                                                const nd = ev.target.value
                                                if (nd && editForm.entrega_data_final && nd > editForm.entrega_data_final) {
                                                  alert(`A data não pode ser posterior à quinzena da entrega (${editForm.entrega_data_final}).`)
                                                  return
                                                }
                                                setEditForm({ ...editForm, data_prevista: nd })
                                              }}
                                              className="w-full input-field text-xs" />
                                          </div>

                                          <div className="flex-1 min-w-[140px]">
                                            <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide block mb-0.5">Motivo</label>
                                            <input type="text" value={editForm.motivo_status || ''} onChange={ev => setEditForm({ ...editForm, motivo_status: ev.target.value })}
                                              disabled={!canEditAtividade} placeholder="Opcional" className="input-field text-xs" />
                                          </div>
                                        </div>
                                        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] ${
                                          editForm.status === 'aguardando' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                          editForm.status === 'em_andamento' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                                          editForm.status === 'resolvida' ? 'bg-green-50 text-green-600 border border-green-100' :
                                          editForm.status === 'cancelada' ? 'bg-red-50 text-red-500 border border-red-100' :
                                          'bg-gray-50 text-gray-500 border border-gray-100'
                                        }`}>
                                          <Info size={11} className="shrink-0" />
                                          <span>{STATUS_ENTREGA[editForm.status]?.hint}</span>
                                        </div>
                                      </div>
                                      {/* Participantes da atividade */}
                                      {canEditAtividade && (
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
                                      )}
                                      <div className="flex gap-2 mt-4">
                                        <button onClick={() => saveEditAtividade(a.id, e.id)} disabled={saving}
                                          className="flex items-center gap-1 text-xs bg-green-500 text-white px-3 py-1.5 rounded-lg"><Save size={13} /> Salvar</button>
                                        <button onClick={() => setEditingAtividade(null)}
                                          className="flex items-center gap-1 text-xs text-gray-500 px-3 py-1.5"><X size={13} /> Cancelar</button>
                                      </div>
                                    </div>
                                  ) : (
                                    <>
                                      <div className="flex items-start justify-between gap-3 mb-2">
                                        <div className="flex items-center gap-2">
                                          <div className="w-5 h-5 rounded flex items-center justify-center bg-gray-100 text-gray-500 text-xs font-bold border border-gray-200 shrink-0 mt-0.5">{ativIndex + 1}</div>
                                          <h4 className="text-sm font-semibold text-gray-800">{a.nome}</h4>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                          {(canEditAtividade || canEditDataAtividade) && <button onClick={() => startEditAtividade(a, e)} className="text-gray-400 hover:text-orange-500 transition-colors p-1"><Edit3 size={14} /></button>}
                                          {canEditAtividade && <button onClick={() => deleteAtividade(a)} className="text-gray-400 hover:text-red-500 transition-colors p-1"><Trash2 size={14} /></button>}
                                        </div>
                                      </div>
                                      <p className="text-xs text-gray-600 mb-3 pl-7">{a.descricao}</p>
                                      {a.responsavel_atividade_id && (
                                        <div className="text-xs pl-7 mb-2">
                                          <span className="text-gray-500 font-medium">Responsável: </span>
                                          <span className="text-gray-600">{eligibleUsers.find(u => u.id === a.responsavel_atividade_id)?.nome || '—'}</span>
                                        </div>
                                      )}

                                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 pl-7 text-xs border-t border-gray-50 pt-3">
                                        <div className="flex items-center gap-1.5">
                                          <span className="text-gray-500 font-medium">Status:</span>
                                          <span className={`px-2 py-0.5 rounded-full font-medium ${(STATUS_ENTREGA[a.status] || STATUS_ENTREGA.aberta).bg} ${(STATUS_ENTREGA[a.status] || STATUS_ENTREGA.aberta).color}`}>
                                            {(STATUS_ENTREGA[a.status] || STATUS_ENTREGA.aberta).label}
                                          </span>
                                        </div>
                                        
                                        {a.data_prevista && (
                                          <div className="flex items-center gap-1.5">
                                            <span className="text-gray-500 font-medium whitespace-nowrap"><Clock size={12} className="inline mr-0.5 mb-0.5" /> Prazo:</span>
                                            <span className="text-gray-700">{formatDateBR(a.data_prevista)}</span>
                                          </div>
                                        )}
                                        
                                        {a.motivo_status && (
                                          <div className="flex items-center gap-1.5 w-full mt-1">
                                            <span className="font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">Motivo do status:</span>
                                            <span className="text-gray-700 italic">{a.motivo_status}</span>
                                          </div>
                                        )}
                                      </div>
                                      
                                      {/* Participantes da Atividade */}
                                      {a.atividade_participantes?.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-3 pl-7">
                                          {a.atividade_participantes.map((p: any) => (
                                            <span key={p.id} className="text-[11px] bg-gray-100 border border-gray-200 text-gray-700 px-2 py-1 rounded shadow-sm">
                                              <span className="font-semibold">{participanteLabel(p)}</span>: {p.papel}
                                            </span>
                                          ))}
                                        </div>
                                      )}
                                    </>
                                  )}
                                </div>
                              </div>
                            )
                          })}

                        {/* Formulário de nova atividade */}
                        {editingAtividade === -e.id && (
                          <div className="mt-3">
                            <div className="rounded-xl p-4 bg-blue-50 border border-blue-300 ring-2 ring-blue-100 shadow-md">
                              <div className="space-y-3">
                                <p className="text-sm font-bold text-blue-800 mb-2">Nova atividade</p>
                                <div>
                                  <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide block mb-0.5">Nome</label>
                                  <input type="text" value={editForm.nome} onChange={ev => setEditForm({ ...editForm, nome: ev.target.value })}
                                    className="input-field text-xs" placeholder="Nome da atividade" />
                                </div>
                                <div>
                                  <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide block mb-0.5">Descrição</label>
                                  <input type="text" value={editForm.descricao} onChange={ev => setEditForm({ ...editForm, descricao: ev.target.value })}
                                    className="input-field text-xs" placeholder="Descreva esta atividade" />
                                </div>
                                <div>
                                  <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide block mb-0.5">Responsável pela atividade</label>
                                  <UserAutocompleteSelect
                                    value={editForm.responsavel_atividade_id}
                                    onChange={val => setEditForm({...editForm, responsavel_atividade_id: val})}
                                    users={eligibleUsers}
                                    placeholder="Selecione o responsável..."
                                    onRegisterNew={() => setShowGestorModal(true)}
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <div className="flex flex-wrap items-end gap-2">
                                    <div className="w-[140px]">
                                      <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide block mb-0.5">Status</label>
                                      <select value={editForm.status} onChange={ev => setEditForm({ ...editForm, status: ev.target.value })}
                                        className={`w-full px-2 py-1.5 rounded-lg text-xs font-medium border-2 focus:outline-none focus:ring-2 focus:ring-sedec-500 ${
                                          editForm.status === 'resolvida' ? 'border-green-400 bg-green-50 text-green-800' :
                                          editForm.status === 'em_andamento' ? 'border-blue-300 bg-blue-50 text-blue-800' :
                                          editForm.status === 'aguardando' ? 'border-yellow-300 bg-yellow-50 text-yellow-800' :
                                          'border-gray-300 bg-white text-gray-700'
                                        }`}>
                                        {Object.entries(STATUS_ENTREGA).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                                      </select>
                                    </div>
                                    <div className="w-[140px]">
                                      <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide block mb-0.5">Data prevista <span className="text-gray-400 font-normal">(prazo para conclusão)</span></label>
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
                                        className="w-full input-field text-xs" />
                                    </div>
                                    <div className="flex-1 min-w-[140px]">
                                      <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide block mb-0.5">Motivo</label>
                                      <input type="text" value={editForm.motivo_status || ''} onChange={ev => setEditForm({ ...editForm, motivo_status: ev.target.value })}
                                        placeholder="Opcional" className="input-field text-xs" />
                                    </div>
                                  </div>
                                  <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] ${
                                    editForm.status === 'aguardando' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                    editForm.status === 'em_andamento' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                                    editForm.status === 'resolvida' ? 'bg-green-50 text-green-600 border border-green-100' :
                                    editForm.status === 'cancelada' ? 'bg-red-50 text-red-500 border border-red-100' :
                                    'bg-gray-50 text-gray-500 border border-gray-100'
                                  }`}>
                                    <Info size={11} className="shrink-0" />
                                    <span>{STATUS_ENTREGA[editForm.status]?.hint}</span>
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
                                  <button onClick={() => saveEditAtividade(-e.id, e.id)} disabled={saving}
                                    className="flex items-center gap-1 text-xs bg-green-500 text-white px-3 py-1.5 rounded-lg"><Save size={13} /> Salvar</button>
                                  <button onClick={() => setEditingAtividade(null)}
                                    className="flex items-center gap-1 text-xs text-gray-500 px-3 py-1.5"><X size={13} /> Cancelar</button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Solicitações pendentes do gestor */}
      {needsApproval && solicitacoes.filter(s => s.status === 'em_analise').length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-bold text-gray-700 mb-3">Suas solicitações pendentes</h2>
          <div className="space-y-2">
            {solicitacoes.filter(s => s.status === 'em_analise').map((s: any) => (
              <div key={s.id} className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-amber-800">
                    {s.tipo_operacao === 'edicao' ? 'Edição' : 'Exclusão'} de {s.tipo_entidade}
                  </span>
                  <span className="text-xs text-gray-600 ml-2">"{s.entidade_nome}"</span>
                  <span className="text-[10px] text-gray-400 ml-2">
                    {new Date(s.created_at).toLocaleDateString('pt-BR')} {new Date(s.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <button onClick={() => cancelarSolicitacao(s.id)}
                  className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1">
                  <X size={12} /> Cancelar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Solicitações resolvidas (para referência) */}
      {needsApproval && solicitacoes.filter(s => s.status !== 'em_analise').length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-semibold text-gray-500 mb-2">Histórico de solicitações</h3>
          <div className="space-y-1">
            {solicitacoes.filter(s => s.status !== 'em_analise').slice(0, 10).map((s: any) => (
              <div key={s.id} className="bg-gray-50 border border-gray-200 rounded-lg p-2 flex items-center gap-3 text-xs">
                <span className={`px-2 py-0.5 rounded-full font-medium ${
                  s.status === 'deferida' ? 'bg-green-100 text-green-700' :
                  s.status === 'indeferida' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {s.status === 'deferida' ? 'Aprovada' : s.status === 'indeferida' ? 'Recusada' : 'Cancelada'}
                </span>
                <span className="text-gray-600">
                  {s.tipo_operacao === 'edicao' ? 'Edição' : 'Exclusão'} de {s.tipo_entidade}: "{s.entidade_nome}"
                </span>
                {s.justificativa_avaliador && (
                  <span className="text-gray-400 italic">— {s.justificativa_avaliador}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <RegisterGestorModal
        isOpen={showGestorModal}
        onClose={() => setShowGestorModal(false)}
        onSuccess={(newUser) => {
          setEligibleUsers(prev => [...prev, newUser].sort((a, b) => a.nome.localeCompare(b.nome)))
          setShowGestorModal(false)
        }}
        setores={setores}
      />
    </div>
  )
}

// ============================================================
// GANTT CHART (lightweight, no deps)
// ============================================================

function GanttChart({ entregas, dataInicio }: { entregas: any[]; dataInicio?: string | null }) {
  const withDate = entregas.filter((e: any) => e.data_final_prevista)
  if (withDate.length === 0) return null

  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const DAY = 1000 * 60 * 60 * 24

  const fmtShort = (d: Date) => {
    const dd = String(d.getDate()).padStart(2, '0')
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    return `${dd}/${mm}`
  }

  // Data de início de cada entrega:
  // - Se houver atividades com data: atividade mais cedo
  // - Se não houver atividades mas houver data de início do projeto: data de início do projeto
  // - Senão: hoje
  const getStart = (e: any) => {
    const ativDates = (e.atividades || [])
      .filter((a: any) => a.data_prevista)
      .map((a: any) => new Date(a.data_prevista + 'T00:00:00').getTime())
    if (ativDates.length > 0) {
      return new Date(Math.min(...ativDates))
    }
    if (dataInicio) {
      return new Date(dataInicio + 'T00:00:00')
    }
    return new Date(now.getTime())
  }

  // Calcular range global com margem
  const allStarts = withDate.map(e => getStart(e).getTime())
  const allEnds = withDate.map((e: any) => new Date(e.data_final_prevista + 'T00:00:00').getTime())
  const rangeMin = new Date(Math.min(...allStarts, ...allEnds, now.getTime()))
  const rangeMax = new Date(Math.max(...allStarts, ...allEnds, now.getTime()))
  // Margem de 7 dias antes e depois
  const minDate = new Date(rangeMin.getTime() - 7 * DAY)
  const maxDate = new Date(rangeMax.getTime() + 14 * DAY)
  const totalDays = Math.max(1, (maxDate.getTime() - minDate.getTime()) / DAY)
  const toPos = (d: Date) => ((d.getTime() - minDate.getTime()) / DAY) / totalDays * 100

  // Meses para grid
  const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
  const months: { label: string; pos: number }[] = []
  const cur = new Date(minDate.getFullYear(), minDate.getMonth() + 1, 1)
  while (cur <= maxDate) {
    months.push({ label: `${meses[cur.getMonth()]}/${String(cur.getFullYear()).slice(-2)}`, pos: toPos(cur) })
    cur.setMonth(cur.getMonth() + 1)
  }

  const todayPos = toPos(now)
  const rowH = 32

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[500px]">
        <div className="relative" style={{ height: `${withDate.length * rowH + 24}px` }}>

          {/* Grid vertical — divisórias de mês */}
          {months.map((m, i) => (
            <div key={i} className="absolute top-0 bottom-0" style={{ left: `${m.pos}%` }}>
              <div className="w-px h-full bg-gray-200" />
              <span className="absolute -top-0.5 translate-x-1 text-[9px] text-gray-400 font-medium whitespace-nowrap">{m.label}</span>
            </div>
          ))}

          {/* Linha "hoje" */}
          <div className="absolute top-0 bottom-0 z-20" style={{ left: `${todayPos}%` }}>
            <div className="w-0.5 h-full bg-orange-400 opacity-70" />
            <span className="absolute -top-0.5 -translate-x-1/2 text-[9px] text-orange-500 font-bold">hoje</span>
          </div>

          {/* Barras */}
          {withDate.map((e: any, i: number) => {
            const startDate = getStart(e)
            const endDate = new Date(e.data_final_prevista + 'T00:00:00')
            const isAtrasada = e.status !== 'resolvida' && e.status !== 'cancelada' && endDate < now
            const isResolvida = e.status === 'resolvida'

            const left = toPos(startDate)
            const right = toPos(endDate)
            const width = Math.max(1.5, right - left)

            const color = isResolvida ? 'bg-green-400' : isAtrasada ? 'bg-red-400' : 'bg-blue-400'
            const textColor = isAtrasada ? 'text-red-700' : 'text-gray-600'
            const top = 20 + i * rowH

            return (
              <div key={e.id} className="absolute flex items-center" style={{ top: `${top}px`, left: 0, right: 0, height: `${rowH - 4}px` }}>
                {/* Barra */}
                <div className={`absolute h-5 rounded ${color} opacity-80`}
                  style={{ left: `${left}%`, width: `${width}%` }}>
                  {/* Rótulo de início dentro/ao lado esquerdo da barra */}
                  <span className="absolute -top-3.5 left-0 text-[8px] text-gray-500 whitespace-nowrap">
                    {fmtShort(startDate)}
                  </span>
                  {/* Rótulo de fim dentro/ao lado direito da barra */}
                  <span className={`absolute -top-3.5 right-0 text-[8px] font-medium whitespace-nowrap ${textColor}`}>
                    {fmtShort(endDate)}
                  </span>
                  {/* Nome da entrega dentro da barra */}
                  <span className="absolute inset-0 flex items-center px-1.5 text-[10px] font-medium text-white truncate drop-shadow-sm">
                    {e.nome}
                  </span>
                </div>
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
