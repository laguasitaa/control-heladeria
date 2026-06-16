'use client'

import { useState, useTransition } from 'react'
import {
  crearProducto, editarProducto, eliminarProducto,
  guardarStockInicial, registrarConsumo, eliminarConsumo
} from '@/app/actions/inventario'

const CATEGORIAS = ['lácteos', 'frutas', 'endulzantes', 'envases', 'insumos', 'otros']
const UNIDADES = ['kg', 'g', 'L', 'mL', 'piezas', 'bolsas', 'cajas', 'latas']

const ICONO_CAT: Record<string, string> = {
  'lácteos': '🥛', frutas: '🍓', endulzantes: '🍯',
  envases: '📦', insumos: '🧴', otros: '📎',
}

type Item = { id: string; nombre: string; unidad: string; categoria: string }
type Registro = { id: string; item_id: string; stock_inicial: number; mes: number; anio: number; notas: string | null }
type Consumo = { id: string; registro_id: string; cantidad: number; fecha: string; notas: string | null }

type Sheet =
  | { mode: 'nuevo-producto' }
  | { mode: 'editar-producto'; item: Item }
  | { mode: 'stock-inicial'; item: Item; registro: Registro | null }
  | { mode: 'consumo'; item: Item; registro: Registro }
  | { mode: 'historial'; item: Item; registro: Registro }
  | null

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

function semaforo(pct: number) {
  if (pct > 50) return 'var(--c-success)'
  if (pct > 20) return 'var(--c-warning)'
  return 'var(--c-danger)'
}

export default function InventarioClient({
  items, registros, consumos, mes, anio
}: {
  items: Item[]
  registros: Registro[]
  consumos: Consumo[]
  mes: number
  anio: number
}) {
  const [sheet, setSheet] = useState<Sheet>(null)
  const [filtro, setFiltro] = useState('todos')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const hoy = new Date().toISOString().split('T')[0]

  function closeSheet() { setSheet(null); setError(null) }

  // Helpers
  const registroPorItem = (itemId: string) =>
    registros.find(r => r.item_id === itemId) ?? null

  const consumosPorRegistro = (registroId: string) =>
    consumos.filter(c => c.registro_id === registroId)

  const stockActual = (item: Item) => {
    const reg = registroPorItem(item.id)
    if (!reg) return null
    const totalConsumo = consumosPorRegistro(reg.id)
      .reduce((s, c) => s + Number(c.cantidad), 0)
    return Math.max(0, Number(reg.stock_inicial) - totalConsumo)
  }

  const pctStock = (item: Item) => {
    const reg = registroPorItem(item.id)
    if (!reg || reg.stock_inicial === 0) return 0
    const actual = stockActual(item) ?? 0
    return Math.round((actual / Number(reg.stock_inicial)) * 100)
  }

  const filtrados = filtro === 'todos' ? items : items.filter(i => i.categoria === filtro)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      try {
        if (sheet?.mode === 'nuevo-producto') await crearProducto(fd)
        else if (sheet?.mode === 'editar-producto') await editarProducto(sheet.item.id, fd)
        else if (sheet?.mode === 'stock-inicial') await guardarStockInicial(sheet.item.id, fd)
        else if (sheet?.mode === 'consumo') await registrarConsumo(sheet.registro.id, fd)
        closeSheet()
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Error inesperado')
      }
    })
  }

  async function handleEliminarProducto(id: string) {
    if (!confirm('¿Eliminar este producto del catálogo?')) return
    startTransition(async () => { try { await eliminarProducto(id) } catch {} })
  }

  async function handleEliminarConsumo(id: string) {
    if (!confirm('¿Eliminar este registro de consumo?')) return
    startTransition(async () => { try { await eliminarConsumo(id) } catch {} })
  }

  const sheetEditando = sheet?.mode === 'editar-producto' ? sheet.item : null
  const sheetStock = sheet?.mode === 'stock-inicial' ? sheet : null
  const sheetConsumo = sheet?.mode === 'consumo' ? sheet : null
  const sheetHistorial = sheet?.mode === 'historial' ? sheet : null

  return (
    <div className="px-5 pt-12 pb-4 max-w-xl mx-auto md:max-w-2xl">

      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div>
          <p className="text-xs" style={{ color: 'var(--c-text-muted)' }}>
            {MESES[mes - 1]} {anio}
          </p>
          <h1 className="text-2xl font-extrabold"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--c-text)' }}>
            Inventario
          </h1>
        </div>
        <button
          onClick={() => setSheet({ mode: 'nuevo-producto' })}
          className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl font-bold"
          style={{ background: 'var(--c-accent)', color: '#FFF8ED' }}>
          +
        </button>
      </div>
      <p className="text-xs mb-5" style={{ color: 'var(--c-text-muted)' }}>
        Toca un producto para registrar consumo o actualizar stock inicial
      </p>

      {/* Filtros */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
        {['todos', ...CATEGORIAS].map(cat => (
          <button key={cat} onClick={() => setFiltro(cat)}
            className="shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold capitalize"
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
          <p className="text-4xl mb-2">📦</p>
          <p className="font-medium" style={{ color: 'var(--c-text)' }}>Sin productos</p>
          <p className="text-sm mt-1" style={{ color: 'var(--c-text-muted)' }}>
            Toca + para agregar tu primer producto
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtrados.map(item => {
            const reg = registroPorItem(item.id)
            const actual = stockActual(item)
            const pct = pctStock(item)
            const color = reg ? semaforo(pct) : 'var(--c-border)'
            const icono = ICONO_CAT[item.categoria] ?? '📎'
            const numConsumos = reg ? consumosPorRegistro(reg.id).length : 0

            return (
              <div key={item.id}
                className="rounded-2xl p-4"
                style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>

                <div className="flex items-start gap-3">
                  {/* Icono categoría */}
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                    style={{ background: 'var(--c-accent-light)' }}>
                    {icono}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold truncate" style={{ color: 'var(--c-text)' }}>
                        {item.nombre}
                      </p>
                      <div className="flex gap-1.5 shrink-0">
                        <button
                          onClick={() => setSheet({ mode: 'editar-producto', item })}
                          className="text-xs" style={{ color: 'var(--c-accent)' }}>
                          editar
                        </button>
                        <button
                          onClick={() => handleEliminarProducto(item.id)}
                          className="text-xs" style={{ color: 'var(--c-danger)' }}>
                          ×
                        </button>
                      </div>
                    </div>

                    <p className="text-xs capitalize mt-0.5" style={{ color: 'var(--c-text-muted)' }}>
                      {item.categoria} · {item.unidad}
                    </p>

                    {/* Stock */}
                    {reg ? (
                      <div className="mt-2">
                        <div className="flex justify-between items-baseline mb-1">
                          <span className="text-xs font-semibold tabular-nums" style={{ color }}>
                            {actual?.toLocaleString('es-MX', { maximumFractionDigits: 2 })} {item.unidad}
                          </span>
                          <span className="text-xs" style={{ color: 'var(--c-text-muted)' }}>
                            de {Number(reg.stock_inicial).toLocaleString('es-MX', { maximumFractionDigits: 2 })} inicial · {pct}%
                          </span>
                        </div>
                        {/* Barra semáforo */}
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--c-border)' }}>
                          <div className="h-full rounded-full transition-all"
                            style={{ width: `${Math.min(pct, 100)}%`, background: color }} />
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs mt-2 italic" style={{ color: 'var(--c-text-muted)' }}>
                        Sin stock inicial este mes
                      </p>
                    )}
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => setSheet({ mode: 'stock-inicial', item, registro: reg })}
                    className="flex-1 py-2 rounded-xl text-xs font-semibold"
                    style={{ background: 'var(--c-bg)', border: '1.5px solid var(--c-border)', color: 'var(--c-text-muted)' }}>
                    {reg ? '✏️ Stock inicial' : '📥 Cargar stock'}
                  </button>
                  {reg && (
                    <>
                      <button
                        onClick={() => setSheet({ mode: 'consumo', item, registro: reg })}
                        className="flex-1 py-2 rounded-xl text-xs font-semibold"
                        style={{ background: 'var(--c-accent-light)', color: 'var(--c-accent)', border: '1.5px solid var(--c-accent)' }}>
                        − Consumo
                      </button>
                      {numConsumos > 0 && (
                        <button
                          onClick={() => setSheet({ mode: 'historial', item, registro: reg })}
                          className="py-2 px-3 rounded-xl text-xs font-semibold"
                          style={{ background: 'var(--c-surface)', border: '1.5px solid var(--c-border)', color: 'var(--c-text-muted)' }}>
                          {numConsumos} mov.
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Bottom Sheet ──────────────────────────────────────────────────── */}
      {sheet && (
        <div className="fixed inset-0 z-40 flex items-end"
          style={{ background: 'rgba(28,20,9,0.4)' }}
          onClick={e => { if (e.target === e.currentTarget) closeSheet() }}>
          <div className="w-full rounded-t-3xl p-6"
            style={{ background: 'var(--c-surface)', maxHeight: '92vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}>
            <div className="w-9 h-1 rounded-full mx-auto mb-5" style={{ background: 'var(--c-border)' }} />

            {/* ── Nuevo / Editar producto ── */}
            {(sheet.mode === 'nuevo-producto' || sheet.mode === 'editar-producto') && (
              <>
                <h2 className="text-lg font-bold mb-5"
                  style={{ fontFamily: 'var(--font-display)', color: 'var(--c-text)' }}>
                  {sheet.mode === 'nuevo-producto' ? 'Nuevo producto' : 'Editar producto'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--c-text)' }}>Nombre</label>
                    <input type="text" name="nombre" required
                      defaultValue={sheetEditando?.nombre ?? ''}
                      placeholder="Ej: Leche entera"
                      className="w-full px-4 py-2.5 rounded-xl text-base outline-none"
                      style={{ background: 'var(--c-bg)', border: '1.5px solid var(--c-border)', color: 'var(--c-text)', fontFamily: 'var(--font-body)' }} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--c-text)' }}>Categoría</label>
                      <select name="categoria" required defaultValue={sheetEditando?.categoria ?? ''}
                        className="w-full px-4 py-2.5 rounded-xl text-base outline-none"
                        style={{ background: 'var(--c-bg)', border: '1.5px solid var(--c-border)', color: 'var(--c-text)', fontFamily: 'var(--font-body)' }}>
                        <option value="">Selecciona…</option>
                        {CATEGORIAS.map(c => (
                          <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--c-text)' }}>Unidad</label>
                      <select name="unidad" required defaultValue={sheetEditando?.unidad ?? 'kg'}
                        className="w-full px-4 py-2.5 rounded-xl text-base outline-none"
                        style={{ background: 'var(--c-bg)', border: '1.5px solid var(--c-border)', color: 'var(--c-text)', fontFamily: 'var(--font-body)' }}>
                        {UNIDADES.map(u => <option key={u} value={u}>{u}</option>)}
                      </select>
                    </div>
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
              </>
            )}

            {/* ── Stock inicial ── */}
            {sheet.mode === 'stock-inicial' && (
              <>
                <h2 className="text-lg font-bold mb-1"
                  style={{ fontFamily: 'var(--font-display)', color: 'var(--c-text)' }}>
                  Stock inicial
                </h2>
                <p className="text-sm mb-5" style={{ color: 'var(--c-text-muted)' }}>
                  {sheetStock!.item.nombre} · {MESES[mes - 1]} {anio}
                </p>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--c-text)' }}>
                      Cantidad ({sheetStock!.item.unidad})
                    </label>
                    <input type="number" name="stock_inicial" required min="0" step="0.01"
                      defaultValue={sheetStock!.registro?.stock_inicial ?? ''}
                      placeholder="0"
                      className="w-full px-4 py-2.5 rounded-xl text-base outline-none"
                      style={{ background: 'var(--c-bg)', border: '1.5px solid var(--c-border)', color: 'var(--c-text)', fontFamily: 'var(--font-body)' }} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--c-text)' }}>
                      Notas <span style={{ color: 'var(--c-text-muted)', fontWeight: 400 }}>(opcional)</span>
                    </label>
                    <input type="text" name="notas"
                      defaultValue={sheetStock!.registro?.notas ?? ''}
                      placeholder="Ej: Incluye stock del mes pasado"
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
                      {isPending ? 'Guardando…' : 'Guardar stock'}
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* ── Registrar consumo ── */}
            {sheet.mode === 'consumo' && (
              <>
                <h2 className="text-lg font-bold mb-1"
                  style={{ fontFamily: 'var(--font-display)', color: 'var(--c-text)' }}>
                  Registrar consumo
                </h2>
                <p className="text-sm mb-5" style={{ color: 'var(--c-text-muted)' }}>
                  {sheetConsumo!.item.nombre}
                </p>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--c-text)' }}>
                      Cantidad consumida ({sheetConsumo!.item.unidad})
                    </label>
                    <input type="number" name="cantidad" required min="0.01" step="0.01"
                      placeholder="0"
                      className="w-full px-4 py-2.5 rounded-xl text-base outline-none"
                      style={{ background: 'var(--c-bg)', border: '1.5px solid var(--c-border)', color: 'var(--c-text)', fontFamily: 'var(--font-body)' }} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--c-text)' }}>Fecha</label>
                    <input type="date" name="fecha" required defaultValue={hoy}
                      className="w-full px-4 py-2.5 rounded-xl text-base outline-none"
                      style={{ background: 'var(--c-bg)', border: '1.5px solid var(--c-border)', color: 'var(--c-text)', fontFamily: 'var(--font-body)' }} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--c-text)' }}>
                      Notas <span style={{ color: 'var(--c-text-muted)', fontWeight: 400 }}>(opcional)</span>
                    </label>
                    <input type="text" name="notas"
                      placeholder="Ej: Semana 2, producción alta"
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
                      {isPending ? 'Guardando…' : 'Registrar consumo'}
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* ── Historial de consumos ── */}
            {sheet.mode === 'historial' && (
              <>
                <h2 className="text-lg font-bold mb-1"
                  style={{ fontFamily: 'var(--font-display)', color: 'var(--c-text)' }}>
                  Historial de consumos
                </h2>
                <p className="text-sm mb-5" style={{ color: 'var(--c-text-muted)' }}>
                  {sheetHistorial!.item.nombre} · {MESES[mes - 1]}
                </p>
                <div className="space-y-2 mb-5">
                  {consumosPorRegistro(sheetHistorial!.registro.id).map(c => {
                    const fecha = new Date(c.fecha + 'T00:00:00')
                    const fechaFmt = fecha.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' })
                    return (
                      <div key={c.id} className="flex items-center justify-between py-2.5 border-b"
                        style={{ borderColor: 'var(--c-border-subtle)' }}>
                        <div>
                          <p className="text-sm font-semibold capitalize" style={{ color: 'var(--c-text)' }}>{fechaFmt}</p>
                          {c.notas && <p className="text-xs" style={{ color: 'var(--c-text-muted)' }}>{c.notas}</p>}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold tabular-nums" style={{ color: 'var(--c-danger)', fontFamily: 'var(--font-display)' }}>
                            −{Number(c.cantidad).toLocaleString('es-MX', { maximumFractionDigits: 2 })} {sheetHistorial!.item.unidad}
                          </span>
                          <button onClick={() => handleEliminarConsumo(c.id)}
                            className="text-xs" style={{ color: 'var(--c-danger)' }}>×</button>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <button onClick={closeSheet}
                  className="w-full py-3 rounded-xl text-sm font-semibold"
                  style={{ background: 'var(--c-bg)', border: '1.5px solid var(--c-border)', color: 'var(--c-text-muted)' }}>
                  Cerrar
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
