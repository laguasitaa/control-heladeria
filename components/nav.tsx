'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from '@/app/actions/auth'

const NAV = [
  { href: '/dashboard',  label: 'Inicio',      icon: '📊' },
  { href: '/gastos',     label: 'Gastos',      icon: '📋' },
  { href: '/ventas',     label: 'Ventas',      icon: '💰' },
  { href: '/documentos', label: 'Documentos',  icon: '📁' },
]

export function BottomNav() {
  const path = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex border-t"
      style={{ background: 'var(--c-surface)', borderColor: 'var(--c-border)', height: 60 }}
    >
      {NAV.map(item => {
        const active = path.startsWith(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors"
            style={{ color: active ? 'var(--c-accent)' : 'var(--c-text-muted)' }}
          >
            <span className="text-xl leading-none">{item.icon}</span>
            <span className="text-[10px] font-semibold leading-none">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

export function Sidebar() {
  const path = usePathname()

  return (
    <aside
      className="hidden md:flex flex-col w-56 shrink-0 border-r h-screen sticky top-0"
      style={{ background: 'var(--c-surface)', borderColor: 'var(--c-border)' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6 border-b"
        style={{ borderColor: 'var(--c-border)' }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl shrink-0"
          style={{ background: 'var(--c-accent)' }}>
          🍦
        </div>
        <div>
          <div className="text-sm font-bold leading-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--c-text)' }}>
            Heladería
          </div>
          <div className="text-xs" style={{ color: 'var(--c-text-muted)' }}>Panel de control</div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(item => {
          const active = path.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors"
              style={{
                background: active ? 'var(--c-accent-light)' : 'transparent',
                color: active ? 'var(--c-accent)' : 'var(--c-text-muted)',
                fontFamily: 'var(--font-body)',
              }}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Sign out */}
      <div className="px-3 pb-6">
        <form action={signOut}>
          <button
            type="submit"
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors"
            style={{ color: 'var(--c-text-muted)', fontFamily: 'var(--font-body)' }}
          >
            <span className="text-base">↩</span>
            Cerrar sesión
          </button>
        </form>
      </div>
    </aside>
  )
}
