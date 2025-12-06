import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabaseServer';
import { z } from 'zod';

const PaymentSchema = z.object({
  amount: z.number(),
  payment_method: z.string(),
  payment_token: z.string().optional()
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await getSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: userProfile } = await supabase
      .from('users')
      .select('is_active')
      .eq('id', user.id)
      .single();

    if (userProfile && !userProfile.is_active) {
      return NextResponse.json({ error: 'Account suspended' }, { status: 403 });
    }

    const { id } = await params;
    const json = await req.json();
    const data = PaymentSchema.parse(json);

    // 1. Verify Order & DP Amount
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('total, status')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    const expectedDP = (order.total || 0) * 0.5;
    if (Math.abs(data.amount - expectedDP) > 1000) {
        return NextResponse.json({ error: 'Invalid DP Amount' }, { status: 400 });
    }

    // 2. Simulate Payment Gateway Processing...
    const receiptId = `rcpt-${Date.now()}`;

    // 3. Update Status to SEARCHING_DRIVER (Report 4.1.c)
    const { error: updateError } = await supabase
      .from('orders')
      .update({ 
        status: 'PROCESSING', 
        paid_at: new Date().toISOString() 
      })
      .eq('id', id);

    if (updateError) throw updateError;

    return NextResponse.json({
        success: true,
        data: {
            receipt_id: receiptId,
            order_status: "PROCESSING",
            message: "Pembayaran berhasil. Sedang mencari mitra untuk Anda."
        }
    });
  } catch (err) {
    console.error('Payment failed:', err);
    return NextResponse.json({ error: 'Payment failed' }, { status: 500 });
  }
}