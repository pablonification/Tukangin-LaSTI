import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabaseServer';

export async function GET(req: Request) {
  try {
    const supabase = await getSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Get orderId from query params
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('orderId');
    
    if (!id) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    // Join Warranty -> Professional -> User
    const { data: warranty, error } = await supabase
      .from('warranties')
      .select(`
        *,
        professionals (
          users ( name, phone )
        )
      `)
      .eq('order_id', id)
      .single();

    if (error || !warranty) {
      return NextResponse.json({ error: 'Warranty not found' }, { status: 404 });
    }

    // Strict Alignment: Report 4.4.c Response
    interface WarrantyProfessional {
      users?: { name?: string; phone?: string };
    }
    const professional = warranty.professionals as unknown as WarrantyProfessional;
    const validUntil = new Date(warranty.valid_until);
    const now = new Date();
    const remainingDays = Math.ceil((validUntil.getTime() - now.getTime()) / (1000 * 3600 * 24));

    return NextResponse.json({
      warrantyId: warranty.id,
      orderId: warranty.order_id,
      status: warranty.status,
      coverageType: warranty.coverage_type,
      issuedAt: warranty.created_at,
      validUntil: warranty.valid_until,
      remainingDays: remainingDays > 0 ? remainingDays : 0,
      terms: warranty.terms,
      professional: {
        name: professional?.users?.name || "Tukang",
        contact: professional?.users?.phone || "-"
      }
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_err) {
    return NextResponse.json({ error: 'Fetch warranty failed' }, { status: 500 });
  }
}