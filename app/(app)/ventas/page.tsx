import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import VentasClient from './ventas-client'

export default async function VentasPage() {
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

  const { data: ventas } = await supabase
    .from('ventas')
    .select('*')
    .eq('heladeria_id', membresia.heladeria_id)
    .gte('fecha', inicioMes)
    .lte('fecha', finMes)
    .order('fecha', { ascending: false })

  return <VentasClient ventas={ventas ?? []} />
}
