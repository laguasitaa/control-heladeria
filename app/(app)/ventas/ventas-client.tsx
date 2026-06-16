'use client'

import { useState, useTransition } from 'react'
import { crearVenta, editarVenta, eliminarVenta } from '@/app/actions/ventas'

const MXN = new Intl.NumberFormat('es-MX', {
  style: 'currency', currency: 'MXN', maximumFractionDigits: 0
})

type Venta = {
  id: string
  fecha: string
  monto_total: number
  notas: string | null
}

type Sheet = { mode: 'crear' } | { mode: 'editar'; venta: Venta } | null

export default function VentasClient({ ventas }: { ventas: Venta[] }) {
  const [sheet, setSheet] = useState<Sheet>(null)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const total = ventas.reduce((s, v) => s + Number(v.monto_total), 0)
  const hoy = new Date().toISOString().split('T')[0]
  const editando = sheet?.mode === 'editar' ? sheet.venta : null

  function closeSheet() { setSheet(null); setError(null) }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      try {
        if (sheet?.mode === 'editar') await editarVenta(sheet.venta.id, fd)
        else await crearVenta(fd)
        closeSheet()
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Error inesperado')
      }
    })
  }

  async function handleEliminar(id: string) {
    if (!confirm('¿Eliminar esta venta?')) return
    startTransition(async () => {
      try { await eliminarVenta(id) } catch { /* silencioso */ }
    })
  }

  return (
    <div className="px-5 pt-12 pb-4 max-w-xl mx-auto md:max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-xs" style={{ color: 'var(--c-text-muted)' }}>Mes actual</p>
          <h1 className="text-2xl font-extrabold"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--c-text)' }}>
            Ventas
          </h1>
        </div>
        <button onClick={() => setSheet({ mode: 'crear' })}
          className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl font-bold"
          style={{ background: 'var(--c-accent)', color: '#FFF8ED' }}>
          +
        </button>
      </div>

      {/* Total del mes */}
      {ventas.length > 0 && (
        <div className="rounded-2xl p-4 mb-4 flex justify-between items-center"
          style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
          <span className="text-sm font-medium" style={{ color: 'var(--c-text-muted)' }}>Total del mes</span>
          <span className="text-2xl font-extrabold tabular-nums"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--c-success)' }}>
            {MXN.format(total)}
          </span>
        </div>
      )}

      {/* Lista */}
      {ventas.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-2">💰</p>
          <p className="font-medium" style={{ color: 'var(--c-text)' }}>Sin ventas registradas</p>
          <p className="text-sm mt-1" style={{ color: 'var(--c-text-muted)' }}>Toca + para registrar el cierre del día</p>
        </div>
      ) : (
        <div className="divide-y" style={{ borderColor: 'var(--c-border-subtle)' }}>
          {ventas.map(v => {
            const fecha = new Date(v.fecha + 'T00:00:00')
            const fechaFmt = fecha.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' })
            return (
              <div key={v.id} className="flex items-center justify-between py-3.5 gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold capitalize" style={{ color: 'var(--c-text)' }}>{fechaFmt}</p>
                  {v.notas && (
                    <p className="text-xs truncate mt-0.5" style={{ color: 'var(--c-text-muted)' }}>{v.notas}</p>
                  )}
                </div>
                <span className="text-base font-bold tabular-nums shrink-0"
                  style={{ fontFamily: 'var(--font-display)', color: 'var(--c-success)' }}>
                  {MXN.format(v.monto_total)}
                </span>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => setSheet({ mode: 'editar', venta: v })}
                    className="text-xs" style={{ color: 'var(--c-accent)' }}>editar</button>
                  <button onClick={() => handleEliminar(v.id)}
                    className="text-xs" style={{ color: 'var(--c-danger)' }}>×</button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Bottom sheet */}
      {sheet && (
        <div className="fixed inset-0 z-40 flex items-end"
          style={{ background: 'rgba(28,20,9,0.4)' }}
          onClick={e => { if (e.target === e.currentTarget) closeSheet() }}>
          <div className="w-full rounded-t-3xl p-6"
            style={{ background: 'var(--c-surface)', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}>
            <div className="w-9 h-1 rounded-full mx-auto mb-5" style={{ background: 'var(--c-border)' }} />
            <h2 className="text-lg font-bold mb-5"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--c-text)' }}>
              {sheet.mode === 'crear' ? 'Registrar venta' : 'Editar venta'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--c-text)' }}>
                  Total del día ($)
                </label>
                <input type="number" name="monto_total" required min="0" step="0.01"
                  defaultValue={editando?.monto_total ?? ''}
                  placeholder="0"
                  className="w-full px-4 py-2.5 rounded-xl text-base outline-none"
                  style={{ background: 'var(--c-bg)', border: '1.5px solid var(--c-border)', color: 'var(--c-text)', fontFamily: 'var(--font-body)' }} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--c-text)' }}>Fecha</label>
                <input type="date" name="fecha" required defaultValue={editando?.fecha ?? hoy}
                  className="w-full px-4 py-2.5 rounded-xl text-base outline-none"
                  style={{ background: 'var(--c-bg)', border: '1.5px solid var(--c-border)', color: 'var(--c-text)', fontFamily: 'var(--font-body)' }} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--c-text)' }}>
                  Notas <span style={{ color: 'var(--c-text-muted)', fontWeight: 400 }}>(opcional)</span>
                </label>
                <input type="text" name="notas" defaultValue={editando?.notas ?? ''}
                  placeholder="Ej: Día lento, llovió"
                  className="w-full px-4 py-2.5 rounded-xl text-base outline-none"
                  style={{ background: 'var(--c-bg)', border: '1.5px solid var(--c-border)', color: 'var(--c-text)', fontFamily: 'var(--font-body)' }} />
              </div>
              {error && (
                <p className="text-sm px-4 py-2.5 rounded-xl font-medium"
                  style={{ background: 'var(--c-danger-light)', color: 'var(--c-danger)' }}>{error}</p>
              )}
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={closeSheet}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold"
                  style={{ background: 'var(--c-bg)', border: '1.5px solid var(--c-border)', color: 'var(--c-text-muted)' }}>
                  Cancelar
                </button>
                <button type="submit" disabled={isPending}
                  className="flex-[2] py-3 rounded-xl text-sm font-semibold disabled:opacity-60"
                  style={{ background: 'var(--c-accent)', color: '#FFF8ED' }}>
                  {isPending ? 'Guardando…' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
