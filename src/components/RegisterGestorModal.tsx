'use client'

import { useState, useEffect } from 'react'
import { X, Loader2 } from 'lucide-react'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSuccess: (newUser: { id: string; nome: string; email: string; role: string; setor_id: number | null; setor_codigo: string | null }) => void
  setores: { id: number; codigo: string; nome_completo: string }[]
  allowedRoles?: ('gestor' | 'usuario')[]
}

const ROLE_LABELS: Record<string, string> = {
  gestor: 'Gestor',
  usuario: 'Usuário',
}

export default function RegisterGestorModal({ isOpen, onClose, onSuccess, setores, allowedRoles }: Props) {
  const roles = allowedRoles && allowedRoles.length > 0 ? allowedRoles : ['gestor'] as ('gestor' | 'usuario')[]
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [setorId, setSetorId] = useState('')
  const [selectedRole, setSelectedRole] = useState<string>(roles[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  // Reset form on open
  useEffect(() => {
    if (isOpen) {
      setNome('')
      setEmail('')
      setSetorId('')
      setSelectedRole(roles[0])
      setError('')
    }
  }, [isOpen])

  if (!mounted || !isOpen) return null

  const showRoleSelector = roles.length > 1
  const titleLabel = showRoleSelector ? 'Cadastrar Novo Usuário' : `Cadastrar Novo ${ROLE_LABELS[roles[0]] || 'Gestor'}`
  const buttonLabel = showRoleSelector ? `Cadastrar ${ROLE_LABELS[selectedRole] || 'Usuário'}` : `Cadastrar ${ROLE_LABELS[roles[0]] || 'Gestor'}`

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!nome.trim()) { setError('Nome é obrigatório.'); return }
    if (!email.trim()) { setError('Email é obrigatório.'); return }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) { setError('Email inválido.'); return }

    if (!setorId) { setError('Selecione o setor.'); return }

    setLoading(true)
    try {
      const res = await fetch('/api/admin/create-gestor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: nome.trim(), email: email.trim(), setor_id: parseInt(setorId), role: selectedRole }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Erro ao cadastrar usuário.')
        setLoading(false)
        return
      }

      const selectedSetor = setores.find(s => s.id === parseInt(setorId))
      onSuccess({ ...data.user, role: selectedRole, setor_id: parseInt(setorId), setor_codigo: selectedSetor?.codigo || null })
      onClose()
    } catch {
      setError('Erro de conexão.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">{titleLabel}</h3>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome completo *</label>
            <input
              type="text"
              value={nome}
              onChange={e => setNome(e.target.value)}
              placeholder="Ex: Cap BM Fulano de Tal"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-sm"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="email@exemplo.com"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-sm"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Setor *</label>
            <select
              value={setorId}
              onChange={e => setSetorId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-sm"
              disabled={loading}
            >
              <option value="">Selecione o setor...</option>
              {setores.map(s => (
                <option key={s.id} value={s.id}>{s.codigo} — {s.nome_completo}</option>
              ))}
            </select>
          </div>

          {showRoleSelector && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Perfil *</label>
              <select
                value={selectedRole}
                onChange={e => setSelectedRole(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-sm"
                disabled={loading}
              >
                {roles.map(r => (
                  <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-1">
                {selectedRole === 'gestor'
                  ? 'Gestor pode criar e editar projetos, entregas e atividades.'
                  : 'Usuário tem apenas permissão de visualização no sistema.'}
              </p>
            </div>
          )}

          <p className="text-xs text-gray-400">
            O {ROLE_LABELS[selectedRole]?.toLowerCase() || 'usuário'} será criado com senha temporária. No primeiro acesso, precisará definir uma nova senha.
          </p>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 disabled:opacity-60 transition-colors flex items-center gap-2"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              {buttonLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
