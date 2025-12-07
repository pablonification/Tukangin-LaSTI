import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabaseServer';
import { adminErrorResponse, requireAdmin } from '@/lib/adminAuth';
import { JOB_CATEGORIES } from '@/lib/data';

const normalizeCategory = (value?: string | null) => {
  if (!value) return null;
  const lowered = value.trim().toLowerCase();
  const direct = JOB_CATEGORIES.find((cat) => cat.toLowerCase() === lowered);
  if (direct) return direct;

  const synonyms: Record<string, string> = {
    listrik: 'Kelistrikan',
    kelistrikan: 'Kelistrikan',
    ac: 'AC',
    perpipaan: 'Perpipaan',
    konstruksi: 'Konstruksi',
    elektronik: 'Elektronik',
    atap: 'Atap',
    cat: 'Cat',
  };

  return synonyms[lowered] ?? value;
};

export async function GET() {
  try {
    const supabase = await getSupabaseServer();
    await requireAdmin(supabase);

    const { data: professionals, error: prosError } = await supabase
      .from('professionals')
      .select('user_id, speciality, alamat, joined_at, user:users(id, name, email, phone, role, is_active, image)');

    if (prosError) throw prosError;

    const { data: reviews } = await supabase
      .from('reviews')
      .select('professional_id, rating');

    const { data: orders } = await supabase
      .from('orders')
      .select('professional_id, status, total');

    const mapped = (professionals ?? []).map((pro) => {
      const professionalReviews = (reviews ?? []).filter(
        (r) => r.professional_id === pro.user_id,
      );
      const professionalOrders = (orders ?? []).filter(
        (o) => o.professional_id === pro.user_id,
      );

      const totalJobs = professionalOrders.length;
      const completedJobs = professionalOrders.filter(
        (o) => o.status === 'COMPLETED',
      ).length;
      const earnings = professionalOrders.reduce((sum, o) => {
        const total = Number(o.total) || 0;
        return sum + total;
      }, 0);

      const avgRating = professionalReviews.length
        ? professionalReviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) /
          professionalReviews.length
        : 0;
      const specialization = pro.speciality
        ? (pro.speciality
            .split(',')
            .map((s: string) => normalizeCategory(s))
            .filter(Boolean) as string[])
        : [];

      return {
        id: pro.user_id,
        name: pro.user?.name ?? '-',
        phone: pro.user?.phone ?? '-',
        email: pro.user?.email ?? '-',
        specialization,
        location: pro.alamat ?? '-',
        joinDate: pro.joined_at ? new Date(pro.joined_at).toISOString().split('T')[0] : '-',
        status: pro.user?.is_active ? 'Active' : 'Inactive',
        rating: Number(avgRating.toFixed(1)),
        totalJobs,
        completedJobs,
        earnings: `Rp ${earnings.toLocaleString('id-ID')}`,
        responseTime: '-',
        profileImage: pro.user?.image ?? null,
        verified: true,
        lastActive: '-',
      };
    });

    return NextResponse.json(mapped);
  } catch (error) {
    const adminResp = adminErrorResponse(error);
    if (adminResp) return adminResp;

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
