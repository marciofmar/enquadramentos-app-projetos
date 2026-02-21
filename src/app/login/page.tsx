'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Shield, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nome, setNome] = useState('')
  const [setorId, setSetorId] = useState('')
  const [setores, setSetores] = useState<{ id: number; codigo: string; nome_completo: string }[]>([])
  const [isSignUp, setIsSignUp] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.from('setores').select('id, codigo, nome_completo').order('codigo')
      .then(({ data }) => { if (data) setSetores(data) })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    if (isSignUp) {
      if (!setorId) {
        setError('Selecione seu setor de lotação.')
        setLoading(false)
        return
      }

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { nome, setor_id: parseInt(setorId) } }
      })
      if (signUpError) {
        setError(signUpError.message)
      } else if (signUpData.session) {
        // Confirmação de email desabilitada — já logado
        router.push('/dashboard')
        router.refresh()
      } else {
        // Confirmação de email habilitada — aguardar verificação
        setMessage('Conta criada com sucesso! Verifique seu email para confirmar o cadastro.')
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError('Email ou senha incorretos.')
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-orange-400 to-yellow-500" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <img src="/logo-sedec.png" alt="SEDEC-RJ" className="h-14 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-white">Enquadramentos Estratégicos</h1>
          <p className="text-gray-400 mt-1 text-sm">Plano Estratégico 2024–2035 • ICTDEC / DAEAD</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 space-y-5">
          <h2 className="text-lg font-semibold text-gray-800 text-center">
            {isSignUp ? 'Criar conta' : 'Entrar no sistema'}
          </h2>

          {isSignUp && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome completo</label>
                <input
                  type="text"
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  className="input-field"
                  required
                  placeholder="Seu nome"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Setor de lotação <span className="text-red-500">*</span>
                </label>
                <select
                  value={setorId}
                  onChange={e => setSetorId(e.target.value)}
                  className="input-field"
                  required
                >
                  <option value="">Selecione seu setor...</option>
                  {setores.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.codigo} — {s.nome_completo}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-400 mt-1">
                  Seu setor determina as permissões de edição de projetos.
                </p>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="input-field"
              required
              placeholder="seu.email@defesacivil.rj.gov.br"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input-field pr-10"
                required
                minLength={6}
                placeholder="••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
          )}
          {message && (
            <div className="bg-green-50 text-green-700 text-sm px-4 py-3 rounded-lg">{message}</div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Aguarde...' : isSignUp ? 'Criar conta' : 'Entrar'}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => { setIsSignUp(!isSignUp); setError(''); setMessage('') }}
              className="text-sm text-sedec-500 hover:text-sedec-700"
            >
              {isSignUp ? 'Já tem conta? Entrar' : 'Não tem conta? Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
