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
  return { supabase, heladeriaId: data.heladeria_id, userId: user.id }
}

export async function subirDocumento(fd: FormData) {
  const { supabase, heladeriaId } = await getHeladeriaId()

  const archivo = fd.get('archivo') as File
  const nombre = (fd.get('nombre') as string).trim()
  const categoria = (fd.get('categoria') as string).toLowerCase().trim()
  const descripcion = (fd.get('descripcion') as string | null)?.trim() || null
  const fecha = fd.get('fecha') as string

  if (!archivo || archivo.size === 0) throw new Error('Selecciona un archivo')
  if (!nombre) throw new Error('El nombre es requerido')

  // Path en Storage: heladeria_id/uuid-random/nombre-original
  const ext = archivo.name.split('.').pop()
  const uniquePath = `${heladeriaId}/${crypto.randomUUID()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('documentos')
    .upload(uniquePath, archivo, { upsert: false })

  if (uploadError) throw new Error('Error al subir archivo: ' + uploadError.message)

  const { error: dbError } = await supabase.from('documentos').insert({
    heladeria_id: heladeriaId,
    nombre,
    categoria,
    descripcion,
    archivo_path: uniquePath,
    archivo_nombre: archivo.name,
    archivo_tamanio: archivo.size,
    fecha,
  })

  if (dbError) {
    // Limpia el archivo si falla el registro en DB
    await supabase.storage.from('documentos').remove([uniquePath])
    throw new Error('Error al guardar documento: ' + dbError.message)
  }

  revalidatePath('/documentos')
}

export async function eliminarDocumento(id: string, archivePath: string) {
  const { supabase } = await getHeladeriaId()

  // Borra de DB primero (RLS protege que sea de su heladería)
  const { error: dbError } = await supabase
    .from('documentos')
    .delete()
    .eq('id', id)

  if (dbError) throw new Error('Error al eliminar: ' + dbError.message)

  // Borra el archivo de Storage
  await supabase.storage.from('documentos').remove([archivePath])

  revalidatePath('/documentos')
}

export async function getUrlDescarga(archivePath: string): Promise<string> {
  const { supabase } = await getHeladeriaId()
  const { data, error } = await supabase.storage
    .from('documentos')
    .createSignedUrl(archivePath, 60 * 60) // 1 hora

  if (error || !data) throw new Error('No se pudo generar el link de descarga')
  return data.signedUrl
}
