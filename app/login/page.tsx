'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [modoRecuperar, setModoRecuperar] = useState(false)
  const [recuperarEnviado, setRecuperarEnviado] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Email o contraseña incorrectos.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  async function handleRecuperar(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    setLoading(false)

    if (error) {
      setError('No se pudo enviar el correo. Intenta de nuevo.')
      return
    }

    setRecuperarEnviado(true)
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
            Inicia sesión para continuar
          </p>
        </div>

        {/* Modo: recuperar contraseña */}
        {modoRecuperar ? (
          recuperarEnviado ? (
            <div className="text-center space-y-4">
              <p className="text-3xl">📬</p>
              <p className="text-sm" style={{ color: 'var(--c-text)' }}>
                Te mandamos un correo a <strong>{email}</strong> con un link para poner tu contraseña nueva.
              </p>
              <button
                onClick={() => { setModoRecuperar(false); setRecuperarEnviado(false); setError(null) }}
                className="text-sm font-semibold"
                style={{ color: 'var(--c-accent)' }}>
                ← Volver a iniciar sesión
              </button>
            </div>
          ) : (
            <form onSubmit={handleRecuperar} className="space-y-4">
              <p className="text-sm mb-2" style={{ color: 'var(--c-text-muted)' }}>
                Escribe tu correo y te mandamos un link para poner una contraseña nueva.
              </p>
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
                style={{ background: 'var(--c-accent)', color: '#FFF8ED', fontFamily: 'var(--font-body)' }}>
                {loading ? 'Enviando…' : 'Mandar link'}
              </button>

              <button
                type="button"
                onClick={() => { setModoRecuperar(false); setError(null) }}
                className="w-full text-center text-sm font-semibold"
                style={{ color: 'var(--c-text-muted)' }}>
                ← Volver a iniciar sesión
              </button>
            </form>
          )
        ) : (
          <>
            {/* Formulario de login */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5"
                  style={{ color: 'var(--c-text)' }}>
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

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-semibold" style={{ color: 'var(--c-text)' }}>
                    Contraseña
                  </label>
                  <button
                    type="button"
                    onClick={() => { setModoRecuperar(true); setError(null) }}
                    className="text-xs font-semibold"
                    style={{ color: 'var(--c-accent)' }}>
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
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
                {loading ? 'Entrando…' : 'Entrar'}
              </button>
            </form>

            <p className="text-center text-xs mt-6" style={{ color: 'var(--c-text-muted)' }}>
              No hay registro abierto — acceso solo por invitación.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
