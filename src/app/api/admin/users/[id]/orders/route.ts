import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabaseServer';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await getSupabaseServer();
    const param = await params;
    const userId = param.id;

    const { data: orders, error } = await supabase
      .from('Orders')
      .select('*, professional:professionals(user_id, users(name))')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const mapped = orders?.map((o: Record<string, unknown>) => ({
      id: `ORD-${String(o.id).substring(0, 8)}`,
      service: o.service,
      status: o.status,
      amount: o.total ? `Rp ${Number(o.total).toLocaleString('id-ID')}` : 'Rp 0',
      date: new Date(String(o.created_at)).toISOString().split('T')[0],
      location: o.address,
      tukang: (o.professional as Record<string, unknown>)?.users
        ? ((o.professional as Record<string, unknown>).users as Record<string, unknown>).name
        : null,
    }));

    return NextResponse.json(mapped);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 },
    );
  }
}
