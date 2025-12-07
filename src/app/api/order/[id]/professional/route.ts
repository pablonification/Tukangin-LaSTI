import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabaseServer';

interface ProfessionalDbRow {
  user_id: string;
  speciality: string;
  user?: {
    name: string;
    image: string | null;
  } | null;
  users?: {
    name: string;
    image: string | null;
  } | null;
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await getSupabaseServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, professional_id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (!order.professional_id) {
      return NextResponse.json({
        success: false,
        data: null,
        message: 'Tukang belum ditugaskan untuk pesanan ini.',
      }, { status: 200 });
    }

    const { data: professional, error: profError } = await supabase
      .from('professionals')
      .select('user_id, speciality, user:users(name, image), users(name, image)')
      .eq('user_id', order.professional_id)
      .single();

    if (profError || !professional) {
      return NextResponse.json(
        { error: 'Data tukang tidak ditemukan.' },
        { status: 404 },
      );
    }

    const typedProfessional = professional as unknown as ProfessionalDbRow;
    const name = typedProfessional.user?.name || typedProfessional.users?.name || 'Mitra Tukang';
    const image = typedProfessional.user?.image || typedProfessional.users?.image;

    const responseData = {
      success: true,
      data: {
        order_id: order.id,
        mitra: {
          id: typedProfessional.user_id,
          name,
          rating: 4.8,
          total_jobs: 150,
          photo_url: image || 'https://assets.tukangin.com/mitra/default.jpg',
          speciality: professional.speciality,
        },
        estimated_arrival: '15 mins',
      },
    };

    return NextResponse.json(responseData, { status: 200 });

  } catch (err) {
    console.error('Fetch professional error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}