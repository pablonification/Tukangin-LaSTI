import { NextResponse } from 'next/server';
import { unstable_cache, revalidateTag } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { z, ZodError } from 'zod';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

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
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const json = await req.json();
    const data = CreateOrderSchema.parse(json);

    let voucher = null;
    if (data.voucherCode) {
      voucher = await prisma.vouchers.findUnique({
        where: { code: data.voucherCode },
      });

      if (
        !voucher ||
        !voucher.isActive ||
        (voucher.expiryDate && voucher.expiryDate < new Date()) ||
        voucher.usageLimit !== null // &&
        //      voucher.>= voucher.usage_limit) //fix later
      ) {
        return NextResponse.json({ error: 'Voucher invalid' }, { status: 400 });
      }

      if (voucher.usageLimit !== null) {
        const userUsageCount = await prisma.orders.count({
          where: {
            userId: session.user.id,
            voucherId: voucher.id,
          },
        });

        if (userUsageCount >= voucher.usageLimit) {
          return NextResponse.json(
            { error: 'Voucher invalid' },
            { status: 400 },
          );
        }
      }
    }

    const order = await prisma.orders.create({
      data: {
        receiverName: data.receiverName,
        service: data.service,
        category: '',
        address: data.address,
        description: data.description,
        userId: session.user.id,
        voucherId: voucher ? voucher.id : null,
        receiverPhone: '',
        attachments: data.attachments ? data.attachments : [],
      },
    });

    // Invalidate cached lists for this user and admin views
    try {
      revalidateTag(`orders:user:${Number(session.user.id)}`);
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
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    const getUserOrders = unstable_cache(
      async () => {
        return prisma.orders.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
        });
      },
      [`orders-user-${userId}`],
      { revalidate: 60, tags: [`orders:user:${userId}`] },
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
