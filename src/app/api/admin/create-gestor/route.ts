import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    // Autenticação via cookies (session do usuário)
    const serverSupabase = createServerSupabase()
    const { data: { user } } = await serverSupabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const { nome, email, setor_id } = await request.json()

    // Validações
    if (!nome || !nome.trim()) {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 })
    }
    if (!email || !email.trim()) {
      return NextResponse.json({ error: 'Email é obrigatório' }, { status: 400 })
    }
    if (!setor_id) {
      return NextResponse.json({ error: 'Setor é obrigatório' }, { status: 400 })
    }

    // Gerar senha temporária (mesma lógica do reset-password)
    const tempPassword = crypto.randomUUID()

    // Criar usuário via função SECURITY DEFINER (contorna bug HS256 do GoTrue)
    // A função já verifica que o caller é gestor, master ou admin via auth.uid()
    const { data: newUserId, error: createError } = await serverSupabase.rpc('admin_create_user', {
      p_email: email.trim().toLowerCase(),
      p_password: tempPassword,
      p_nome: nome.trim(),
      p_setor_id: parseInt(setor_id),
    })
    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 500 })
    }

    // Criar identity (necessário para login via email/senha)
    const { error: identityError } = await serverSupabase.rpc('admin_create_user_identity', {
      p_user_id: newUserId,
      p_email: email.trim().toLowerCase(),
    })
    if (identityError) {
      return NextResponse.json({ error: identityError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      user: {
        id: newUserId,
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
      },
    })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Erro interno' }, { status: 500 })
  }
}
