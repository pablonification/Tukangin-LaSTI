import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabaseServer';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    // Verify order ownership
    const { data: order } = await supabase
      .from('orders')
      .select('status')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    if (order.status !== 'PROCESSING') {
         return NextResponse.json({ 
             success: false, 
             message: "Tracking not available. Driver not yet assigned or job finished." 
         });
    }

    // Strict Alignment: Report 4.2.b Response Body
    // Mocking "Live" movement for prototype demonstration
    const mockLocation = {
      lat: -6.8920 + (Math.random() * 0.001), // Jitter for "live" effect
      lng: 107.6110 + (Math.random() * 0.001),
      heading: 120,
      speed: 30
    };

    return NextResponse.json({
      success: true,
      data: {
        order_id: id,
        status: order.status,
        location: mockLocation,
        last_update: new Date().toISOString()
      }
    });
  } catch (err) {
    console.error('Tracking failed:', err);
    return NextResponse.json({ error: 'Tracking failed' }, { status: 500 });
  }
}