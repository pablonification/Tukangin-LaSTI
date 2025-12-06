import { NextResponse } from 'next/server';
import { unstable_cache, revalidateTag } from 'next/cache';
import { getSupabaseServer } from '@/lib/supabaseServer';
import { z, ZodError } from 'zod';

const UpsertOrderRequest = z.object({
  id: z.string().optional(),
  receiverName: z.string().min(1),
  service: z.string().min(1),
  address: z.string().min(1),
  description: z.string().min(1),
  subtotal: z.number().min(0),
  status: z.enum([
    'PENDING',
    'PROCESSING',
    'COMPLETED',
    'WARRANTY',
    'CANCELLED',
  ]),
  voucherId: z.string().optional(),
  tukangId: z.string().optional(),
  attachment: z.array(z.string()).optional(),
  receiverPhone: z.string().min(1),
});

export async function POST(req: Request) {
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

    const json = await req.json();
    const data = UpsertOrderRequest.parse(json);

    // If update, fetch existing order
    let existingOrder = null;
    if (data.id) {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*, voucher:vouchers(*)')
        .eq('id', data.id)
        .single();

      if (orderError || !order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }
      existingOrder = order;
    }

    // Determine voucher to use
    const voucherId = data.voucherId ?? existingOrder?.voucher_id ?? null;
    let discount = 0;

    if (voucherId) {
      const { data: voucher, error: voucherError } = await supabase
        .from('vouchers')
        .select('*')
        .eq('id', voucherId)
        .single();

      if (
        voucherError ||
        !voucher ||
        !voucher.is_active ||
        (voucher.expiry_date && new Date(voucher.expiry_date) < new Date())
      ) {
        return NextResponse.json(
          { error: 'Voucher not valid' },
          { status: 400 },
        );
      }

      discount =
        voucher.type === 'PERCENT'
          ? Math.floor(data.subtotal * (Number(voucher.value) / 100))
          : Math.floor(Number(voucher.value));

      if (voucher.max_discount) {
        discount = Math.min(discount, Number(voucher.max_discount));
      }
    }

    const subtotal = Math.floor(data.subtotal);
    const total = subtotal - discount;

    // Derive completedAt & warrantyUntil
    let completedAt: string | null = null;
    let warrantyUntil: string | null = null;
    if (data.status === 'COMPLETED') completedAt = new Date().toISOString();
    if (data.status === 'WARRANTY') {
      const now = new Date();
      warrantyUntil = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString();
    }

    // Prepare data for create/update
    const orderData: Record<string, unknown> = {
      receiver_name: data.receiverName,
      receiver_phone: data.receiverPhone,
      service: data.service,
      address: data.address,
      description: data.description,
      status: data.status,
      subtotal,
      discount,
      total,
      voucher_id: voucherId,
      professional_id: data.tukangId ?? null,
      attachments: data.attachment ?? [],
    };

    if (completedAt) orderData.completed_at = completedAt;
    if (warrantyUntil) orderData.warranty_until = warrantyUntil;

    let order;
    if (data.id) {
      const { data: updated, error: updateError } = await supabase
        .from('orders')
        .update(orderData)
        .eq('id', data.id)
        .select('*')
        .single();

      if (updateError) throw updateError;
      order = updated;
    } else {
      orderData.user_id = user.id;
      const { data: created, error: createError } = await supabase
        .from('orders')
        .insert(orderData)
        .select('*')
        .single();

      if (createError) throw createError;
      order = created;
    }

    try {
      // Invalidate relevant caches
      revalidateTag('orders:all');
      revalidateTag(`orders:user:${order.user_id}`);
      if (voucherId) revalidateTag('voucher:all');
    } catch {}

    return NextResponse.json(order, { status: 200 });
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json(
        { error: err.issues.map((i) => i.message).join(', ') },
        { status: 400 },
      );
    }
    console.error('Error upserting order:', err);
    return NextResponse.json(
      { error: 'Failed to upsert order' },
      { status: 500 },
    );
  }
}

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

    const getAdminOrders = unstable_cache(
      async () => {
        const { data, error } = await supabase
          .from('orders')
          .select('*, user:users(*)')
          .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
      },
      ['orders-admin-all'],
      { revalidate: 30, tags: ['orders:all'] },
    );

    const orders = await getAdminOrders();

    return NextResponse.json(orders, { status: 200 });
  } catch (err) {
    console.error('Error fetching orders:', err);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 },
    );
  }
}
