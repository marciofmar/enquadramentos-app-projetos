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

    // Garantir que o profile foi criado pelo trigger
    const { data: existingProfile } = await adminClient
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single()

    if (!existingProfile) {
      // Trigger falhou — criar profile manualmente
      console.warn(`[auto-confirm] Profile não encontrado para userId=${userId}. Criando manualmente...`)
      const { data: { user: authUser }, error: userErr } = await adminClient.auth.admin.getUserById(userId)
      if (userErr) console.error(`[auto-confirm] Erro ao buscar auth user: ${userErr.message}`)
      if (authUser) {
        const { error: insertErr } = await adminClient.from('profiles').insert({
          id: userId,
          email: authUser.email,
          nome: authUser.user_metadata?.nome || authUser.email,
          setor_id: authUser.user_metadata?.setor_id ? parseInt(authUser.user_metadata.setor_id) : null,
          perfil_solicitado: authUser.user_metadata?.perfil_solicitado || null,
          role: 'solicitante'
        })
        if (insertErr) console.error(`[auto-confirm] Erro ao criar profile: ${insertErr.message}`)
        else console.log(`[auto-confirm] Profile criado com sucesso para ${authUser.email}`)
      }
    }

    return NextResponse.json({ success: true, confirmed: true })
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
