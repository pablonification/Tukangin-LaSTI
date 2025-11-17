import { NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const CheckVoucherRequest = z.object({
  code: z.string().min(1, { message: 'Voucher code is required' }),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { valid: false, message: 'Unauthorized' },
        { status: 401 },
      );
    }
    const userId = Number(session.user.id);

    const body = await req.json();
    const { code } = CheckVoucherRequest.parse(body);

    const getVoucherByCode = unstable_cache(
      async () => {
        return prisma.voucher.findUnique({ where: { code } });
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

    if (voucher.expiry_date && voucher.expiry_date < new Date()) {
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
      const userUsageCount = await prisma.order.count({
        where: { userId, voucherId: voucher.id },
      });
      if (userUsageCount >= voucher.user_limit) {
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
      discount_type: voucher.discount_type,
      discount_value: voucher.discount_value,
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
