import { NextResponse } from 'next/server';
import { POST as createOrder } from '../order/route';
import { services as staticServices } from '@/lib/data';

const FIXED_PRICE_MENU = staticServices.map((svc, idx) => ({
  id: `svc-${String(idx + 1).padStart(3, '0')}`,
  slug: svc.slug,
  name: svc.name,
  category: svc.category,
  description: svc.description,
  price_min: svc.price,
  price_max: svc.price,
  is_fixed: true,
}));

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category_id');
    const slug = searchParams.get('slug');

    let services = FIXED_PRICE_MENU;

    if (category) {
      services = services.filter((s) =>
        s.category.toLowerCase().includes(category.toLowerCase()),
      );
    }

    if (slug) {
      services = services.filter((s) => s.slug === slug);
    }

    // Strict Alignment: Response Body format
    return NextResponse.json({
      success: true,
      data: services
    });

  } catch (err) {
    console.error('Failed to fetch services:', err);
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 });
  }
}

// 2. POST: Layanan Pembuatan Pesanan
export async function POST(req: Request) {
    return createOrder(req);
}