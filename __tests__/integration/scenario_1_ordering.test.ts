import { POST as createOrder } from '@/app/api/order/route';
import { POST as processPayment } from '@/app/api/order/[id]/payment/route';
import { GET as getMenu } from '@/app/api/services/route';

// Mock cache helpers so revalidateTag/unstable_cache do nothing during tests
jest.mock('next/cache', () => ({
  revalidateTag: jest.fn(),
  unstable_cache: (fn: unknown) => fn,
}));

type OrderRow = {
  id: string;
  user_id: string;
  voucher_id?: number | null;
  total: number;
  subtotal?: number | null;
  discount?: number | null;
  status: string;
  service?: string;
  category?: string;
};

type VoucherRow = {
  id: number;
  code: string;
  is_active: boolean;
  expiry_date?: string | null;
  usage_limit?: number | null;
};

// Minimal in-memory supabase stub tailored to the route behaviours
const supabaseState: { orders: OrderRow[]; vouchers: VoucherRow[]; user: { id: string } | null } = {
  orders: [
    { id: 'ord-1', user_id: 'user-123', total: 150_000, subtotal: 150_000, discount: 0, status: 'PENDING', category: 'AC' },
  ],
  vouchers: [
    { id: 1, code: 'PERC10', is_active: true, expiry_date: null, usage_limit: 2 },
    { id: 2, code: 'INACTIVE', is_active: false, expiry_date: null, usage_limit: null },
  ],
  user: { id: 'user-123' },
};

const supabaseMock = {
  auth: {
    getUser: jest.fn(async () => ({ data: { user: supabaseState.user }, error: null })),
  },
  from: jest.fn((table: string) => {
    if (table === 'vouchers') {
      return {
        select: () => ({
          eq: (_col: string, value: string) => ({
            single: async () => {
              const row = supabaseState.vouchers.find((v) => v.code === value);
              return { data: row ?? null, error: row ? null : new Error('not found') };
            },
          }),
        }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any;
    }

    if (table === 'users') {
      return {
        select: () => ({
          eq: () => ({
            single: async () => ({
              data: { id: 'user-123', role: 'CUSTOMER', is_active: true },
              error: null,
            }),
          }),
        }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any;
    }

    if (table === 'orders') {
      return {
        insert: (payload: Record<string, unknown>) => ({
          select: () => ({
            single: async () => {
              const newOrder: OrderRow = {
                id: (payload.id as string | undefined) ?? `ord-${supabaseState.orders.length + 1}`,
                user_id: payload.user_id as string,
                voucher_id: (payload.voucher_id as number | null | undefined) ?? null,
                total: (payload.total as number | undefined) ?? 150_000,
                subtotal: (payload.subtotal as number | undefined) ?? 150_000,
                discount: (payload.discount as number | undefined) ?? 0,
                status: 'PENDING',
                service: payload.service as string | undefined,
                category: payload.category as string | undefined,
              };
              supabaseState.orders.push(newOrder);
              return { data: newOrder, error: null };
            },
          }),
        }),
        select: (_cols: string, opts?: Record<string, unknown>) => {
          if (opts?.count === 'exact' && opts?.head) {
            return {
              eq: (_col: string, userId: string) => ({
                eq: (_col2: string, voucherId: number) => ({
                  count: supabaseState.orders.filter(
                    (o) => o.user_id === userId && o.voucher_id === voucherId,
                  ).length,
                  error: null,
                }),
              }),
            };
          }

          return {
            eq: (_col: string, orderId: string) => ({
              eq: (_col2: string, userId: string) => ({
                single: async () => {
                  const row = supabaseState.orders.find(
                    (o) => o.id === orderId && o.user_id === userId,
                  );
                  return {
                    data: row ? { total: row.total, status: row.status } : null,
                    error: row ? null : new Error('not found'),
                  };
                },
              }),
            }),
          };
        },
        update: (payload: Record<string, unknown>) => ({
          eq: (_col: string, orderId: string) => {
            const idx = supabaseState.orders.findIndex((o) => o.id === orderId);
            if (idx >= 0) {
              supabaseState.orders[idx] = { 
                ...supabaseState.orders[idx], 
                status: (payload.status as string | undefined) ?? supabaseState.orders[idx].status,
              };
            }
            return { error: idx >= 0 ? null : new Error('not found') };
          },
        }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return {} as any;
  }),
};

jest.mock('@/lib/supabaseServer', () => ({
  getSupabaseServer: async () => supabaseMock,
}));

const buildRequest = (url: string, init?: RequestInit) => new Request(url, init);

describe('Scenario 1: Pencarian & Pemesanan (Ordering Logic)', () => {
  beforeEach(() => {
    supabaseState.orders = [{ id: 'ord-1', user_id: 'user-123', total: 150_000, status: 'PENDING' }];
    supabaseState.user = { id: 'user-123' };
    jest.clearAllMocks();
  });

  it('1.A - Cek Menu Harga Tetap: returns fixed price menu filtered by category', async () => {
    const req = buildRequest('http://localhost/api/services?category_id=AC');
    const res = await getMenu(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.every((svc: { category: string }) => svc.category.toLowerCase().includes('ac'))).toBe(true);
  });

  it('1.B - Buat Pesanan Baru: creates order and defaults to PENDING status', async () => {
    const req = buildRequest('http://localhost/api/order', {
      method: 'POST',
      body: JSON.stringify({
        receiverName: 'Budi',
        receiverPhone: '081234567890',
        service: 'Cuci AC Split',
        category: 'AC',
        address: 'Jl. Dago',
        description: 'AC kotor',
        subtotal: 150000,
        discount: 0,
        total: 150000,
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await createOrder(req);
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json.status).toBe('PENDING');
    expect(json.service).toBe('Cuci AC Split');
  });

  it('1.C - Auth validation: rejects order creation when user not authenticated', async () => {
    supabaseState.user = null;
    const req = buildRequest('http://localhost/api/order', {
      method: 'POST',
      body: JSON.stringify({
        receiverName: 'Budi',
        receiverPhone: '081234567890',
        service: 'Cuci AC',
        category: 'AC',
        address: 'Jl. Dago',
        description: 'AC kotor',
        subtotal: 120000,
        discount: 0,
        total: 120000,
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await createOrder(req);
    expect(res.status).toBe(401);
  });

  it('1.D - Voucher validation: rejects order creation with invalid voucher', async () => {
    const req = buildRequest('http://localhost/api/order', {
      method: 'POST',
      body: JSON.stringify({
        receiverName: 'Budi',
        receiverPhone: '081234567890',
        service: 'Cuci AC Split',
        category: 'AC',
        address: 'Jl. Dago',
        description: 'AC kotor',
        voucherCode: 'INACTIVE',
        subtotal: 150000,
        discount: 0,
        total: 150000,
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await createOrder(req);
    expect(res.status).toBe(400);
  });

  it('1.E - Validation: rejects order creation when payload missing required fields', async () => {
    const req = buildRequest('http://localhost/api/order', {
      method: 'POST',
      body: JSON.stringify({ service: 'Cuci AC' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await createOrder(req);
    expect(res.status).toBe(400);
  });

  it('1.F - Pembayaran DP Sukses: processes DP payment and moves status to PROCESSING', async () => {
    const req = buildRequest('http://localhost/api/order/ord-1/payment', {
      method: 'POST',
      body: JSON.stringify({ amount: 75_000, payment_method: 'GOPAY' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await processPayment(req, { params: Promise.resolve({ id: 'ord-1' }) });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.order_status).toBe('PROCESSING');
    expect(supabaseState.orders.find((o) => o.id === 'ord-1')?.status).toBe('PROCESSING');
  });

  it('1.G - [Edge Case] DP Salah Nominal: rejects payment when DP amount not 50% of total', async () => {
    const req = buildRequest('http://localhost/api/order/ord-1/payment', {
      method: 'POST',
      body: JSON.stringify({ amount: 10_000, payment_method: 'GOPAY' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await processPayment(req, { params: Promise.resolve({ id: 'ord-1' }) });
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toContain('Invalid DP Amount');
  });
});
