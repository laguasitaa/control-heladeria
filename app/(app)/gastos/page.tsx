import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import GastosClient from './gastos-client'

export default async function GastosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: membresia } = await supabase
    .from('heladeria_miembros')
    .select('heladeria_id')
    .eq('user_id', user.id)
    .single()

  if (!membresia) return <p className="p-6">Sin acceso.</p>

  const hoy = new Date()
  const inicioMes = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-01`
  const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).toISOString().split('T')[0]

  const { data: gastos } = await supabase
    .from('gastos')
    .select('*')
    .eq('heladeria_id', membresia.heladeria_id)
    .gte('fecha', inicioMes)
    .lte('fecha', finMes)
    .order('updated_at', { ascending: false })

  return <GastosClient gastos={gastos ?? []} />
}
