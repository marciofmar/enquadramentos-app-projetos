'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, User, Lock, Eye, EyeOff, Check, X, AlertTriangle } from 'lucide-react'
import { PASSWORD_RULES, validatePassword } from '@/lib/password-validation'

export default function PerfilPage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  const forcarSenha = searchParams.get('forcarSenha') === 'true'
  const supabase = createClient()

  // Dados pessoais
  const [nome, setNome] = useState('')
  const [savingNome, setSavingNome] = useState(false)
  const [nomeSaved, setNomeSaved] = useState(false)

  // Troca de senha
  const [senhaAtual, setSenhaAtual] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [showSenhaAtual, setShowSenhaAtual] = useState(false)
  const [showNovaSenha, setShowNovaSenha] = useState(false)
  const [showConfirmar, setShowConfirmar] = useState(false)
  const [savingSenha, setSavingSenha] = useState(false)
  const [senhaError, setSenhaError] = useState('')
  const [senhaSuccess, setSenhaSuccess] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data } = await supabase
        .from('profiles')
        .select('*, setores:setor_id(codigo, nome_completo)')
        .eq('id', user.id)
        .single()

      if (data) {
        setProfile(data)
        setNome(data.nome)
      }
      setLoading(false)
    }
    load()
  }, [])

  async function handleSaveNome() {
    if (!profile || !nome.trim()) return
    setSavingNome(true)
    const { error } = await supabase
      .from('profiles').update({ nome: nome.trim() }).eq('id', profile.id)
    if (error) {
      alert(`Erro: ${error.message}`)
    } else {
      setProfile((p: any) => ({ ...p, nome: nome.trim() }))
      setNomeSaved(true)
      setTimeout(() => setNomeSaved(false), 2000)
    }
    setSavingNome(false)
  }

  async function handleChangeSenha() {
    setSenhaError('')
    setSenhaSuccess('')

    const validation = validatePassword(novaSenha)
    if (!validation.valid) {
      setSenhaError('A senha não atende aos requisitos.')
      return
    }

    if (novaSenha !== confirmarSenha) {
      setSenhaError('As senhas não coincidem.')
      return
    }

    setSavingSenha(true)

    // Se não é modo forçado, verificar senha atual
    if (!forcarSenha) {
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: profile.email,
        password: senhaAtual,
      })
      if (verifyError) {
        setSenhaError('Senha atual incorreta.')
        setSavingSenha(false)
        return
      }
    }

    const { error } = await supabase.auth.updateUser({ password: novaSenha })
    if (error) {
      setSenhaError(error.message)
    } else {
      setSenhaSuccess('Senha alterada com sucesso!')
      setSenhaAtual('')
      setNovaSenha('')
      setConfirmarSenha('')

      // Se modo forçado, limpar flag e redirecionar
      if (forcarSenha) {
        await supabase.from('profiles').update({ senha_zerada: false }).eq('id', profile.id)
        setTimeout(() => router.push('/dashboard'), 1500)
      }
    }
    setSavingSenha(false)
  }

  const passwordValidation = validatePassword(novaSenha)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-sedec-500 font-medium">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {!forcarSenha && (
        <button onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft size={16} /> Voltar
        </button>
      )}

      <h1 className="text-xl font-bold text-gray-800 mb-6">
        {forcarSenha ? 'Definir Nova Senha' : 'Meu Perfil'}
      </h1>

      {forcarSenha && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertTriangle size={20} className="text-amber-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Senha redefinida pelo administrador</p>
            <p className="text-xs text-amber-700 mt-1">
              Sua senha foi zerada. É obrigatório definir uma nova senha antes de continuar usando o sistema.
            </p>
          </div>
        </div>
      )}

      {/* Dados Pessoais - oculto no modo forçado */}
      {!forcarSenha && (
        <div className="card p-6 mb-6">
          <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2 mb-4">
            <User size={18} className="text-sedec-500" /> Dados Pessoais
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  className="input-field flex-1"
                />
                <button
                  onClick={handleSaveNome}
                  disabled={savingNome || nome.trim() === profile?.nome}
                  className="btn-primary px-4 py-2 text-sm disabled:opacity-50"
                >
                  {savingNome ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
              {nomeSaved && <span className="text-xs text-green-600 mt-1">Salvo!</span>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="text" value={profile?.email || ''} disabled
                className="input-field bg-gray-50 text-gray-500 cursor-not-allowed" />
              <p className="text-xs text-gray-400 mt-1">O email só pode ser alterado por um administrador.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Setor</label>
              <input type="text"
                value={profile?.setores ? `${profile.setores.codigo} — ${profile.setores.nome_completo}` : 'Sem setor'}
                disabled
                className="input-field bg-gray-50 text-gray-500 cursor-not-allowed" />
            </div>
          </div>
        </div>
      )}

      {/* Alterar Senha */}
      <div className="card p-6">
        <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2 mb-4">
          <Lock size={18} className="text-sedec-500" /> {forcarSenha ? 'Nova Senha' : 'Alterar Senha'}
        </h2>

        <div className="space-y-4">
          {/* Senha atual - oculto no modo forçado */}
          {!forcarSenha && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Senha atual</label>
              <div className="relative">
                <input
                  type={showSenhaAtual ? 'text' : 'password'}
                  value={senhaAtual}
                  onChange={e => setSenhaAtual(e.target.value)}
                  className="input-field pr-10"
                  placeholder="Digite sua senha atual"
                />
                <button type="button" onClick={() => setShowSenhaAtual(!showSenhaAtual)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showSenhaAtual ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nova senha</label>
            <div className="relative">
              <input
                type={showNovaSenha ? 'text' : 'password'}
                value={novaSenha}
                onChange={e => setNovaSenha(e.target.value)}
                className="input-field pr-10"
                placeholder="Digite a nova senha"
              />
              <button type="button" onClick={() => setShowNovaSenha(!showNovaSenha)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showNovaSenha ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Indicador de requisitos */}
            {novaSenha.length > 0 && (
              <div className="mt-2 space-y-1">
                {PASSWORD_RULES.map((rule, i) => {
                  const pass = rule.test(novaSenha)
                  return (
                    <div key={i} className={`flex items-center gap-1.5 text-xs ${pass ? 'text-green-600' : 'text-gray-400'}`}>
                      {pass ? <Check size={12} /> : <X size={12} />}
                      {rule.label}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar nova senha</label>
            <div className="relative">
              <input
                type={showConfirmar ? 'text' : 'password'}
                value={confirmarSenha}
                onChange={e => setConfirmarSenha(e.target.value)}
                className="input-field pr-10"
                placeholder="Repita a nova senha"
              />
              <button type="button" onClick={() => setShowConfirmar(!showConfirmar)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showConfirmar ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {confirmarSenha.length > 0 && confirmarSenha !== novaSenha && (
              <p className="text-xs text-red-500 mt-1">As senhas não coincidem.</p>
            )}
          </div>

          {senhaError && (
            <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg">{senhaError}</div>
          )}
          {senhaSuccess && (
            <div className="bg-green-50 text-green-700 text-sm px-4 py-3 rounded-lg">{senhaSuccess}</div>
          )}

          <button
            onClick={handleChangeSenha}
            disabled={savingSenha || !passwordValidation.valid || novaSenha !== confirmarSenha || (!forcarSenha && !senhaAtual)}
            className="btn-primary w-full disabled:opacity-50"
          >
            {savingSenha ? 'Salvando...' : forcarSenha ? 'Definir Senha e Continuar' : 'Alterar Senha'}
          </button>
        </div>
      </div>
    </div>
  )
}
