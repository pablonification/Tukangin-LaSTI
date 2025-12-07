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

  return synonyms[lowered] ?? null;
};

interface ProfessionalDbRow {
  user_id: string;
  speciality: string;
  user: {
    id: string;
    name: string;
    phone: string | null;
    email: string;
    role: string;
    is_active: boolean;
  } | null;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const requestedCategory = normalizeCategory(searchParams.get('category'));

    const supabase = await getSupabaseServer();
    await requireAdmin(supabase);

    const { data: professionals, error: prosError } = await supabase
      .from('professionals')
      .select('user_id, speciality, user:users(id, name, phone, email, role, is_active)');

    if (prosError) throw prosError;
    
    const typedProfessionals = professionals as unknown as ProfessionalDbRow[];

    const { data: reviews } = await supabase
      .from('reviews')
      .select('professional_id, rating');

    const available = (typedProfessionals ?? [])
      .filter((pro) => pro.user && pro.user.is_active && ['DEVELOPER', 'ADMIN', 'TUKANG'].includes(pro.user.role))
      .map((pro) => {
        const professionalReviews = (reviews ?? []).filter(
          (r) => r.professional_id === pro.user_id,
        );
        const avgRating = professionalReviews.length
          ? professionalReviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) /
            professionalReviews.length
          : 0;

        const specializations = pro.speciality
          ? pro.speciality
              .split(',')
              .map((s: string) => normalizeCategory(s))
              .filter(Boolean) as string[]
          : [];

        const matchesCategory = requestedCategory
          ? specializations.includes(requestedCategory)
          : true;

        return {
          id: pro.user_id,
          name: pro.user?.name ?? '-',
          phone: pro.user?.phone ?? '-',
          email: pro.user?.email ?? '-',
          specialization: specializations,
          rating: Number(avgRating.toFixed(1)),
          isAvailable: matchesCategory,
        };
      })
      .filter((pro) => (requestedCategory ? pro.isAvailable : true));

    return NextResponse.json(available, { status: 200 });
  } catch (error) {
    const adminResp = adminErrorResponse(error);
    if (adminResp) return adminResp;

    return NextResponse.json(
      { error: 'Failed to fetch available tukang' },
      { status: 500 },
    );
  }
}
