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

export async function crearGasto(formData: FormData) {
  const heladeria_id = await getHeladeriaId()
  const supabase = await createClient()

  const categoria = (formData.get('categoria') as string).toLowerCase().trim()
  const monto = parseFloat(formData.get('monto') as string)
  const descripcion = (formData.get('descripcion') as string)?.trim() || null
  const fecha = (formData.get('fecha') as string) || new Date().toISOString().split('T')[0]

  if (!categoria || isNaN(monto) || monto <= 0) {
    throw new Error('Datos inválidos')
  }

  const { error } = await supabase.from('gastos').insert({
    heladeria_id, categoria, monto, descripcion, fecha,
  })

  if (error) throw new Error(error.message)
  revalidatePath('/gastos')
  revalidatePath('/dashboard')
}

export async function editarGasto(id: string, formData: FormData) {
  const heladeria_id = await getHeladeriaId()
  const supabase = await createClient()

  const categoria = (formData.get('categoria') as string).toLowerCase().trim()
  const monto = parseFloat(formData.get('monto') as string)
  const descripcion = (formData.get('descripcion') as string)?.trim() || null
  const fecha = formData.get('fecha') as string

  const { error } = await supabase
    .from('gastos')
    .update({ categoria, monto, descripcion, fecha })
    .eq('id', id)
    .eq('heladeria_id', heladeria_id)

  if (error) throw new Error(error.message)
  revalidatePath('/gastos')
  revalidatePath('/dashboard')
}

export async function eliminarGasto(id: string) {
  const heladeria_id = await getHeladeriaId()
  const supabase = await createClient()

  const { error } = await supabase
    .from('gastos')
    .delete()
    .eq('id', id)
    .eq('heladeria_id', heladeria_id)

  if (error) throw new Error(error.message)
  revalidatePath('/gastos')
  revalidatePath('/dashboard')
}
