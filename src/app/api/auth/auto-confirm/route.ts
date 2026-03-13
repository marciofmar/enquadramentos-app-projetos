import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()
    if (!userId) return NextResponse.json({ error: 'userId obrigatório' }, { status: 400 })

    const adminClient = createAdminClient()

    // Verificar se email está desativado
    const { data: config } = await adminClient
      .from('configuracoes')
      .select('valor')
      .eq('chave', 'email_funcoes_ativas')
      .single()

    if (config?.valor === 'true') {
      // Email ativado — não auto-confirmar, Supabase cuida
      return NextResponse.json({ success: true, confirmed: false })
    }

    // Auto-confirmar via função PostgreSQL SECURITY DEFINER
    // Chamada com service_role — sem verificação de admin (função de sistema)
    const { error: rpcError } = await adminClient.rpc('admin_confirm_user_email', {
      target_user_id: userId,
    })
    if (rpcError) return NextResponse.json({ error: rpcError.message }, { status: 500 })

    return NextResponse.json({ success: true, confirmed: true })
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
