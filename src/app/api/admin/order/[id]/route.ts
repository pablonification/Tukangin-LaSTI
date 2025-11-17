import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { z, ZodError } from 'zod';

const DeleteOrderSchema = z.object({
  id: z.string().regex(/^\d+$/, 'Invalid order id'),
});

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role === 'CUSTOMER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const data = DeleteOrderSchema.parse(resolvedParams);

    const deleted = await prisma.order.delete({
      where: { id: Number(data.id) },
    });

    return NextResponse.json(
      { message: 'Order deleted', order: deleted },
      { status: 200 },
    );
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json(
        { error: err.issues.map((i) => i.message).join(', ') },
        { status: 400 },
      );
    }

    console.error('Error deleting order:', err);
    return NextResponse.json(
      { error: 'Failed to delete order' },
      { status: 500 },
    );
  }
}
