'use client'

import { useEffect, useState } from 'react'

// iOS Safari no ajusta elementos `position: fixed` cuando el teclado abre —
// el sheet queda con altura de pantalla completa aunque el teclado tape la mitad.
// visualViewport.height sí refleja el espacio realmente visible, así que lo
// usamos para achicar el sheet dinámicamente y mantener el botón alcanzable.
export function useViewportHeight() {
  const [height, setHeight] = useState<number | null>(null)

  useEffect(() => {
    function update() {
      setHeight(window.visualViewport?.height ?? window.innerHeight)
    }
    update()
    window.visualViewport?.addEventListener('resize', update)
    window.addEventListener('resize', update)
    return () => {
      window.visualViewport?.removeEventListener('resize', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  return height
}
