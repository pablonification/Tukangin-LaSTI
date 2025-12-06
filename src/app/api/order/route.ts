import { NextResponse } from 'next/server';
import { unstable_cache, revalidateTag } from 'next/cache';
import { getSupabaseServer } from '@/lib/supabaseServer';
import { z, ZodError } from 'zod';

const CreateOrderSchema = z.object({
  receiverName: z.string().min(1, { message: 'Receiver name is required' }),
  receiverPhone: z.string().min(10, { message: 'Not a valid phone number' }),
  service: z.string().min(1, { message: 'Service is required' }),
  address: z.string().min(1, { message: 'Address is required' }),
  description: z.string().min(1, { message: 'Description is required' }),
  voucherCode: z.string().optional(),
  attachments: z.array(z.string()).optional(),
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

    const json = await req.json();
    const data = CreateOrderSchema.parse(json);

    let voucher = null;
    if (data.voucherCode) {
      const { data: voucherRow, error: voucherError } = await supabase
        .from('vouchers')
        .select('*')
        .eq('code', data.voucherCode)
        .single();

      if (
        voucherError ||
        !voucherRow ||
        !voucherRow.is_active ||
        (voucherRow.expiry_date && new Date(voucherRow.expiry_date) < new Date())
      ) {
        return NextResponse.json({ error: 'Voucher invalid' }, { status: 400 });
      }

      if (voucherRow.usage_limit !== null) {
        const { count, error: countError } = await supabase
          .from('orders')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('voucher_id', voucherRow.id);

        if (countError || (count !== null && count >= voucherRow.usage_limit)) {
          return NextResponse.json(
            { error: 'Voucher invalid' },
            { status: 400 },
          );
        }
      }

      voucher = voucherRow;
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        receiver_name: data.receiverName,
        receiver_phone: data.receiverPhone,
        service: data.service,
        category: '',
        address: data.address,
        description: data.description,
        user_id: user.id,
        voucher_id: voucher ? voucher.id : null,
        attachments: data.attachments ? data.attachments : [],
      })
      .select('*')
      .single();

    if (orderError) throw orderError;

    // Invalidate cached lists for this user and admin views
    try {
      revalidateTag(`orders:user:${user.id}`);
      revalidateTag('orders:all');
      // Voucher usage might have changed
      revalidateTag('voucher:all');
    } catch {}

    return NextResponse.json(order, { status: 201 });
  } catch (err) {
    if (err instanceof ZodError) {
      const messages = err.issues.map((issue) => issue.message);
      return NextResponse.json({ error: messages.join(', ') }, { status: 400 });
    }

    console.error('Error creating order:', err);
    return NextResponse.json(
      { error: 'Failed to create order' },
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

    const getUserOrders = unstable_cache(
      async () => {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
      },
      [`orders-user-${user.id}`],
      { revalidate: 60, tags: [`orders:user:${user.id}`] },
    );

    const orders = await getUserOrders();

    return NextResponse.json(orders, { status: 200 });
  } catch (err) {
    console.error('Error fetching orders:', err);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 },
    );
  }
}
