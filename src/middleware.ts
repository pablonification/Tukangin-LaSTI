import { NextResponse, NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  // 1. Initialize the response ONCE
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Use getAll to retrieve all cookies from the request
        getAll() {
          return request.cookies.getAll();
        },
        // Use setAll to handle setting/deleting multiple cookies at once
        setAll(cookiesToSet) {
          // 1. Update the request cookies (so the current request sees the new session)
          cookiesToSet.forEach(({ name, value }) => 
            request.cookies.set(name, value)
          );

          // 2. Re-create the response to include the updated request cookies
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });

          // 3. Set the actual Set-Cookie headers on the response object
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 2. Refresh the session (this triggers the cookie updates above)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 3. Protected Route Logic
  const { pathname } = request.nextUrl;
  
  // Define routes that do NOT require authentication
  const isPublicRoute = 
    pathname === '/' || 
    pathname === '/welcome' || 
    pathname === '/auth/callback' || 
    pathname === '/otp' ||
    pathname === '/login' ||
    pathname === '/admin/forbidden' ||
    pathname.startsWith('/api/') || // Allow APIs to handle their own 401s
    pathname.startsWith('/_next') ||
    pathname.includes('favicon.ico');

  // Redirect unauthenticated users to Login
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  const isAdminPath = pathname.startsWith('/admin');
  const isAdminInfoPage = pathname === '/admin/forbidden';

  if (user && isAdminPath && !isAdminInfoPage) {
    const { data: roleRow, error: roleError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    const derivedRole = roleRow?.role ?? (user as unknown as { role?: string })?.role;
    const isAllowed = derivedRole === 'ADMIN' || derivedRole === 'DEVELOPER';

    if (roleError || !isAllowed) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin/forbidden';
      return NextResponse.rewrite(url, { status: 403 });
    }
  }

  // Redirect authenticated users away from public pages (Login/Welcome) to Home
  if (user && (pathname === '/' || pathname === '/welcome' || pathname === '/login')) {
    const url = request.nextUrl.clone();
    url.pathname = '/home';
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
