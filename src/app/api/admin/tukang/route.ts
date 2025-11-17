import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role === 'CUSTOMER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tukangList = await prisma.tukang.findMany();
    return NextResponse.json(tukangList);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch tukang',
        details: String(error),
      },
      { status: 500 },
    );
  }
}
