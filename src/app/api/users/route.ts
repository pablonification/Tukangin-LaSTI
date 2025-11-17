import { NextResponse } from 'next/server';
import { revalidateTag, unstable_cache } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

type UserUpdateData = {
  name: string;
  address?: string;
  phone?: string;
};

const UpdateUserRequest = z.object({
  name: z
    .string()
    .min(1, { message: 'Name is required' })
    .max(100, { message: 'Name cannot exceed 100 characters' }),
  address: z.string().min(1, { message: 'Invalid email address' }).optional(),
  phone: z.string().min(1, { message: 'Invalid phone number' }).optional(),
});

// PATCH: update nama user sendiri
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = UpdateUserRequest.parse(body);
    const { name, address, phone } = validatedData;

    // Build update data object with only provided fields
    const updateData: UserUpdateData = { name };
    if (address !== undefined) updateData.address = address;
    if (phone !== undefined) updateData.phone = phone;

    const updatedUser = await prisma.users.update({
      where: { id: session.user.id },
      data: updateData,
    });

    try {
      revalidateTag(`user:${Number(session.user.id)}`);
    } catch {}

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues.map((e) => e.message).join(', ') },
        { status: 400 },
      );
    }

    console.error(error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 },
    );
  }
}

// GET: ambil data user sendiri
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const getUser = unstable_cache(
      async () => {
        return prisma.users.findUnique({
          where: { id: userId },
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
          },
        });
      },
      [`user-${userId}`],
      { revalidate: 120, tags: [`user:${userId}`] },
    );

    const user = await getUser();
    console.log(user);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 },
    );
  }
}
