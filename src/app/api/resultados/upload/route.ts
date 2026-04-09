import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-admin'
import {
  uploadResultadoPDF,
  RESULTADOS_MAX_BYTES,
  RESULTADOS_ALLOWED_MIME,
  type ResultadoOwner,
} from '@/lib/resultados-storage'

// Permite upload do PDF comprobatório da entrega/atividade.
// Qualquer usuário autenticado (exceto 'solicitante') pode enviar.
// A autorização granular (quem pode editar aquela entrega/atividade)
// é responsabilidade da tela que invoca esta rota — e já é restringida
// pelo botão de edição lá. Aqui só garantimos autenticação + validação
// de formato/tamanho + associação correta a uma entidade existente.
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

    const form = await request.formData()
    const file = form.get('file')
    const ownerKind = form.get('owner_kind')
    const ownerIdRaw = form.get('owner_id')

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Arquivo ausente.' }, { status: 400 })
    }
    if (ownerKind !== 'entrega' && ownerKind !== 'atividade') {
      return NextResponse.json({ error: 'owner_kind inválido.' }, { status: 400 })
    }
    const ownerId = Number(ownerIdRaw)
    if (!Number.isFinite(ownerId) || ownerId <= 0) {
      return NextResponse.json({ error: 'owner_id inválido.' }, { status: 400 })
    }

    if (file.type !== RESULTADOS_ALLOWED_MIME) {
      return NextResponse.json(
        { error: 'Apenas arquivos PDF são aceitos.' },
        { status: 400 }
      )
    }
    if (file.size > RESULTADOS_MAX_BYTES) {
      return NextResponse.json(
        { error: 'Tamanho máximo: 4 MB.' },
        { status: 400 }
      )
    }

    // Confirma que a entidade dona existe, evitando subir arquivo para ID aleatório
    const table = ownerKind === 'entrega' ? 'entregas' : 'atividades'
    const { data: ent } = await admin
      .from(table)
      .select('id')
      .eq('id', ownerId)
      .single()
    if (!ent) {
      return NextResponse.json({ error: 'Entidade não encontrada.' }, { status: 404 })
    }

    const owner: ResultadoOwner =
      ownerKind === 'entrega'
        ? { kind: 'entrega', entregaId: ownerId }
        : { kind: 'atividade', atividadeId: ownerId }

    const meta = await uploadResultadoPDF(file, owner)
    return NextResponse.json(meta)
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Erro interno' },
      { status: 500 }
    )
  }
}

// Limite de body do Next (1MB por padrão para actions). Como usamos
// FormData nativo do fetch, o Next já aceita até 4 MB sem config extra
// em route handlers.
export const runtime = 'nodejs'
export const maxDuration = 30
