import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  try {
    const { data: { user } } = await supabase.auth.getUser()

    const isLoginPage = request.nextUrl.pathname.startsWith('/login')
    // El link de recuperación de contraseña llega con la sesión en el fragmento (#...)
    // de la URL, que el servidor nunca ve — solo el navegador la puede leer. Por eso
    // esta ruta no puede exigir sesión aquí; el cliente la establece al cargar.
    const isResetPasswordPage = request.nextUrl.pathname.startsWith('/reset-password')

    if (!user && !isLoginPage && !isResetPasswordPage) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    if (user && isLoginPage) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  } catch {
    // Error de conexión — redirige a login para que el usuario pueda reintentar
    if (!request.nextUrl.pathname.startsWith('/login') && !request.nextUrl.pathname.startsWith('/reset-password')) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
