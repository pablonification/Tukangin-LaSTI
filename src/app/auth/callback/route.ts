import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  
  // Log everything for debugging
  console.log('=== AUTH CALLBACK DEBUG ===');
  console.log('Full URL:', request.url);
  console.log('All search params:', Object.fromEntries(searchParams.entries()));
  console.log('Code param:', searchParams.get('code'));
  console.log('Next param:', searchParams.get('next'));
  
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    console.log('Code found, exchanging for session...');
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: Record<string, unknown>) {
            console.log('Setting cookie:', name);
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: Record<string, unknown>) {
            cookieStore.set({ name, value: '', ...options });
          },
        },
      }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error('exchangeCodeForSession error:', error.message);
    } else {
      console.log('Session exchange successful! User:', data.user?.id);
    }
  } else {
    console.warn('Auth callback called without code');
  }

  console.log('Redirecting to:', `${origin}${next}`);
  console.log('=== END AUTH CALLBACK DEBUG ===');
  
  return NextResponse.redirect(`${origin}${next}`);
}
