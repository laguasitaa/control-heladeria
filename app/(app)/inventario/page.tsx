import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import InventarioClient from './inventario-client'

export default async function InventarioPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: membresia } = await supabase
    .from('heladeria_miembros')
    .select('heladeria_id')
    .eq('user_id', user.id)
    .single()

  if (!membresia) return <p className="p-6">Sin acceso.</p>

  const hid = membresia.heladeria_id
  const hoy = new Date()
  const mes = hoy.getMonth() + 1
  const anio = hoy.getFullYear()

  // Productos activos
  const { data: items } = await supabase
    .from('inventario_items')
    .select('*')
    .eq('heladeria_id', hid)
    .eq('activo', true)
    .order('categoria')
    .order('nombre')

  // Registros del mes actual
  const { data: registros } = await supabase
    .from('inventario_registros')
    .select('*')
    .eq('heladeria_id', hid)
    .eq('mes', mes)
    .eq('anio', anio)

  // Consumos del mes (de esos registros)
  const registroIds = (registros ?? []).map(r => r.id)
  const { data: consumos } = registroIds.length > 0
    ? await supabase
        .from('inventario_consumos')
        .select('*')
        .in('registro_id', registroIds)
        .order('fecha', { ascending: false })
    : { data: [] }

  return (
    <InventarioClient
      items={items ?? []}
      registros={registros ?? []}
      consumos={consumos ?? []}
      mes={mes}
      anio={anio}
    />
  )
}
