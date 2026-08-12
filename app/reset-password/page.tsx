'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [listo, setListo] = useState(false)
  const [sesionValida, setSesionValida] = useState<boolean | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // El link de recuperación deja una sesión temporal activa (tipo "recovery")
    supabase.auth.getSession().then(({ data }) => {
      setSesionValida(!!data.session)
    })
  }, [supabase])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }
    if (password !== password2) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (error) {
      setError('No se pudo actualizar la contraseña. Intenta de nuevo.')
      return
    }

    setListo(true)
    setTimeout(() => {
      router.push('/dashboard')
      router.refresh()
    }, 1800)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6"
      style={{ background: 'var(--c-bg)' }}>
      <div className="w-full max-w-sm">

        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{ background: 'var(--c-accent)' }}>
            <span className="text-3xl">🔑</span>
          </div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--c-text)' }}>
            Nueva contraseña
          </h1>
        </div>

        {sesionValida === false && (
          <p className="text-sm font-medium px-4 py-3 rounded-xl text-center"
            style={{ background: 'var(--c-danger-light)', color: 'var(--c-danger)' }}>
            Este link ya expiró o no es válido. Pide uno nuevo desde la pantalla de login.
          </p>
        )}

        {sesionValida && listo && (
          <p className="text-sm font-medium px-4 py-3 rounded-xl text-center"
            style={{ background: 'var(--c-success-light)', color: 'var(--c-success)' }}>
            ✓ Contraseña actualizada. Entrando…
          </p>
        )}

        {sesionValida && !listo && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--c-text)' }}>
                Contraseña nueva
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl text-base outline-none transition-colors"
                style={{ background: 'var(--c-surface)', border: '1.5px solid var(--c-border)', color: 'var(--c-text)', fontFamily: 'var(--font-body)' }}
                onFocus={e => (e.target.style.borderColor = 'var(--c-accent)')}
                onBlur={e => (e.target.style.borderColor = 'var(--c-border)')}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--c-text)' }}>
                Confírmala
              </label>
              <input
                type="password"
                value={password2}
                onChange={e => setPassword2(e.target.value)}
                required
                autoComplete="new-password"
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl text-base outline-none transition-colors"
                style={{ background: 'var(--c-surface)', border: '1.5px solid var(--c-border)', color: 'var(--c-text)', fontFamily: 'var(--font-body)' }}
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
              {loading ? 'Guardando…' : 'Guardar contraseña'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
