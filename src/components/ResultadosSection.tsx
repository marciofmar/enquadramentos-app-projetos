'use client'

/**
 * Seção "Resultados e Produtos" — bloco destacado usado no fundo dos
 * formulários de entrega e atividade. Registra a descrição textual do
 * que foi efetivamente entregue e, opcionalmente, um PDF comprobatório
 * (≤ 4 MB).
 *
 * A parte de storage é acessada SOMENTE via as rotas internas
 * `/api/resultados/upload|download|delete`, que por sua vez chamam o
 * módulo `src/lib/resultados-storage.ts`. Isso mantém a UI 100%
 * agnóstica em relação ao backend de storage — migrar para hospedagem
 * institucional não exige mudanças aqui.
 */

import { useRef, useState } from 'react'
import { Sparkles, FileText, Upload, Trash2, HelpCircle, Loader2, Download } from 'lucide-react'
import HelpTooltipModal from './HelpTooltipModal'

export type ResultadoOwnerProp =
  | { kind: 'entrega'; entregaId: number }
  | { kind: 'atividade'; atividadeId: number }
  | null

export interface ResultadoArquivoMeta {
  path: string
  nome: string
  tamanho: number
}

interface Props {
  owner: ResultadoOwnerProp
  descricao: string
  onDescricaoChange: (v: string) => void
  arquivoPath: string | null
  arquivoNome: string | null
  arquivoTamanho: number | null
  onArquivoChange: (meta: ResultadoArquivoMeta | null) => void
  disabled?: boolean
  /** Se true, desabilita especificamente o upload de PDF (ex.: tela de criação onde a entidade ainda não existe). */
  uploadDisabled?: boolean
  /** Mensagem explicativa mostrada quando o upload está desabilitado. */
  uploadDisabledMessage?: string
  compact?: boolean
}

const MAX_BYTES = 4 * 1024 * 1024

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export default function ResultadosSection({
  owner,
  descricao,
  onDescricaoChange,
  arquivoPath,
  arquivoNome,
  arquivoTamanho,
  onArquivoChange,
  disabled = false,
  uploadDisabled = false,
  uploadDisabledMessage,
  compact = false,
}: Props) {
  const [helpOpen, setHelpOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const effectiveUploadDisabled = disabled || uploadDisabled || !owner

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    // limpa o value para permitir re-upload do mesmo arquivo
    if (inputRef.current) inputRef.current.value = ''
    if (!file) return
    setError(null)

    if (file.type !== 'application/pdf') {
      setError('Apenas arquivos PDF são aceitos.')
      return
    }
    if (file.size > MAX_BYTES) {
      setError('Tamanho máximo: 4 MB.')
      return
    }
    if (!owner) {
      setError('Salve o projeto antes de anexar o arquivo.')
      return
    }

    try {
      setUploading(true)
      const fd = new FormData()
      fd.append('file', file)
      fd.append('owner_kind', owner.kind)
      fd.append(
        'owner_id',
        String(owner.kind === 'entrega' ? owner.entregaId : owner.atividadeId)
      )

      const resp = await fetch('/api/resultados/upload', { method: 'POST', body: fd })
      if (!resp.ok) {
        const j = await resp.json().catch(() => ({}))
        throw new Error(j?.error || 'Falha no upload.')
      }
      const meta: ResultadoArquivoMeta = await resp.json()

      // Se havia um arquivo anterior, remove-o (evita órfãos).
      const oldPath = arquivoPath
      onArquivoChange(meta)
      if (oldPath && oldPath !== meta.path) {
        fetch('/api/resultados/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: oldPath }),
        }).catch(() => {})
      }
    } catch (err: any) {
      setError(err?.message || 'Erro ao enviar arquivo.')
    } finally {
      setUploading(false)
    }
  }

  async function handleRemove() {
    if (!arquivoPath) return
    if (!confirm('Remover o PDF anexado?')) return
    setError(null)
    try {
      await fetch('/api/resultados/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: arquivoPath }),
      })
    } catch {
      // ignora — mesmo com falha, descarta o vínculo para não travar o fluxo
    }
    onArquivoChange(null)
  }

  return (
    <div
      className={`mt-4 rounded-xl border-2 border-emerald-200 bg-emerald-50/60 ${
        compact ? 'p-4' : 'p-5'
      }`}
    >
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="text-emerald-600" size={compact ? 18 : 20} />
        <h4 className={`font-bold text-emerald-900 ${compact ? 'text-sm' : 'text-base'}`}>
          Resultados e Produtos
        </h4>
        <button
          type="button"
          onClick={() => setHelpOpen(true)}
          className="text-emerald-600 hover:text-emerald-800"
          title="O que registrar aqui?"
          aria-label="Ajuda — Resultados e Produtos"
        >
          <HelpCircle size={16} />
        </button>
      </div>

      <textarea
        value={descricao}
        onChange={e => onDescricaoChange(e.target.value)}
        disabled={disabled}
        rows={compact ? 3 : 4}
        className="input-field w-full bg-white"
        placeholder="Descreva de forma objetiva o que foi entregue: produtos, documentos, valores alcançados, evidências do resultado. Ex.: 'Relatório diagnóstico consolidado e validado pelo comitê, com 27 indicadores revisados.'"
        title="Registre aqui o produto final ou o resultado efetivamente alcançado, para futuras auditorias e relatórios."
      />

      <div className="mt-3">
        {arquivoPath ? (
          <div className="flex items-center gap-3 bg-white border border-emerald-200 rounded-lg px-3 py-2">
            <FileText className="text-emerald-700 shrink-0" size={18} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate" title={arquivoNome || ''}>
                {arquivoNome || 'arquivo.pdf'}
              </p>
              {typeof arquivoTamanho === 'number' && (
                <p className="text-xs text-gray-500">{formatSize(arquivoTamanho)}</p>
              )}
            </div>
            <a
              href={`/api/resultados/download?path=${encodeURIComponent(arquivoPath)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 hover:text-emerald-900 px-2 py-1 rounded hover:bg-emerald-50"
              title="Baixar o PDF comprobatório"
            >
              <Download size={14} /> Baixar
            </a>
            {!disabled && (
              <button
                type="button"
                onClick={handleRemove}
                className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-800 px-2 py-1 rounded hover:bg-red-50"
                title="Remover o PDF anexado"
              >
                <Trash2 size={14} /> Remover
              </button>
            )}
          </div>
        ) : (
          <div>
            <label
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                effectiveUploadDisabled
                  ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-white border-emerald-300 text-emerald-800 hover:bg-emerald-100 cursor-pointer'
              }`}
              title="Apenas arquivos .pdf, tamanho máximo 4 MB. Selecione o documento que comprova o resultado ou o produto desta entrega/atividade."
            >
              {uploading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Upload size={16} />
              )}
              <span>
                {uploading ? 'Enviando...' : 'Anexar PDF comprobatório (máx. 4 MB)'}
              </span>
              <input
                ref={inputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handleFileSelected}
                disabled={effectiveUploadDisabled || uploading}
              />
            </label>
            {uploadDisabled && uploadDisabledMessage && (
              <p className="mt-2 text-xs text-emerald-800/80 italic">
                {uploadDisabledMessage}
              </p>
            )}
          </div>
        )}
        {error && <p className="mt-2 text-xs text-red-600 font-medium">{error}</p>}
      </div>

      {helpOpen && (
        <HelpTooltipModal type="resultados" onClose={() => setHelpOpen(false)} />
      )}
    </div>
  )
}
