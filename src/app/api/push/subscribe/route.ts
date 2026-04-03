import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerSupabase()

    // Verificar autenticação
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const body = await req.json()
    const { endpoint, keys } = body

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json({ error: 'Dados de inscrição inválidos' }, { status: 400 })
    }

    // Upsert: se o endpoint já existe, atualiza o user_id e keys
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert(
        {
          user_id: user.id,
          endpoint,
          p256dh: keys.p256dh,
          auth: keys.auth,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'endpoint' }
      )

    if (error) {
      console.error('[Push Subscribe] Erro:', error)
      return NextResponse.json({ error: 'Erro ao salvar inscrição' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('[Push Subscribe] Exceção:', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
