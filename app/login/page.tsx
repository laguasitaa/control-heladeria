'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [codigo, setCodigo] = useState('')
  const [paso, setPaso] = useState<'email' | 'codigo'>('email')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const codigoRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = createClient()

  async function handlePedirCodigo(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    })

    setLoading(false)

    if (error) {
      setError('No se pudo enviar el código. Intenta de nuevo.')
      return
    }

    setPaso('codigo')
    setTimeout(() => codigoRef.current?.focus(), 100)
  }

  async function handleVerificarCodigo(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: codigo,
      type: 'email',
    })

    if (error) {
      setError('Código incorrecto o vencido.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  function volverAEmail() {
    setPaso('email')
    setCodigo('')
    setError(null)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6"
      style={{ background: 'var(--c-bg)' }}>
      <div className="w-full max-w-sm">

        {/* Logo + nombre */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{ background: 'var(--c-accent)' }}>
            <span className="text-3xl">🍦</span>
          </div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--c-text)' }}>
            Panel Heladería
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--c-text-muted)' }}>
            {paso === 'email' ? 'Inicia sesión para continuar' : 'Revisa tu correo'}
          </p>
        </div>

        {paso === 'email' ? (
          <>
            {/* Paso 1: pedir código */}
            <form onSubmit={handlePedirCodigo} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--c-text)' }}>
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="tu@email.com"
                  className="w-full px-4 py-2.5 rounded-xl text-base outline-none transition-colors"
                  style={{
                    background: 'var(--c-surface)',
                    border: '1.5px solid var(--c-border)',
                    color: 'var(--c-text)',
                    fontFamily: 'var(--font-body)',
                  }}
                  onFocus={e => (e.target.style.borderColor = 'var(--c-accent)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--c-border)')}
                />
              </div>

              {error && (
                <p className="text-sm font-medium px-4 py-3 rounded-xl"
                  style={{ background: 'var(--c-danger-light)', color: 'var(--c-danger)' }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-sm font-semibold transition-opacity disabled:opacity-60 mt-2"
                style={{
                  background: 'var(--c-accent)',
                  color: '#FFF8ED',
                  fontFamily: 'var(--font-body)',
                }}>
                {loading ? 'Enviando…' : 'Mandar código'}
              </button>
            </form>

            <p className="text-center text-xs mt-6" style={{ color: 'var(--c-text-muted)' }}>
              No hay registro abierto — acceso solo por invitación.
            </p>
          </>
        ) : (
          <>
            {/* Paso 2: verificar código */}
            <form onSubmit={handleVerificarCodigo} className="space-y-4">
              <p className="text-sm text-center mb-2" style={{ color: 'var(--c-text-muted)' }}>
                Te mandamos un código de 6 dígitos a <strong style={{ color: 'var(--c-text)' }}>{email}</strong>
              </p>
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--c-text)' }}>
                  Código
                </label>
                <input
                  ref={codigoRef}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={codigo}
                  onChange={e => setCodigo(e.target.value.replace(/\D/g, ''))}
                  required
                  autoComplete="one-time-code"
                  placeholder="000000"
                  className="w-full px-4 py-3 rounded-xl text-center text-2xl tracking-[0.5em] outline-none transition-colors"
                  style={{
                    background: 'var(--c-surface)',
                    border: '1.5px solid var(--c-border)',
                    color: 'var(--c-text)',
                    fontFamily: 'var(--font-display)',
                  }}
                  onFocus={e => (e.target.style.borderColor = 'var(--c-accent)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--c-border)')}
                />
              </div>

              {error && (
                <p className="text-sm font-medium px-4 py-3 rounded-xl"
                  style={{ background: 'var(--c-danger-light)', color: 'var(--c-danger)' }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading || codigo.length !== 6}
                className="w-full py-3 rounded-xl text-sm font-semibold transition-opacity disabled:opacity-60 mt-2"
                style={{
                  background: 'var(--c-accent)',
                  color: '#FFF8ED',
                  fontFamily: 'var(--font-body)',
                }}>
                {loading ? 'Verificando…' : 'Entrar'}
              </button>

              <button
                type="button"
                onClick={volverAEmail}
                className="w-full text-center text-sm font-semibold"
                style={{ color: 'var(--c-text-muted)' }}>
                ← Usar otro correo
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
