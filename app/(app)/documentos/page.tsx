import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DocumentosClient from './documentos-client'

export default async function DocumentosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: membresia } = await supabase
    .from('heladeria_miembros')
    .select('heladeria_id')
    .eq('user_id', user.id)
    .single()

  if (!membresia) return <p className="p-6">Sin acceso.</p>

  const { data: documentos } = await supabase
    .from('documentos')
    .select('*')
    .eq('heladeria_id', membresia.heladeria_id)
    .order('created_at', { ascending: false })

  return <DocumentosClient documentos={documentos ?? []} />
}
