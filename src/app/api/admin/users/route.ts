import { NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

type UserWithOrders = Prisma.UserGetPayload<{
  include: { orders: true };
}>;

export async function GET() {
  try {
    const users: UserWithOrders[] = await prisma.user.findMany({
      include: { orders: true },
    });

    const mapped = users.map((u) => {
      const totalOrders = u.orders.length;

      const totalSpent = u.orders
        .filter((o) => o.status === 'COMPLETED' && o.total !== null)
        .reduce((sum, o) => sum + (o.total ?? 0), 0);

      const lastOrder =
        totalOrders > 0
          ? new Date(Math.max(...u.orders.map((o) => o.createdAt.getTime())))
              .toISOString()
              .split('T')[0]
          : null;

      return {
        id: `USR-${u.id.toString().padStart(3, '0')}`,
        name: u.name,
        email: u.email,
        phone: u.phone ?? '-',
        location: '-', // belum ada di DB
        joinDate: u.joinedAt.toISOString().split('T')[0],
        totalOrders,
        totalSpent: `Rp ${totalSpent.toLocaleString('id-ID')}`,
        status: u.isActive ? 'Active' : 'Suspended',
        lastOrder: lastOrder ?? '-',
        rating: 0, // dummy
        avatar: u.image,
      };
    });

    return NextResponse.json(mapped);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 },
    );
  }
}
