import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabaseServer';

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

    // Query joins: Order -> Professional -> User (for name/photo)
    const { data: order, error } = await supabase
      .from('Orders')
      .select(`
        id,
        status,
        professionals!inner (
          user_id,
          speciality,
          rating,
          users!inner (
            name,
            image
          )
        )
      `)
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error || !order) {
      return NextResponse.json({ error: 'Professional not found or assigned yet' }, { status: 404 });
    }

    // Transform to Report Format
    interface ProfessionalData {
      user_id: string;
      speciality: string;
      users: { name: string; image: string };
    }
    const professional = order.professionals as unknown as ProfessionalData;
    const responseData = {
      success: true,
      data: {
        order_id: order.id,
        mitra: {
          id: professional.user_id,
          name: professional.users.name,
          rating: 4.8, // Mocked if not yet in DB, or fetch aggregate
          total_jobs: 150, // Mocked for prototype
          photo_url: professional.users.image || "https://assets.tukangin.com/mitra/default.jpg",
          speciality: professional.speciality
        },
        estimated_arrival: "15 mins" // Static for prototype
      }
    };

    return NextResponse.json(responseData, { status: 200 });

  } catch (err) {
    console.error('Fetch professional error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}