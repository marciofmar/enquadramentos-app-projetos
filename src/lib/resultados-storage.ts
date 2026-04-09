/**
 * Módulo único de acesso ao storage de "Resultados e Produtos".
 *
 * É o ÚNICO arquivo do projeto que deve conhecer o backend de storage
 * (atualmente Supabase Storage, bucket privado `resultados`). Qualquer
 * migração futura para hospedagem institucional (S3, MinIO, filesystem
 * local, etc.) deve se resumir a reescrever este arquivo — nem a UI,
 * nem as rotas de API, nem o banco precisarão mudar, já que:
 *
 *  - O banco guarda apenas um `path` lógico relativo (ex.
 *    `entregas/42/7d3f…b91.pdf`), nunca URLs do provedor.
 *  - A UI linka sempre para `/api/resultados/download?path=...`, que
 *    internamente chama `getResultadoSignedUrl()` deste módulo.
 *  - Uploads passam por `/api/resultados/upload`, que chama
 *    `uploadResultadoPDF()` deste módulo.
 */

import { createAdminClient } from './supabase-admin'

export const RESULTADOS_BUCKET = 'resultados'
export const RESULTADOS_MAX_BYTES = 4 * 1024 * 1024 // 4 MB
export const RESULTADOS_ALLOWED_MIME = 'application/pdf'

export type ResultadoOwner =
  | { kind: 'entrega'; entregaId: number }
  | { kind: 'atividade'; atividadeId: number }

export interface ResultadoFileMeta {
  path: string
  nome: string
  tamanho: number
}

function ownerPrefix(owner: ResultadoOwner): string {
  if (owner.kind === 'entrega') return `entregas/${owner.entregaId}`
  return `atividades/${owner.atividadeId}`
}

function randomId(): string {
  // UUID v4 simples sem depender do crypto global (Node 18+ tem crypto.randomUUID)
  // mas para segurança usamos crypto.randomUUID quando disponível.
  if (typeof globalThis.crypto !== 'undefined' && typeof globalThis.crypto.randomUUID === 'function') {
    return globalThis.crypto.randomUUID()
  }
  // fallback
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

function sanitizeOriginalName(name: string): string {
  // Preserva apenas caracteres seguros e limita comprimento — só para exibição.
  const base = name.replace(/[\r\n\t]/g, ' ').trim()
  return base.length > 180 ? base.slice(0, 180) : base
}

/**
 * Faz upload do PDF para o backend de storage.
 * Deve ser chamado apenas no server (rota de API) — usa service role.
 */
export async function uploadResultadoPDF(
  file: {
    arrayBuffer: () => Promise<ArrayBuffer>
    size: number
    type: string
    name: string
  },
  owner: ResultadoOwner
): Promise<ResultadoFileMeta> {
  if (file.type !== RESULTADOS_ALLOWED_MIME) {
    throw new Error('Formato inválido: apenas arquivos PDF são permitidos.')
  }
  if (file.size > RESULTADOS_MAX_BYTES) {
    throw new Error('Arquivo excede o tamanho máximo de 4 MB.')
  }
  if (file.size <= 0) {
    throw new Error('Arquivo vazio.')
  }

  const admin = createAdminClient()
  const path = `${ownerPrefix(owner)}/${randomId()}.pdf`
  const buffer = Buffer.from(await file.arrayBuffer())

  const { error } = await admin.storage
    .from(RESULTADOS_BUCKET)
    .upload(path, buffer, {
      contentType: RESULTADOS_ALLOWED_MIME,
      upsert: false,
    })

  if (error) {
    throw new Error(`Falha ao enviar arquivo: ${error.message}`)
  }

  return {
    path,
    nome: sanitizeOriginalName(file.name) || 'arquivo.pdf',
    tamanho: file.size,
  }
}

/**
 * Remove um arquivo pelo path lógico. Falhas são ignoradas para não
 * bloquear a remoção dos metadados no banco (o worst case é um arquivo
 * órfão no bucket, que pode ser limpo por rotina offline).
 */
export async function deleteResultadoPDF(path: string): Promise<void> {
  if (!path) return
  const admin = createAdminClient()
  await admin.storage.from(RESULTADOS_BUCKET).remove([path]).catch(() => {})
}

/**
 * Gera uma URL assinada de curta duração para download.
 * A rota `/api/resultados/download` redireciona o usuário para essa URL.
 */
export async function getResultadoSignedUrl(
  path: string,
  ttlSeconds: number = 60
): Promise<string> {
  if (!path) throw new Error('Path obrigatório.')
  const admin = createAdminClient()
  const { data, error } = await admin.storage
    .from(RESULTADOS_BUCKET)
    .createSignedUrl(path, ttlSeconds)
  if (error || !data?.signedUrl) {
    throw new Error(`Falha ao gerar URL: ${error?.message || 'desconhecida'}`)
  }
  return data.signedUrl
}

/**
 * Verifica se um path pertence ao prefixo esperado de uma entidade.
 * Usado pelas rotas de API para impedir acesso cruzado.
 */
export function pathBelongsTo(path: string, owner: ResultadoOwner): boolean {
  return path.startsWith(ownerPrefix(owner) + '/')
}
