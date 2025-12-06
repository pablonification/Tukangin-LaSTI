import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabaseServer';

// PATCH: update isNew jadi false
export async function PATCH() {
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

    const { data: updatedUser, error } = await supabase
      .from('users')
      .update({ is_new: false })
      .eq('id', user.id)
      .select('id, is_new')
      .single();

    if (error) throw error;

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Failed to update isNew status' },
      { status: 500 },
    );
  }
}
