import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerSupabase()

    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const body = await req.json()
    const { endpoint } = body

    if (!endpoint) {
      return NextResponse.json({ error: 'Endpoint obrigatório' }, { status: 400 })
    }

    const { error } = await supabase
      .from('push_subscriptions')
      .delete()
      .eq('user_id', user.id)
      .eq('endpoint', endpoint)

    if (error) {
      console.error('[Push Unsubscribe] Erro:', error)
      return NextResponse.json({ error: 'Erro ao remover inscrição' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('[Push Unsubscribe] Exceção:', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
