import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    if (!email) return NextResponse.json({ error: 'Email obrigatório' }, { status: 400 })

    const adminClient = createAdminClient()

    // Buscar profile com senha_zerada = true
    const { data: profile } = await adminClient
      .from('profiles')
      .select('id, reset_token, senha_zerada')
      .eq('email', email)
      .eq('senha_zerada', true)
      .single()

    if (!profile || !profile.reset_token) {
      return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 })
    }

    // Guardar o token antes de limpar
    const resetToken = profile.reset_token

    // Limpar apenas o reset_token (single use — não pode ser reutilizado)
    // senha_zerada permanece true até o usuário efetivamente trocar a senha
    await adminClient
      .from('profiles')
      .update({ reset_token: null })
      .eq('id', profile.id)

    // Retornar o token para o client fazer signIn diretamente
    // (o browser client usa a publishable key que funciona com GoTrue)
    return NextResponse.json({ reset_token: resetToken })
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
