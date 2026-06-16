'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function getHeladeriaId() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { data, error } = await supabase
    .from('heladeria_miembros')
    .select('heladeria_id')
    .eq('user_id', user.id)
    .single()

  if (error || !data) throw new Error('Sin acceso a heladería')
  return data.heladeria_id as string
}

export async function crearVenta(formData: FormData) {
  const heladeria_id = await getHeladeriaId()
  const supabase = await createClient()

  const fecha = formData.get('fecha') as string
  const monto_total = parseFloat(formData.get('monto_total') as string)
  const notas = (formData.get('notas') as string)?.trim() || null

  if (!fecha || isNaN(monto_total) || monto_total < 0) {
    throw new Error('Datos inválidos')
  }

  const { error } = await supabase.from('ventas').upsert({
    heladeria_id, fecha, monto_total, notas,
  }, { onConflict: 'heladeria_id,fecha' })

  if (error) throw new Error(error.message)
  revalidatePath('/ventas')
  revalidatePath('/dashboard')
}

export async function editarVenta(id: string, formData: FormData) {
  const heladeria_id = await getHeladeriaId()
  const supabase = await createClient()

  const fecha = formData.get('fecha') as string
  const monto_total = parseFloat(formData.get('monto_total') as string)
  const notas = (formData.get('notas') as string)?.trim() || null

  const { error } = await supabase
    .from('ventas')
    .update({ fecha, monto_total, notas })
    .eq('id', id)
    .eq('heladeria_id', heladeria_id)

  if (error) throw new Error(error.message)
  revalidatePath('/ventas')
  revalidatePath('/dashboard')
}

export async function eliminarVenta(id: string) {
  const heladeria_id = await getHeladeriaId()
  const supabase = await createClient()

  const { error } = await supabase
    .from('ventas')
    .delete()
    .eq('id', id)
    .eq('heladeria_id', heladeria_id)

  if (error) throw new Error(error.message)
  revalidatePath('/ventas')
  revalidatePath('/dashboard')
}
