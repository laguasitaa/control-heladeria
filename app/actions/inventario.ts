'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function getHeladeriaId() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')
  const { data } = await supabase
    .from('heladeria_miembros')
    .select('heladeria_id')
    .eq('user_id', user.id)
    .single()
  if (!data) throw new Error('Sin acceso')
  return { supabase, heladeriaId: data.heladeria_id }
}

// ── Productos (catálogo) ──────────────────────────────────────────────────────

export async function crearProducto(fd: FormData) {
  const { supabase, heladeriaId } = await getHeladeriaId()
  const nombre = (fd.get('nombre') as string).trim()
  const unidad = (fd.get('unidad') as string).trim()
  const categoria = (fd.get('categoria') as string).toLowerCase().trim()

  const { error } = await supabase.from('inventario_items').insert({
    heladeria_id: heladeriaId, nombre, unidad, categoria,
  })
  if (error) throw new Error(error.message)
  revalidatePath('/inventario')
}

export async function editarProducto(id: string, fd: FormData) {
  const { supabase } = await getHeladeriaId()
  const nombre = (fd.get('nombre') as string).trim()
  const unidad = (fd.get('unidad') as string).trim()
  const categoria = (fd.get('categoria') as string).toLowerCase().trim()

  const { error } = await supabase.from('inventario_items')
    .update({ nombre, unidad, categoria })
    .eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/inventario')
}

export async function eliminarProducto(id: string) {
  const { supabase } = await getHeladeriaId()
  const { error } = await supabase.from('inventario_items').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/inventario')
}

// ── Registros mensuales (stock inicial) ───────────────────────────────────────

export async function guardarStockInicial(itemId: string, fd: FormData) {
  const { supabase, heladeriaId } = await getHeladeriaId()
  const stockInicial = parseFloat(fd.get('stock_inicial') as string)
  const notas = (fd.get('notas') as string | null)?.trim() || null
  const hoy = new Date()
  const mes = hoy.getMonth() + 1
  const anio = hoy.getFullYear()

  const { error } = await supabase.from('inventario_registros').upsert({
    heladeria_id: heladeriaId,
    item_id: itemId,
    mes,
    anio,
    stock_inicial: stockInicial,
    notas,
  }, { onConflict: 'item_id,mes,anio' })
  if (error) throw new Error(error.message)
  revalidatePath('/inventario')
}

// ── Consumos semanales ────────────────────────────────────────────────────────

export async function registrarConsumo(registroId: string, fd: FormData) {
  const { supabase, heladeriaId } = await getHeladeriaId()
  const cantidad = parseFloat(fd.get('cantidad') as string)
  const fecha = fd.get('fecha') as string
  const notas = (fd.get('notas') as string | null)?.trim() || null

  const { error } = await supabase.from('inventario_consumos').insert({
    heladeria_id: heladeriaId,
    registro_id: registroId,
    cantidad,
    fecha,
    notas,
  })
  if (error) throw new Error(error.message)
  revalidatePath('/inventario')
}

export async function eliminarConsumo(id: string) {
  const { supabase } = await getHeladeriaId()
  const { error } = await supabase.from('inventario_consumos').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/inventario')
}
