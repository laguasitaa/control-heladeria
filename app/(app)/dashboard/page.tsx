import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const MXN = new Intl.NumberFormat('es-MX', {
  style: 'currency', currency: 'MXN', maximumFractionDigits: 0
})

function diasRestantes(fecha: string) {
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  const d = new Date(fecha + 'T00:00:00')
  return Math.round((d.getTime() - hoy.getTime()) / 86400000)
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Obtener heladeria_id
  const { data: membresia } = await supabase
    .from('heladeria_miembros')
    .select('heladeria_id')
    .eq('user_id', user.id)
    .single()

  if (!membresia) {
    return (
      <div className="p-6" style={{ color: 'var(--c-text)' }}>
        <p>Tu cuenta no está vinculada a ninguna heladería. Contacta al administrador.</p>
      </div>
    )
  }

  const hid = membresia.heladeria_id
  const hoy = new Date()
  const inicioMes = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-01`
  const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0)
    .toISOString().split('T')[0]
  const en30dias = new Date(hoy.getTime() + 30 * 86400000).toISOString().split('T')[0]

  // 4 queries en paralelo con manejo de error parcial
  const [gastosRes, ventasRes, categoriasRes, vencimientosRes] = await Promise.allSettled([
    supabase.from('gastos')
      .select('monto')
      .eq('heladeria_id', hid)
      .gte('fecha', inicioMes)
      .lte('fecha', finMes),
    supabase.from('ventas')
      .select('monto_total')
      .eq('heladeria_id', hid)
      .gte('fecha', inicioMes)
      .lte('fecha', finMes),
    supabase.from('gastos')
      .select('categoria, monto')
      .eq('heladeria_id', hid)
      .gte('fecha', inicioMes)
      .lte('fecha', finMes),
    supabase.from('vencimientos')
      .select('id, nombre, tipo, fecha_vencimiento')
      .eq('heladeria_id', hid)
      .lte('fecha_vencimiento', en30dias)
      .order('fecha_vencimiento', { ascending: true })
      .limit(5),
  ])

  const totalGastos = gastosRes.status === 'fulfilled'
    ? (gastosRes.value.data ?? []).reduce((s, g) => s + Number(g.monto), 0)
    : null

  const totalVentas = ventasRes.status === 'fulfilled'
    ? (ventasRes.value.data ?? []).reduce((s, v) => s + Number(v.monto_total), 0)
    : null

  // Top 3 categorías
  const topCategorias: { categoria: string; total: number }[] = []
  if (categoriasRes.status === 'fulfilled') {
    const mapa: Record<string, number> = {}
    for (const g of categoriasRes.value.data ?? []) {
      mapa[g.categoria] = (mapa[g.categoria] ?? 0) + Number(g.monto)
    }
    Object.entries(mapa)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .forEach(([categoria, total]) => topCategorias.push({ categoria, total }))
  }

  const vencimientosProximos = vencimientosRes.status === 'fulfilled'
    ? (vencimientosRes.value.data ?? [])
    : []

  const diferencia = totalVentas !== null && totalGastos !== null
    ? totalVentas - totalGastos
    : null

  const mesNombre = hoy.toLocaleString('es-MX', { month: 'long', year: 'numeric' })
  const hora = hoy.getHours()
  const saludo = hora < 12 ? 'Buenos días' : hora < 19 ? 'Buenas tardes' : 'Buenas noches'

  return (
    <div className="px-5 pt-12 pb-4 max-w-xl mx-auto md:max-w-2xl">

      {/* Header */}
      <div className="mb-6">
        <p className="text-sm" style={{ color: 'var(--c-text-muted)' }}>{saludo}</p>
        <h1 className="text-2xl font-extrabold capitalize"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--c-text)' }}>
          {mesNombre}
        </h1>
      </div>

      {/* Alertas de vencimientos */}
      {vencimientosProximos.length > 0 && (
        <div className="mb-4 rounded-2xl p-4 space-y-2"
          style={{ background: 'var(--c-danger-light)', border: '1px solid #F5C6C6' }}>
          <p className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--c-danger)' }}>
            🔔 Vencimientos próximos
          </p>
          {vencimientosProximos.map(v => {
            const dias = diasRestantes(v.fecha_vencimiento)
            return (
              <div key={v.id} className="flex items-center justify-between">
                <span className="text-sm font-medium" style={{ color: 'var(--c-text)' }}>
                  {v.nombre}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{
                    background: dias < 0 ? 'var(--c-danger)' : dias <= 7 ? 'var(--c-danger)' : 'var(--c-warning)',
                    color: '#fff'
                  }}>
                  {dias < 0 ? `Vencido hace ${Math.abs(dias)}d` : dias === 0 ? 'Vence hoy' : `${dias}d`}
                </span>
              </div>
            )
          })}
        </div>
      )}

      {/* Balance del mes */}
      <div className="mb-4 rounded-2xl p-5"
        style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
        <p className="text-xs font-semibold uppercase tracking-wide mb-4"
          style={{ color: 'var(--c-text-muted)' }}>Balance del mes</p>

        <div className="space-y-2.5">
          <div className="flex justify-between items-baseline">
            <span className="text-sm" style={{ color: 'var(--c-text-muted)' }}>💰 Ventas</span>
            <span className="text-xl font-bold tabular-nums"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--c-success)' }}>
              {totalVentas !== null ? MXN.format(totalVentas) : '—'}
            </span>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="text-sm" style={{ color: 'var(--c-text-muted)' }}>📋 Gastos</span>
            <span className="text-xl font-bold tabular-nums"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--c-danger)' }}>
              {totalGastos !== null ? MXN.format(totalGastos) : '—'}
            </span>
          </div>
          <div className="h-px" style={{ background: 'var(--c-border)' }} />
          <div className="flex justify-between items-baseline">
            <span className="text-sm font-semibold" style={{ color: 'var(--c-text)' }}>Diferencia</span>
            <span className="text-2xl font-extrabold tabular-nums"
              style={{
                fontFamily: 'var(--font-display)',
                color: diferencia === null ? 'var(--c-text-muted)'
                  : diferencia >= 0 ? 'var(--c-success)' : 'var(--c-danger)'
              }}>
              {diferencia !== null
                ? (diferencia >= 0 ? '+' : '') + MXN.format(diferencia)
                : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* Top categorías */}
      {topCategorias.length > 0 && (
        <div className="rounded-2xl p-5 mb-4"
          style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
          <p className="text-xs font-semibold uppercase tracking-wide mb-4"
            style={{ color: 'var(--c-text-muted)' }}>Top categorías</p>
          <div className="space-y-3">
            {topCategorias.map((cat, i) => {
              const pct = Math.round((cat.total / (topCategorias[0].total || 1)) * 100)
              const nombre = cat.categoria.charAt(0).toUpperCase() + cat.categoria.slice(1)
              return (
                <div key={i}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium capitalize" style={{ color: 'var(--c-text)' }}>
                      {nombre}
                    </span>
                    <span className="text-sm tabular-nums" style={{ color: 'var(--c-text-muted)' }}>
                      {MXN.format(cat.total)}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--c-border)' }}>
                    <div className="h-full rounded-full"
                      style={{ width: `${pct}%`, background: 'var(--c-accent)', opacity: 1 - i * 0.2 }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Estado vacío */}
      {totalVentas === 0 && totalGastos === 0 && vencimientosProximos.length === 0 && (
        <div className="text-center py-12">
          <p className="text-4xl mb-3">🍦</p>
          <p className="font-semibold" style={{ color: 'var(--c-text)' }}>Todo vacío por ahora</p>
          <p className="text-sm mt-1" style={{ color: 'var(--c-text-muted)' }}>
            Empieza registrando un gasto o una venta
          </p>
          <div className="flex gap-3 justify-center mt-5">
            <Link href="/gastos"
              className="px-4 py-2 rounded-xl text-sm font-semibold"
              style={{ background: 'var(--c-accent)', color: '#FFF8ED' }}>
              + Gasto
            </Link>
            <Link href="/ventas"
              className="px-4 py-2 rounded-xl text-sm font-semibold"
              style={{ background: 'var(--c-accent-light)', color: 'var(--c-accent)', border: '1.5px solid var(--c-accent)' }}>
              + Venta
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
