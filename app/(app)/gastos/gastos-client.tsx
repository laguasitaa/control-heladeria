'use client'

import { useState, useTransition } from 'react'
import { crearGasto, editarGasto, eliminarGasto } from '@/app/actions/gastos'

const MXN = new Intl.NumberFormat('es-MX', {
  style: 'currency', currency: 'MXN', maximumFractionDigits: 0
})

const CATEGORIAS = ['renta', 'empleados', 'inventario', 'contratos', 'otros']

type Gasto = {
  id: string
  fecha: string
  categoria: string
  monto: number
  descripcion: string | null
}

type Sheet = { mode: 'crear' } | { mode: 'editar'; gasto: Gasto } | null

export default function GastosClient({ gastos }: { gastos: Gasto[] }) {
  const [sheet, setSheet] = useState<Sheet>(null)
  const [filtro, setFiltro] = useState('todos')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const filtrados = filtro === 'todos' ? gastos : gastos.filter(g => g.categoria === filtro)

  function closeSheet() { setSheet(null); setError(null) }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const form = e.currentTarget
    const fd = new FormData(form)

    startTransition(async () => {
      try {
        if (sheet?.mode === 'editar') {
          await editarGasto(sheet.gasto.id, fd)
        } else {
          await crearGasto(fd)
        }
        closeSheet()
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Error inesperado')
      }
    })
  }

  async function handleEliminar(id: string) {
    if (!confirm('¿Eliminar este gasto?')) return
    startTransition(async () => {
      try { await eliminarGasto(id) } catch { /* silencioso */ }
    })
  }

  const hoy = new Date().toISOString().split('T')[0]
  const editando = sheet?.mode === 'editar' ? sheet.gasto : null

  return (
    <div className="px-5 pt-12 pb-4 max-w-xl mx-auto md:max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-xs" style={{ color: 'var(--c-text-muted)' }}>Mes actual</p>
          <h1 className="text-2xl font-extrabold"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--c-text)' }}>
            Gastos
          </h1>
        </div>
        <button
          onClick={() => setSheet({ mode: 'crear' })}
          className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl font-bold transition-opacity"
          style={{ background: 'var(--c-accent)', color: '#FFF8ED' }}>
          +
        </button>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
        {['todos', ...CATEGORIAS].map(cat => (
          <button
            key={cat}
            onClick={() => setFiltro(cat)}
            className="shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-colors"
            style={{
              background: filtro === cat ? 'var(--c-accent-light)' : 'var(--c-surface)',
              color: filtro === cat ? 'var(--c-accent)' : 'var(--c-text-muted)',
              border: filtro === cat ? '1.5px solid var(--c-accent)' : '1.5px solid var(--c-border)',
            }}>
            {cat === 'todos' ? 'Todos' : cat}
          </button>
        ))}
      </div>

      {/* Lista */}
      {filtrados.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-2">📋</p>
          <p className="font-medium" style={{ color: 'var(--c-text)' }}>Sin gastos este mes</p>
          <p className="text-sm mt-1" style={{ color: 'var(--c-text-muted)' }}>Toca + para registrar uno</p>
        </div>
      ) : (
        <div className="divide-y" style={{ borderColor: 'var(--c-border-subtle)' }}>
          {filtrados.map(g => {
            const nombre = g.categoria.charAt(0).toUpperCase() + g.categoria.slice(1)
            const fecha = new Date(g.fecha + 'T00:00:00')
            const fechaFmt = fecha.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
            return (
              <div key={g.id} className="grid py-3.5"
                style={{ gridTemplateColumns: '1fr auto', gap: '2px 12px' }}>
                <span className="text-sm font-semibold" style={{ color: 'var(--c-text)' }}>{nombre}</span>
                <span className="text-base font-bold tabular-nums row-span-2 self-center"
                  style={{ fontFamily: 'var(--font-display)', color: 'var(--c-text)', textAlign: 'right' }}>
                  {MXN.format(g.monto)}
                </span>
                <div className="flex items-center gap-2">
                  {g.descripcion && (
                    <span className="text-xs truncate max-w-[160px]"
                      style={{ color: 'var(--c-text-muted)' }}>{g.descripcion}</span>
                  )}
                  <span className="text-xs shrink-0" style={{ color: 'var(--c-text-muted)' }}>{fechaFmt}</span>
                  <button onClick={() => setSheet({ mode: 'editar', gasto: g })}
                    className="text-xs shrink-0" style={{ color: 'var(--c-accent)' }}>editar</button>
                  <button onClick={() => handleEliminar(g.id)}
                    className="text-xs shrink-0" style={{ color: 'var(--c-danger)' }}>×</button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Bottom sheet backdrop */}
      {sheet && (
        <div
          className="fixed inset-0 z-40 flex items-end"
          style={{ background: 'rgba(28,20,9,0.4)' }}
          onClick={e => { if (e.target === e.currentTarget) closeSheet() }}>
          <div
            className="w-full rounded-t-3xl p-6"
            style={{ background: 'var(--c-surface)', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}>

            {/* Handle */}
            <div className="w-9 h-1 rounded-full mx-auto mb-5"
              style={{ background: 'var(--c-border)' }} />

            <h2 className="text-lg font-bold mb-5"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--c-text)' }}>
              {sheet.mode === 'crear' ? 'Nuevo gasto' : 'Editar gasto'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Categoría */}
              <div>
                <label className="block text-sm font-semibold mb-1.5"
                  style={{ color: 'var(--c-text)' }}>Categoría</label>
                <select name="categoria" required defaultValue={editando?.categoria ?? ''}
                  className="w-full px-4 py-2.5 rounded-xl text-base outline-none"
                  style={{ background: 'var(--c-bg)', border: '1.5px solid var(--c-border)', color: 'var(--c-text)', fontFamily: 'var(--font-body)' }}>
                  <option value="">Selecciona…</option>
                  {CATEGORIAS.map(c => (
                    <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                  ))}
                </select>
              </div>

              {/* Monto */}
              <div>
                <label className="block text-sm font-semibold mb-1.5"
                  style={{ color: 'var(--c-text)' }}>Monto ($)</label>
                <input type="number" name="monto" required min="0.01" step="0.01"
                  defaultValue={editando?.monto ?? ''}
                  placeholder="0"
                  className="w-full px-4 py-2.5 rounded-xl text-base outline-none"
                  style={{ background: 'var(--c-bg)', border: '1.5px solid var(--c-border)', color: 'var(--c-text)', fontFamily: 'var(--font-body)' }} />
              </div>

              {/* Fecha */}
              <div>
                <label className="block text-sm font-semibold mb-1.5"
                  style={{ color: 'var(--c-text)' }}>Fecha</label>
                <input type="date" name="fecha" required
                  defaultValue={editando?.fecha ?? hoy}
                  className="w-full px-4 py-2.5 rounded-xl text-base outline-none"
                  style={{ background: 'var(--c-bg)', border: '1.5px solid var(--c-border)', color: 'var(--c-text)', fontFamily: 'var(--font-body)' }} />
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-semibold mb-1.5"
                  style={{ color: 'var(--c-text)' }}>Descripción <span style={{ color: 'var(--c-text-muted)', fontWeight: 400 }}>(opcional)</span></label>
                <input type="text" name="descripcion"
                  defaultValue={editando?.descripcion ?? ''}
                  placeholder="Ej: Renta local Km 5"
                  className="w-full px-4 py-2.5 rounded-xl text-base outline-none"
                  style={{ background: 'var(--c-bg)', border: '1.5px solid var(--c-border)', color: 'var(--c-text)', fontFamily: 'var(--font-body)' }} />
              </div>

              {error && (
                <p className="text-sm px-4 py-2.5 rounded-xl font-medium"
                  style={{ background: 'var(--c-danger-light)', color: 'var(--c-danger)' }}>
                  {error}
                </p>
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
                  {isPending ? 'Guardando…' : 'Guardar gasto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
