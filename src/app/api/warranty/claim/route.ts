import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabaseServer';
import { z } from 'zod';

const ClaimSchema = z.object({
  warrantyId: z.string().uuid(),
  issueDescription: z.string().min(10),
  evidencePhotos: z.array(z.string().url())
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
    const data = ClaimSchema.parse(json);

    // Note: In a real app, create a 'claims' table. 
    // For this prototype, we'll log it and return success as per Report spec.
    // Or update warranty status to 'CLAIMED'.
    
    const { error } = await supabase
      .from('warranties')
      .update({ status: 'CLAIMED' })
      .eq('id', data.warrantyId)
      .eq('user_id', user.id);

    if (error) throw error;

    return NextResponse.json({
      claimId: `CLM-${Date.now()}`,
      status: "SUBMITTED",
      message: "Klaim garansi diterima. Tim kami akan memverifikasi dalam 1x24 jam."
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_err) {
    return NextResponse.json({ error: 'Claim submission failed' }, { status: 500 });
  }
}