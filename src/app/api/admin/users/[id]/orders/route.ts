import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const param = await params;
    const userId = parseInt(param.id, 10);
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        Tukang: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const mapped = orders.map((o) => ({
      id: `ORD-${o.id.toString().padStart(3, '0')}`,
      service: o.service,
      status: o.status,
      amount: o.total ? `Rp ${o.total.toLocaleString('id-ID')}` : 'Rp 0',
      date: o.createdAt.toISOString().split('T')[0],
      location: o.address,
      tukang: o.Tukang ? o.Tukang.name : null,
    }));

    return NextResponse.json(mapped);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 },
    );
  }
}
