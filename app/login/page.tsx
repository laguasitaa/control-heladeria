'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
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

        {/* Formulario */}
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
            <label className="block text-sm font-semibold mb-1.5"
              style={{ color: 'var(--c-text)' }}>
              Contraseña
            </label>
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
      </div>
    </div>
  )
}
