import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabaseServer';

export async function GET() {
  try {
    const supabase = await getSupabaseServer();

    // Fetch all users with their orders
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .order('joined_at', { ascending: false });

    if (usersError) throw usersError;

    // For each user, count their orders and calculate total spent
    const mapped = await Promise.all(
      users.map(async (u: Record<string, unknown>) => {
        const { count: totalOrders } = await supabase
          .from('orders')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', u.id);

        const { data: completedOrders } = await supabase
          .from('orders')
          .select('total')
          .eq('user_id', u.id)
          .eq('status', 'COMPLETED')
          .not('total', 'is', null);

        const totalSpent = completedOrders?.reduce(
          (sum: number, o: Record<string, unknown>) => sum + (Number(o.total) || 0),
          0,
        ) ?? 0;

        const { data: lastOrderData } = await supabase
          .from('orders')
          .select('created_at')
          .eq('user_id', u.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        const lastOrder = lastOrderData
          ? new Date(lastOrderData.created_at).toISOString().split('T')[0]
          : null;

        return {
          id: `USR-${String(u.id).substring(0, 8)}`,
          name: String(u.name),
          email: String(u.email),
          phone: u.phone ? String(u.phone) : '-',
          location: '-',
          joinDate: new Date(String(u.joined_at)).toISOString().split('T')[0],
          totalOrders: totalOrders ?? 0,
          totalSpent: `Rp ${totalSpent.toLocaleString('id-ID')}`,
          status: u.is_active ? 'Active' : 'Suspended',
          lastOrder: lastOrder ?? '-',
          rating: 0,
          avatar: u.image ? String(u.image) : undefined,
        };
      }),
    );

    return NextResponse.json(mapped);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 },
    );
  }
}
