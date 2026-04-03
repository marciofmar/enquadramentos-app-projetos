import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { sendPushToUser, sendPushToUsers } from '@/lib/push-server'

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerSupabase()

    // Verificar autenticação
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const body = await req.json()
    const { userIds, title, body: msgBody, url } = body

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({ error: 'userIds obrigatório' }, { status: 400 })
    }
    if (!title || !msgBody) {
      return NextResponse.json({ error: 'title e body obrigatórios' }, { status: 400 })
    }

    await sendPushToUsers(userIds, { title, body: msgBody, url })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('[Push Send] Exceção:', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
