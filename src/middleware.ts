import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  
  // 🔧 MODO DESARROLLO: Desactivar autenticación temporalmente
  // Cambia esto a false cuando quieras activar la autenticación
  const DEV_MODE_NO_AUTH = false;
  
  if (DEV_MODE_NO_AUTH) {
    console.log('⚠️ Middleware en modo desarrollo - autenticación desactivada');
    return res;
  }
  
  // Verificar que las variables de entorno estén configuradas
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Supabase environment variables not configured');
    // Permitir acceso sin autenticación si no hay configuración
    return res;
  }
  
  try {
    const supabase = createMiddlewareClient({ req, res });

    // Refrescar la sesión
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    console.log('Middleware - Path:', req.nextUrl.pathname, 'Has session:', !!session, 'Error:', sessionError?.message);

    // Rutas públicas que no requieren autenticación
    const publicRoutes = ['/login', '/signup', '/auth/callback'];
    const isPublicRoute = publicRoutes.some((route) =>
      req.nextUrl.pathname.startsWith(route)
    );

    // Si no hay sesión y no es una ruta pública, redirigir a login
    if (!session && !isPublicRoute) {
      console.log('Middleware - Redirigiendo a login (sin sesión)');
      const redirectUrl = new URL('/login', req.url);
      redirectUrl.searchParams.set('redirect', req.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Si hay sesión y está en login, permitir acceso (el LoginForm manejará la redirección)
    if (session && isPublicRoute) {
      console.log('Middleware - Sesión activa en ruta pública, permitiendo acceso');
    }

    // Permitir acceso a todas las rutas si hay sesión
    return res;
  } catch (error) {
    console.error('❌ Error in middleware:', error);
    // Permitir acceso si hay un error en el middleware
    return res;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - manifest.json (PWA manifest)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

