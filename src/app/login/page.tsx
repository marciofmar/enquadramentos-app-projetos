'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Shield, Eye, EyeOff, Check, X, Mail } from 'lucide-react'
import { PASSWORD_RULES, validatePassword } from '@/lib/password-validation'

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
  const [emailAtivo, setEmailAtivo] = useState(false)
  const [showForgot, setShowForgot] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotMessage, setForgotMessage] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.from('setores').select('id, codigo, nome_completo').eq('visivel_cadastro', true).order('codigo')
      .then(({ data }) => { if (data) setSetores(data) })
    // Carregar config de email
    supabase.from('configuracoes').select('valor').eq('chave', 'email_funcoes_ativas').single()
      .then(({ data }) => { if (data) setEmailAtivo(data.valor === 'true') })
  }, [])

  const passwordCheck = validatePassword(password)

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

      // Validar senha forte no cadastro
      if (!passwordCheck.valid) {
        setError('A senha não atende aos requisitos de segurança.')
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
      } else if (signUpData.user && !emailAtivo) {
        // Email desativado — auto-confirmar via API
        await fetch('/api/auth/auto-confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: signUpData.user.id }),
        })
        if (signUpData.session) {
          router.push('/dashboard')
          router.refresh()
        } else {
          // Fallback: se não tiver session, tentar login
          const { error: loginErr } = await supabase.auth.signInWithPassword({ email, password })
          if (!loginErr) {
            router.push('/dashboard')
            router.refresh()
          } else {
            setMessage('Conta criada! Faça login para continuar.')
          }
        }
      } else if (signUpData.session) {
        router.push('/dashboard')
        router.refresh()
      } else {
        // Confirmação de email habilitada — aguardar verificação
        setMessage('Conta criada com sucesso! Verifique seu email para confirmar o cadastro.')
      }
    } else {
      // Login normal
      if (!password) {
        // Senha vazia — tentar login com senha zerada
        try {
          const res = await fetch('/api/auth/login-reset', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
          })
          if (res.ok) {
            const { reset_token } = await res.json()
            // Fazer signIn no client (browser client usa publishable key, funciona com GoTrue)
            const { error: signInError } = await supabase.auth.signInWithPassword({
              email,
              password: reset_token,
            })
            if (signInError) {
              setError('Email ou senha incorretos.')
            } else {
              router.push('/dashboard/perfil?forcarSenha=true')
              router.refresh()
            }
          } else {
            setError('Email ou senha incorretos.')
          }
        } catch {
          setError('Email ou senha incorretos.')
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
    }
    setLoading(false)
  }

  async function handleForgotPassword() {
    if (!forgotEmail) return
    setForgotLoading(true)
    setForgotMessage('')
    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: `${window.location.origin}/dashboard/perfil`,
    })
    if (error) {
      setForgotMessage('Erro ao enviar email. Tente novamente.')
    } else {
      setForgotMessage('Email enviado! Verifique sua caixa de entrada.')
    }
    setForgotLoading(false)
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

        {showForgot ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 space-y-5">
            <h2 className="text-lg font-semibold text-gray-800 text-center">Recuperar senha</h2>
            <p className="text-sm text-gray-500 text-center">
              Informe seu email e enviaremos um link para redefinir sua senha.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={forgotEmail}
                onChange={e => setForgotEmail(e.target.value)}
                className="input-field"
                placeholder="seu.email@defesacivil.rj.gov.br"
              />
            </div>
            {forgotMessage && (
              <div className={`text-sm px-4 py-3 rounded-lg ${
                forgotMessage.includes('Erro') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
              }`}>{forgotMessage}</div>
            )}
            <button onClick={handleForgotPassword} disabled={forgotLoading || !forgotEmail}
              className="btn-primary w-full disabled:opacity-50">
              {forgotLoading ? 'Enviando...' : 'Enviar link de recuperação'}
            </button>
            <div className="text-center">
              <button type="button" onClick={() => { setShowForgot(false); setForgotMessage('') }}
                className="text-sm text-sedec-500 hover:text-sedec-700">
                Voltar ao login
              </button>
            </div>
          </div>
        ) : (
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
                  {...(isSignUp ? { required: true, minLength: 8 } : {})}
                  placeholder={isSignUp ? 'Crie uma senha forte' : '••••••'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Indicador de requisitos no cadastro */}
              {isSignUp && password.length > 0 && (
                <div className="mt-2 space-y-1">
                  {PASSWORD_RULES.map((rule, i) => {
                    const pass = rule.test(password)
                    return (
                      <div key={i} className={`flex items-center gap-1.5 text-xs ${pass ? 'text-green-600' : 'text-gray-400'}`}>
                        {pass ? <Check size={12} /> : <X size={12} />}
                        {rule.label}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Dica de senha zerada (só no login, não no cadastro) */}
              {!isSignUp && (
                <p className="text-xs text-gray-400 mt-1">
                  Se sua senha foi zerada pelo administrador, deixe este campo vazio.
                </p>
              )}
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

            <div className="text-center space-y-2">
              <button
                type="button"
                onClick={() => { setIsSignUp(!isSignUp); setError(''); setMessage('') }}
                className="text-sm text-sedec-500 hover:text-sedec-700 block mx-auto"
              >
                {isSignUp ? 'Já tem conta? Entrar' : 'Não tem conta? Criar'}
              </button>

              {/* Link "Esqueceu a senha?" — só quando email ativado e no modo login */}
              {!isSignUp && emailAtivo && (
                <button
                  type="button"
                  onClick={() => { setShowForgot(true); setForgotEmail(email) }}
                  className="text-xs text-gray-400 hover:text-sedec-500 block mx-auto"
                >
                  Esqueceu a senha?
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
