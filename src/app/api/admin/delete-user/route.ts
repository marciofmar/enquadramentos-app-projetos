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
    if (!callerProfile || (callerProfile.role !== 'admin' && callerProfile.role !== 'master')) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    const { userId } = await request.json()
    if (!userId) return NextResponse.json({ error: 'userId obrigatório' }, { status: 400 })

    // Prevent deletion if user is 'lider' of a sector?
    // User requested: "preventing deletion if user is responsible for projects, deliveries, or activities."
    const { count: projCount } = await adminClient.from('projetos').select('*', { count: 'exact', head: true }).eq('responsavel_id', userId)
    if (projCount && projCount > 0) return NextResponse.json({ error: 'Usuário é responsável por um ou mais projetos e não pode ser excluído.' }, { status: 400 })
    
    const { count: entCount } = await adminClient.from('entregas').select('*', { count: 'exact', head: true }).eq('responsavel_entrega_id', userId)
    if (entCount && entCount > 0) return NextResponse.json({ error: 'Usuário é responsável por uma ou mais entregas e não pode ser excluído.' }, { status: 400 })

    const { count: ativCount } = await adminClient.from('atividades').select('*', { count: 'exact', head: true }).eq('responsavel_atividade_id', userId)
    if (ativCount && ativCount > 0) return NextResponse.json({ error: 'Usuário é responsável por uma ou mais atividades e não pode ser excluído.' }, { status: 400 })

    const { error } = await serverSupabase.rpc('admin_delete_user', { target_user_id: userId })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erro interno' }, { status: 500 })
  }
}
