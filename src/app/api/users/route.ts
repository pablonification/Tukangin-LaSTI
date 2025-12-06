import { NextResponse } from 'next/server';
import { revalidateTag, unstable_cache } from 'next/cache';
import { getSupabaseServer } from '@/lib/supabaseServer';
import { z } from 'zod';

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
    const supabase = await getSupabaseServer();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = UpdateUserRequest.parse(body);
    const { name, address, phone } = validatedData;

    // Build update data object with only provided fields
    const updateData: UserUpdateData = { name };
    if (address !== undefined) updateData.address = address;
    if (phone !== undefined) updateData.phone = phone;

    const { data: updatedUser, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', user.id)
      .select('id, name, email, phone, address')
      .single();

    if (error) throw error;

    try {
      revalidateTag(`user:${user.id}`);
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
    const supabase = await getSupabaseServer();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const getUser = unstable_cache(
      async () => {
        const { data, error } = await supabase
          .from('users')
          .select('id, name, email, phone, address')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        return data;
      },
      [`user-${user.id}`],
      { revalidate: 120, tags: [`user:${user.id}`] },
    );

    const profile = await getUser();
    console.log(profile);

    if (!profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(profile, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 },
    );
  }
}
