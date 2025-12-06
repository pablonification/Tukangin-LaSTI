import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabaseServer';
import { z } from 'zod';

const ReviewSchema = z.object({
  orderId: z.string().uuid(),
  professionalId: z.string().uuid(),
  rating: z.number().min(1).max(5),
  comment: z.string(),
  tags: z.array(z.string()).optional()
});

export async function POST(req: Request) {
  try {
    const supabase = await getSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: userProfile } = await supabase
      .from('users')
      .select('is_active')
      .eq('id', user.id)
      .single();

    if (userProfile && !userProfile.is_active) {
      return NextResponse.json({ error: 'Account suspended' }, { status: 403 });
    }

    const json = await req.json();
    const data = ReviewSchema.parse(json);

    // Strict Alignment: Insert into 'reviews' table
    const { data: review, error } = await supabase
      .from('reviews')
      .insert({
        order_id: data.orderId,
        user_id: user.id,
        professional_id: data.professionalId,
        rating: data.rating,
        comment: data.comment,
        tags: data.tags || []
      })
      .select('id, created_at')
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      reviewId: review.id,
      createdAt: review.created_at,
      message: "Review submitted successfully."
    }, { status: 201 });
  } catch (err) {
    console.error('Review submission failed:', err);
    return NextResponse.json({ error: 'Review submission failed' }, { status: 500 });
  }
}