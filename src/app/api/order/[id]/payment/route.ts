import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabaseServer';
import { z } from 'zod';

const PaymentSchema = z.object({
  amount: z.number(),
  payment_method: z.string(),
  payment_token: z.string().optional()
});

type MaybeRequest = Request | { body?: unknown; json?: () => Promise<unknown> };

async function parseBody(req: MaybeRequest) {
  if (typeof req?.json === 'function') return req.json();
  if (req && 'body' in req && req.body) {
    if (typeof req.body === 'string') {
      try {
        return JSON.parse(req.body);
      } catch {
        return {};
      }
    }
    return req.body;
  }
  return {};
}

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
    const json = await parseBody(req);
    const data = PaymentSchema.parse(json);

    // 1. Verify Order & DP Amount
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('total, status, paid_at')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    // Check if this is DP payment (PENDING) or remaining payment (PROCESSING)
    const isDpPayment = order.status === 'PENDING';
    const isRemainingPayment = order.status === 'PROCESSING' && order.paid_at;

    if (!isDpPayment && !isRemainingPayment) {
      let errorMsg = 'Status pesanan tidak valid untuk pembayaran.';
      if (order.status === 'COMPLETED') {
        errorMsg = 'Pesanan sudah selesai, pembayaran tidak diperlukan.';
      } else if (order.status === 'CANCELLED') {
        errorMsg = 'Pesanan dibatalkan, pembayaran tidak dapat diproses.';
      }
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    // For DP payment
    if (isDpPayment) {
      if (order.paid_at) {
        return NextResponse.json({ 
          error: 'DP sudah dibayar untuk pesanan ini.' 
        }, { status: 400 });
      }

      const expectedDP = (order.total || 0) * 0.5;
      if (Math.abs(data.amount - expectedDP) > 1000) {
        return NextResponse.json({ error: 'Invalid DP Amount' }, { status: 400 });
      }
    }

    // For remaining payment
    if (isRemainingPayment) {
      const expectedRemaining = (order.total || 0) * 0.5;
      if (Math.abs(data.amount - expectedRemaining) > 1000) {
        return NextResponse.json({ 
          error: 'Jumlah pembayaran sisa tidak sesuai' 
        }, { status: 400 });
      }
    }

    // 2. Simulate Payment Gateway Processing...
    const receiptId = `rcpt-${Date.now()}`;

    // 3. Update order based on payment type
    if (isDpPayment) {
      // DP Payment - Update status to PROCESSING and set paid_at
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
          message: "Pembayaran DP berhasil. Sedang mencari mitra untuk Anda."
        }
      });
    } else {
      // Remaining Payment - Just record the payment (status stays PROCESSING)
      // You could add a field like 'fully_paid_at' or 'remaining_paid' if needed
      return NextResponse.json({
        success: true,
        data: {
          receipt_id: receiptId,
          order_status: "PROCESSING",
          message: "Pembayaran sisa berhasil. Pekerjaan dapat diselesaikan."
        }
      });
    }
  } catch (err) {
    console.error('Payment failed:', err);
    return NextResponse.json({ error: 'Payment failed' }, { status: 500 });
  }
}