import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabaseServer';

export async function GET() {
  try {
    const supabase = await getSupabaseServer();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check user role
    const { data: appUser, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userError || !appUser || appUser.role === 'CUSTOMER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: tukangList, error } = await supabase
      .from('professionals')
      .select('*, user:users(*)');

    if (error) throw error;

    return NextResponse.json(tukangList);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch tukang',
        details: String(error),
      },
      { status: 500 },
    );
  }
}
