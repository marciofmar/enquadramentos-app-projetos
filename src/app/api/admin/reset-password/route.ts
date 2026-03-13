import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-admin'

export async function POST(request: NextRequest) {
  try {
    // Autenticação via cookies (session do usuário)
    const serverSupabase = createServerSupabase()
    const { data: { user } } = await serverSupabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    // Verificar que é admin
    const adminClient = createAdminClient()
    const { data: callerProfile } = await adminClient
      .from('profiles').select('role').eq('id', user.id).single()
    if (!callerProfile || callerProfile.role !== 'admin') {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    const { userId } = await request.json()
    if (!userId) return NextResponse.json({ error: 'userId obrigatório' }, { status: 400 })

    // Gerar token aleatório como senha temporária
    const resetToken = crypto.randomUUID()

    // Atualizar senha via função PostgreSQL SECURITY DEFINER
    // Chamada com session do admin — auth.uid() retorna o ID do admin para check
    const { error: rpcError } = await serverSupabase.rpc('admin_update_user_password', {
      target_user_id: userId,
      new_password: resetToken,
    })
    if (rpcError) {
      return NextResponse.json({ error: rpcError.message }, { status: 500 })
    }

    // Marcar profile como senha zerada e salvar token
    const { error: profileError } = await adminClient
      .from('profiles')
      .update({ senha_zerada: true, reset_token: resetToken })
      .eq('id', userId)
    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
