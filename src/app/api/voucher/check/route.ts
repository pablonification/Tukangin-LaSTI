import { NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';
import { getSupabaseServer } from '@/lib/supabaseServer';
import { z } from 'zod';

const CheckVoucherRequest = z.object({
  code: z.string().min(1, { message: 'Voucher code is required' }),
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
      return NextResponse.json(
        { valid: false, message: 'Unauthorized' },
        { status: 401 },
      );
    }

    const body = await req.json();
    const { code } = CheckVoucherRequest.parse(body);

    const getVoucherByCode = unstable_cache(
      async () => {
        const { data, error } = await supabase
          .from('vouchers')
          .select('*')
          .eq('code', code)
          .single();

        if (error) throw error;
        return data;
      },
      [`voucher-${code}`],
      { revalidate: 300, tags: ['voucher:all', `voucher:${code}`] },
    );

    const voucher = await getVoucherByCode();

    if (!voucher) {
      return NextResponse.json(
        { valid: false, message: 'Voucher not found' },
        { status: 404 },
      );
    }

    if (!voucher.is_active) {
      return NextResponse.json(
        { valid: false, message: 'Voucher is not active' },
        { status: 400 },
      );
    }

    if (voucher.expiry_date && new Date(voucher.expiry_date) < new Date()) {
      return NextResponse.json(
        { valid: false, message: 'Voucher has expired' },
        { status: 400 },
      );
    }

    if (voucher.usage_limit && voucher.used_count >= voucher.usage_limit) {
      return NextResponse.json(
        { valid: false, message: 'Voucher usage limit reached' },
        { status: 400 },
      );
    }

    if (voucher.user_limit) {
      const { count: userUsageCount, error: countError } = await supabase
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('voucher_id', voucher.id);

      if (countError || (userUsageCount !== null && userUsageCount >= voucher.user_limit)) {
        return NextResponse.json(
          {
            valid: false,
            message: 'You have used this voucher too many times',
          },
          { status: 400 },
        );
      }
    }

    return NextResponse.json({
      valid: true,
      code: voucher.code,
      discount_type: voucher.type,
      discount_value: voucher.value,
      max_discount: voucher.max_discount,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { valid: false, message: err.issues.map((e) => e.message).join(', ') },
        { status: 400 },
      );
    }
    console.error(err);
    return NextResponse.json(
      { valid: false, message: 'Failed to check voucher' },
      { status: 500 },
    );
  }
}
