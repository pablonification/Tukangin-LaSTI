import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabaseServer';
import { adminErrorResponse, requireAdmin } from '@/lib/adminAuth';

export async function GET() {
  try {
    const supabase = await getSupabaseServer();
    await requireAdmin(supabase);

    const [ordersCountRes, customersCountRes, completedOrdersRes, professionalsCountRes] =
      await Promise.all([
        supabase.from('orders').select('id', { count: 'exact', head: true }),
        supabase
          .from('users')
          .select('id', { count: 'exact', head: true })
          .eq('role', 'CUSTOMER'),
        supabase
          .from('orders')
          .select('total, status')
          .eq('status', 'COMPLETED')
          .not('total', 'is', null),
        supabase.from('professionals').select('user_id', { count: 'exact', head: true }),
      ]);

    const totalRevenue = (completedOrdersRes.data ?? []).reduce((sum, order) => {
      const val = Number((order as { total?: unknown }).total) || 0;
      return sum + val;
    }, 0);

    return NextResponse.json(
      {
        totalOrders: ordersCountRes.count ?? 0,
        activeUsers: customersCountRes.count ?? 0,
        revenue: totalRevenue,
        activeTukang: professionalsCountRes.count ?? 0,
      },
      { status: 200 },
    );
  } catch (error) {
    const adminResp = adminErrorResponse(error);
    if (adminResp) return adminResp;

    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
