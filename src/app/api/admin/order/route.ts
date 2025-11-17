import { NextResponse } from 'next/server';
import { unstable_cache, revalidateTag } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { z, ZodError } from 'zod';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const UpsertOrderRequest = z.object({
  id: z.number().optional(),
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
  voucherId: z.number().optional(),
  tukangId: z.number().optional(),
  attachment: z.array(z.string()).optional(),
  receiverPhone: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role === 'CUSTOMER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const json = await req.json();
    const data = UpsertOrderRequest.parse(json);

    // kalau update, ambil dulu order lama
    let existingOrder = null;
    if (data.id) {
      existingOrder = await prisma.order.findUnique({
        where: { id: data.id },
        include: { Voucher: true },
      });
      if (!existingOrder) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }
    }

    // tentukan voucher yang dipakai (baru dari request atau lama)
    const voucherId = data.voucherId ?? existingOrder?.voucherId ?? null;
    let discount = 0;

    if (voucherId) {
      const voucher = await prisma.voucher.findUnique({
        where: { id: voucherId },
      });
      if (
        !voucher ||
        !voucher.is_active ||
        (voucher.expiry_date && voucher.expiry_date < new Date())
      ) {
        return NextResponse.json(
          { error: 'Voucher not valid' },
          { status: 400 },
        );
      }
      discount =
        voucher.discount_type === 'PERCENT'
          ? Math.floor(data.subtotal * (Number(voucher.discount_value) / 100))
          : Math.floor(Number(voucher.discount_value));
      if (voucher.max_discount) {
        discount = Math.min(discount, Number(voucher.max_discount));
      }
    }

    const subtotal = Math.floor(data.subtotal);
    const total = subtotal - discount;

    // derive completedAt & warrantyUntil
    let completedAt: Date | null = null;
    let warrantyUntil: Date | null = null;
    if (data.status === 'COMPLETED') completedAt = new Date();
    if (data.status === 'WARRANTY') {
      const now = new Date();
      warrantyUntil = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    }

    // prepare data untuk create/update
    const orderData = {
      receiverName: data.receiverName,
      service: data.service,
      address: data.address,
      description: data.description,
      status: data.status,
      subtotal,
      discount,
      total,
      ...(completedAt && { completedAt }),
      ...(warrantyUntil && { warrantyUntil }),
      voucherId,
      userId: existingOrder?.userId ?? Number(session.user.id),
      tukangId: data.tukangId ?? null,
      attachments: data.attachment,
      receiverPhone: data.receiverPhone,
    };

    let order;
    if (data.id) {
      order = await prisma.order.update({
        where: { id: data.id },
        data: orderData,
      });
    } else {
      order = await prisma.order.create({ data: orderData });
    }

    // update used_count voucher kalau baru dipakai
    if (voucherId && (!data.id || existingOrder?.voucherId !== voucherId)) {
      await prisma.voucher.update({
        where: { id: voucherId },
        data: { used_count: { increment: 1 } },
      });
    }

    try {
      // Invalidate relevant caches
      revalidateTag('orders:all');
      revalidateTag(`orders:user:${order.userId}`);
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
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role === 'CUSTOMER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const getAdminOrders = unstable_cache(
      async () => {
        return prisma.order.findMany({
          include: { User: true },
          orderBy: { createdAt: 'desc' },
        });
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
