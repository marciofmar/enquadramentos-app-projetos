import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-admin'

export async function POST(request: NextRequest) {
  try {
    const serverSupabase = createServerSupabase()
    const { data: { user } } = await serverSupabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const adminClient = createAdminClient()
    const { data: callerProfile } = await adminClient
      .from('profiles').select('role').eq('id', user.id).single()
    if (!callerProfile || callerProfile.role !== 'admin') {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    const { userId } = await request.json()
    if (!userId) return NextResponse.json({ error: 'userId obrigatório' }, { status: 400 })

    // Fetch all counts in parallel
    const [
      { count: projCount },
      { count: entCount },
      { count: ativCount },
      { count: participacoesCount },
      { count: observacoesCount },
    ] = await Promise.all([
      adminClient.from('projetos').select('*', { count: 'exact', head: true }).eq('responsavel_id', userId),
      adminClient.from('entregas').select('*', { count: 'exact', head: true }).eq('responsavel_entrega_id', userId),
      adminClient.from('atividades').select('*', { count: 'exact', head: true }).eq('responsavel_atividade_id', userId),
      adminClient.from('atividade_participantes').select('*', { count: 'exact', head: true }).eq('user_id', userId),
      adminClient.from('observacoes').select('*', { count: 'exact', head: true }).eq('autor_id', userId),
    ])

    const projetos = projCount ?? 0
    const entregas = entCount ?? 0
    const atividades = ativCount ?? 0
    const participacoes = participacoesCount ?? 0
    const observacoes = observacoesCount ?? 0

    // Block deletion if user is responsible for projects, entregas, or atividades
    if (projetos > 0 || entregas > 0 || atividades > 0) {
      const parts: string[] = []
      if (projetos > 0) parts.push(`${projetos} projeto(s)`)
      if (entregas > 0) parts.push(`${entregas} entrega(s)`)
      if (atividades > 0) parts.push(`${atividades} atividade(s)`)
      return NextResponse.json({
        error: `Usuário é responsável por ${parts.join(', ')} e não pode ser excluído.`,
        impact: { projetos, entregas, atividades, participacoes, observacoes },
      }, { status: 400 })
    }

    const { error } = await serverSupabase.rpc('admin_delete_user', { target_user_id: userId })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true, impact: { participacoes, observacoes } })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erro interno' }, { status: 500 })
  }
}
