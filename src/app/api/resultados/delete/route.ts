import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-admin'
import { deleteResultadoPDF } from '@/lib/resultados-storage'

// Remove um arquivo do bucket. Autorização: usuário autenticado não
// 'solicitante'. A remoção dos metadados no banco é feita separadamente
// pelo fluxo de save da entrega/atividade.
export async function POST(request: NextRequest) {
  try {
    const serverSupabase = createServerSupabase()
    const { data: { user } } = await serverSupabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const admin = createAdminClient()
    const { data: profile } = await admin
      .from('profiles').select('role, ativo').eq('id', user.id).single()
    if (!profile || !profile.ativo || profile.role === 'solicitante') {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    const body = await request.json().catch(() => ({}))
    const path = typeof body?.path === 'string' ? body.path : null
    if (!path || !/^(entregas|atividades)\/\d+\/[a-f0-9-]+\.pdf$/i.test(path)) {
      return NextResponse.json({ error: 'path inválido' }, { status: 400 })
    }

    await deleteResultadoPDF(path)
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Erro interno' },
      { status: 500 }
    )
  }
}

export const runtime = 'nodejs'
