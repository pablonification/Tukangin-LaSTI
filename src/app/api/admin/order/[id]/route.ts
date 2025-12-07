import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabaseServer';
import { z, ZodError } from 'zod';

const DeleteOrderSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F-]+$/, 'Invalid order id'),
});

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
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
      .from('Users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userError || !appUser || appUser.role === 'CUSTOMER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const data = DeleteOrderSchema.parse(resolvedParams);

    const { data: deleted, error } = await supabase
      .from('Orders')
      .delete()
      .eq('id', data.id)
      .select('*')
      .single();

    if (error) throw error;

    return NextResponse.json(
      { message: 'Order deleted', order: deleted },
      { status: 200 },
    );
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json(
        { error: err.issues.map((i) => i.message).join(', ') },
        { status: 400 },
      );
    }

    console.error('Error deleting order:', err);
    return NextResponse.json(
      { error: 'Failed to delete order' },
      { status: 500 },
    );
  }
}
