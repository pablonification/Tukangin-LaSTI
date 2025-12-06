import { NextResponse } from 'next/server';
import { POST as createOrder } from '../order/route'; 


const FIXED_PRICE_MENU = [
  {
    id: "svc-001",
    name: "Cuci AC Split 0.5 - 1 PK",
    price_min: 75000,
    price_max: 75000,
    is_fixed: true,
    category: "AC",
    description: "Pembersihan unit indoor dan outdoor standar."
  },
  {
    id: "svc-002",
    name: "Perbaikan Pipa Bocor Ringan",
    price_min: 150000,
    price_max: 200000,
    is_fixed: false,
    category: "Pipa",
    description: "Perbaikan kebocoran kecil, belum termasuk sparepart."
  }
];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category_id');

    let services = FIXED_PRICE_MENU;

    if (category) {
      // Simple filter logic
      services = services.filter(s => 
        s.category.toLowerCase().includes(category.toLowerCase())
      );
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