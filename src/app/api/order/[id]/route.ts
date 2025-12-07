import { NextResponse } from 'next/server';
import { unstable_cache, revalidateTag } from 'next/cache';
import { getSupabaseServer } from '@/lib/supabaseServer';
import { z } from 'zod';

const CreateOrderSchema = z.object({
  receiverName: z.string().min(1),
  service: z.string().min(1), // e.g. "Cuci AC"
  address: z.string().min(1),
  description: z.string().min(1),
  voucherCode: z.string().optional(),
});

// Mock Price List (Report 2.2 - Fixed Price Menu)
const SERVICE_PRICES: Record<string, number> = {
    'Cuci AC Split': 75000,
    'Perbaikan Pipa': 150000,
    'default': 100000 
};

export async function GET(
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

    const { id } = await params;

    const getOrder = unstable_cache(
      async () => {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('id', id)
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        return data;
      },
      [`order-${id}-user-${user.id}`],
      { revalidate: 60, tags: [`orders:user:${user.id}`] },
    );

    const order = await getOrder();

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(order, { status: 200 });
  } catch (err) {
    console.error('Error fetching order:', err);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await getSupabaseServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const json = await req.json();
    const data = CreateOrderSchema.parse(json);

    // 1. Calculate Fixed Price & DP (Report 2.4.b.i)
    const basePrice = SERVICE_PRICES[data.service] || SERVICE_PRICES['default'];
    // Voucher logic would go here (query 'vouchers' table)
    const totalEstimation = basePrice; 
    const dpAmount = totalEstimation * 0.5; // 50% DP

    // 2. Insert Order with 'WAITING_DP' status
    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        receiver_name: data.receiverName,
        receiver_phone: '',
        service: data.service,
        category: 'General',
        address: data.address,
        description: data.description,
        status: 'PENDING',
        subtotal: basePrice,
        discount: 0,
        total: totalEstimation,
      })
      .select()
      .single();

    if (error) throw error;

    // 3. Return Response (Report 4.1.b)
    const expiryTime = new Date();
    expiryTime.setHours(expiryTime.getHours() + 1);

    return NextResponse.json({
        success: true,
        data: {
            order_id: order.id,
            status: "PENDING",
            total_estimation: totalEstimation,
            dp_amount: dpAmount,
            expiry_time: expiryTime.toISOString()
        }
    }, { status: 201 });

  } catch (err) {
    console.error('Order creation failed:', err);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await getSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const json = await req.json();
    if (json.status !== 'COMPLETED') {
      return NextResponse.json({ error: 'Invalid status transition' }, { status: 400 });
    }

    const { data: current, error: fetchError } = await supabase
      .from('orders')
      .select('status, professional_id, paid_at, user_id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !current) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (!current.professional_id) {
      return NextResponse.json(
        { error: 'Tukang belum ditugaskan. Hubungi admin untuk penugasan.' },
        { status: 400 },
      );
    }

    if (current.status !== 'PROCESSING' && current.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Status pesanan tidak valid untuk penyelesaian.' },
        { status: 400 },
      );
    }

    const { data: updatedOrder, error } = await supabase
      .from('orders')
      .update({
        status: 'COMPLETED',
        completed_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;

    const warrantyExpiry = new Date();
    warrantyExpiry.setDate(warrantyExpiry.getDate() + 30);

    await supabase.from('warranties').insert({
      order_id: id,
      user_id: user.id,
      professional_id: updatedOrder.professional_id,
      status: 'ACTIVE',
      valid_until: warrantyExpiry.toISOString(),
      terms: 'Garansi mencakup kebocoran ulang dan kerusakan sparepart yang diganti.'
    });

    try {
      revalidateTag(`Orders:user:${user.id}`);
      revalidateTag('Orders:all');
    } catch {}

    return NextResponse.json({
      id: updatedOrder.id,
      status: 'COMPLETED',
      completedAt: updatedOrder.completed_at,
      updatedAt: updatedOrder.updated_at
    });
  } catch (err) {
    console.error('Failed to complete order:', err);
    return NextResponse.json({ error: 'Failed to complete order' }, { status: 500 });
  }
}
