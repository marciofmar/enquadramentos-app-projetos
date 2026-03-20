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
    if (!callerProfile || (callerProfile.role !== 'admin' && callerProfile.role !== 'master')) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    const { userId, nome, email } = await request.json()
    if (!userId) return NextResponse.json({ error: 'userId obrigatório' }, { status: 400 })

    // Atualizar nome no profile (via PostgREST com service role) - Apenas Admin
    if (nome !== undefined) {
      if (callerProfile.role !== 'admin') {
        return NextResponse.json({ error: 'Apenas admin pode editar nome' }, { status: 403 })
      }
      const { error } = await adminClient
        .from('profiles').update({ nome }).eq('id', userId)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Atualizar email via função PostgreSQL SECURITY DEFINER
    // (atualiza auth.users + profiles de uma vez)
    if (email !== undefined) {
      const { error: rpcError } = await serverSupabase.rpc('admin_update_user_email', {
        target_user_id: userId,
        new_email: email,
      })
      if (rpcError) return NextResponse.json({ error: rpcError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
