'use client'

import { useState, useTransition, useRef } from 'react'
import { subirDocumento, eliminarDocumento, getUrlDescarga } from '@/app/actions/documentos'

const CATEGORIAS = ['contrato', 'recibo', 'factura', 'póliza', 'permiso', 'otros']

const ICONOS: Record<string, string> = {
  contrato: '📄',
  recibo: '🧾',
  factura: '💳',
  'póliza': '🛡️',
  permiso: '✅',
  otros: '📎',
}

type Documento = {
  id: string
  nombre: string
  categoria: string
  descripcion: string | null
  archivo_path: string
  archivo_nombre: string
  archivo_tamanio: number | null
  fecha: string
  created_at: string
}

function formatBytes(bytes: number | null) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function DocumentosClient({ documentos }: { documentos: Documento[] }) {
  const [sheet, setSheet] = useState(false)
  const [filtro, setFiltro] = useState('todos')
  const [isPending, startTransition] = useTransition()
  const [isDownloading, setIsDownloading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [archivoNombre, setArchivoNombre] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const hoy = new Date().toISOString().split('T')[0]

  const filtrados = filtro === 'todos'
    ? documentos
    : documentos.filter(d => d.categoria === filtro)

  function closeSheet() { setSheet(false); setError(null); setArchivoNombre(null) }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      try {
        await subirDocumento(fd)
        closeSheet()
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Error inesperado')
      }
    })
  }

  async function handleEliminar(id: string, path: string) {
    if (!confirm('¿Eliminar este documento?')) return
    startTransition(async () => {
      try { await eliminarDocumento(id, path) } catch { /* silencioso */ }
    })
  }

  async function handleDescargar(id: string, path: string, nombre: string) {
    setIsDownloading(id)
    try {
      const url = await getUrlDescarga(path)
      const a = document.createElement('a')
      a.href = url
      a.download = nombre
      a.click()
    } catch {
      alert('No se pudo descargar el archivo')
    } finally {
      setIsDownloading(null)
    }
  }

  return (
    <div className="px-5 pt-12 pb-4 max-w-xl mx-auto md:max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-xs" style={{ color: 'var(--c-text-muted)' }}>Archivos del negocio</p>
          <h1 className="text-2xl font-extrabold"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--c-text)' }}>
            Documentos
          </h1>
        </div>
        <button
          onClick={() => setSheet(true)}
          className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl font-bold"
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
          <p className="text-4xl mb-2">📁</p>
          <p className="font-medium" style={{ color: 'var(--c-text)' }}>Sin documentos</p>
          <p className="text-sm mt-1" style={{ color: 'var(--c-text-muted)' }}>
            Toca + para subir contratos, recibos o facturas
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtrados.map(doc => {
            const icono = ICONOS[doc.categoria] ?? '📎'
            const fecha = new Date(doc.fecha + 'T00:00:00')
            const fechaFmt = fecha.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
            const catLabel = doc.categoria.charAt(0).toUpperCase() + doc.categoria.slice(1)
            return (
              <div key={doc.id}
                className="rounded-2xl p-4 flex items-start gap-3"
                style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
                {/* Icono */}
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                  style={{ background: 'var(--c-accent-light)' }}>
                  {icono}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--c-text)' }}>
                    {doc.nombre}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium capitalize"
                      style={{ background: 'var(--c-accent-light)', color: 'var(--c-accent)' }}>
                      {catLabel}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--c-text-muted)' }}>{fechaFmt}</span>
                    {doc.archivo_tamanio && (
                      <span className="text-xs" style={{ color: 'var(--c-text-muted)' }}>
                        {formatBytes(doc.archivo_tamanio)}
                      </span>
                    )}
                  </div>
                  {doc.descripcion && (
                    <p className="text-xs mt-1 truncate" style={{ color: 'var(--c-text-muted)' }}>
                      {doc.descripcion}
                    </p>
                  )}
                </div>
                {/* Acciones */}
                <div className="flex flex-col gap-1.5 shrink-0">
                  <button
                    onClick={() => handleDescargar(doc.id, doc.archivo_path, doc.archivo_nombre)}
                    disabled={isDownloading === doc.id}
                    className="text-xs font-semibold px-3 py-1.5 rounded-xl disabled:opacity-50"
                    style={{ background: 'var(--c-accent-light)', color: 'var(--c-accent)' }}>
                    {isDownloading === doc.id ? '…' : '↓ Abrir'}
                  </button>
                  <button
                    onClick={() => handleEliminar(doc.id, doc.archivo_path)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-xl"
                    style={{ background: 'var(--c-danger-light)', color: 'var(--c-danger)' }}>
                    Eliminar
                  </button>
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
            style={{ background: 'var(--c-surface)', maxHeight: '92vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}>
            <div className="w-9 h-1 rounded-full mx-auto mb-5" style={{ background: 'var(--c-border)' }} />
            <h2 className="text-lg font-bold mb-5"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--c-text)' }}>
              Subir documento
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Archivo */}
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--c-text)' }}>
                  Archivo
                </label>
                <div
                  className="w-full px-4 py-3 rounded-xl flex items-center gap-3 cursor-pointer"
                  style={{ background: 'var(--c-bg)', border: '1.5px dashed var(--c-border)' }}
                  onClick={() => fileRef.current?.click()}>
                  <span className="text-xl">📎</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate" style={{ color: archivoNombre ? 'var(--c-text)' : 'var(--c-text-muted)' }}>
                      {archivoNombre ?? 'Toca para seleccionar archivo'}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--c-text-muted)' }}>
                      PDF, imagen, Word, Excel — máx. 20 MB
                    </p>
                  </div>
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  name="archivo"
                  required
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png,.webp,.heic,.doc,.docx,.xls,.xlsx"
                  onChange={e => setArchivoNombre(e.target.files?.[0]?.name ?? null)}
                />
              </div>

              {/* Nombre */}
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--c-text)' }}>
                  Nombre del documento
                </label>
                <input type="text" name="nombre" required
                  placeholder="Ej: Contrato de renta local Km 5"
                  className="w-full px-4 py-2.5 rounded-xl text-base outline-none"
                  style={{ background: 'var(--c-bg)', border: '1.5px solid var(--c-border)', color: 'var(--c-text)', fontFamily: 'var(--font-body)' }} />
              </div>

              {/* Categoría */}
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--c-text)' }}>
                  Categoría
                </label>
                <select name="categoria" required defaultValue=""
                  className="w-full px-4 py-2.5 rounded-xl text-base outline-none"
                  style={{ background: 'var(--c-bg)', border: '1.5px solid var(--c-border)', color: 'var(--c-text)', fontFamily: 'var(--font-body)' }}>
                  <option value="">Selecciona…</option>
                  {CATEGORIAS.map(c => (
                    <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                  ))}
                </select>
              </div>

              {/* Fecha */}
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--c-text)' }}>
                  Fecha del documento
                </label>
                <input type="date" name="fecha" required defaultValue={hoy}
                  className="w-full px-4 py-2.5 rounded-xl text-base outline-none"
                  style={{ background: 'var(--c-bg)', border: '1.5px solid var(--c-border)', color: 'var(--c-text)', fontFamily: 'var(--font-body)' }} />
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--c-text)' }}>
                  Descripción <span style={{ color: 'var(--c-text-muted)', fontWeight: 400 }}>(opcional)</span>
                </label>
                <input type="text" name="descripcion"
                  placeholder="Ej: Renovación anual, vence dic 2025"
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
                  {isPending ? 'Subiendo…' : 'Subir documento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
