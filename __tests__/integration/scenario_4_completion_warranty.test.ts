import { GET as getOrder, PATCH as completeOrder } from '@/app/api/order/[id]/route';
import { GET as getWarranty } from '@/app/api/warranty/route';
import { POST as submitReview } from '@/app/api/reviews/route';
import { POST as claimWarranty } from '@/app/api/warranty/claim/route';

jest.mock('next/cache', () => ({
  unstable_cache: (fn: unknown) => fn,
}));

type OrderRow = {
  id: string;
  user_id: string;
  professional_id?: string | null;
  status: string;
  total: number;
};

type WarrantyRow = Record<string, unknown>;

type WarrantyData = {
  id: string;
  order_id: string;
  status: string;
  coverage_type: string;
  created_at: string;
  valid_until: string;
  terms: string;
  professionals: {
    users: { name: string; phone: string };
  };
};

type ClaimWarrantyRow = { id: string; user_id: string; status: string };

const state: {
  orders: OrderRow[];
  warranties: WarrantyRow[];
  warrantyLookup: WarrantyData | null;
  claimWarranties: ClaimWarrantyRow[];
  user: { id: string } | null;
  failReviewInsert: boolean;
} = {
  orders: [
    { id: 'ord-1', user_id: 'user-1', professional_id: 'pro-1', status: 'PENDING', total: 150000 },
  ],
  warranties: [],
  warrantyLookup: {
    id: 'war-1',
    order_id: 'ord-1',
    status: 'ACTIVE',
    coverage_type: 'standard',
    created_at: new Date().toISOString(),
    valid_until: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15).toISOString(),
    terms: 'Covers leakage and parts.',
    professionals: {
      users: { name: 'Chandra Tukang', phone: '0812000333' },
    },
  },
  claimWarranties: [{ id: '33333333-3333-4333-8333-333333333333', user_id: 'user-1', status: 'ACTIVE' }],
  user: { id: 'user-1' },
  failReviewInsert: false,
};

const supabaseMock = {
  auth: {
    getUser: jest.fn(async () => ({ data: { user: state.user }, error: null })),
  },
  from: jest.fn((table: string) => {
    if (table === 'users') {
      return {
        select: () => ({
          eq: () => ({
            single: async () => ({
              data: { id: 'user-1', role: 'CUSTOMER', is_active: true },
              error: null,
            }),
          }),
        }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any;
    }

    if (table === 'orders') {
      return {
        select: () => ({
          eq: (_col: string, idVal: string) => ({
            eq: (_col2: string, userId: string) => ({
              single: async () => {
                const row = state.orders.find((o) => o.id === idVal && o.user_id === userId);
                return { data: row ?? null, error: null };
              },
            }),
          }),
        }),
        update: (payload: Record<string, unknown>) => ({
          eq: (_col: string, idVal: string) => ({
            eq: (_col2: string, userId: string) => {
              const idx = state.orders.findIndex((o) => o.id === idVal && o.user_id === userId);
              if (idx < 0) return { select: () => ({ single: async () => ({ data: null, error: new Error('not found') }) }) };
              const updated = {
                ...state.orders[idx],
                ...payload,
                updated_at: new Date().toISOString(),
                completed_at: (payload.completed_at as string | undefined) ?? new Date().toISOString(),
              };
              state.orders[idx] = updated;
              return {
                select: () => ({
                  single: async () => ({ data: updated, error: null }),
                }),
              };
            },
          }),
        }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any;
    }

    if (table === 'warranties') {
      return {
        insert: (payload: Record<string, unknown>) => {
          state.warranties.push(payload);
          return { error: null };
        },
        select: () => ({
          eq: (_col: string, orderId: string) => ({
            single: async () => ({
              data: state.warrantyLookup && state.warrantyLookup.order_id === orderId ? state.warrantyLookup : null,
              error: state.warrantyLookup && state.warrantyLookup.order_id === orderId ? null : new Error('not found'),
            }),
          }),
        }),
        update: (payload: Record<string, unknown>) => ({
          eq: (_col: string, idVal: string) => ({
            eq: (_col2: string, userId: string) => {
              const idx = state.claimWarranties.findIndex((w) => w.id === idVal && w.user_id === userId);
              if (idx < 0) return Promise.resolve({ error: new Error('not found') });
              state.claimWarranties[idx] = { ...state.claimWarranties[idx], ...payload } as ClaimWarrantyRow;
              return Promise.resolve({ error: null });
            },
          }),
        }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any;
    }

    if (table === 'reviews') {
      return {
        insert: () => ({
          select: () => ({
            single: async () => {
              if (state.failReviewInsert) return { data: null, error: new Error('insert failed') };
              return { data: { id: 'rev-1', created_at: new Date().toISOString() }, error: null };
            },
          }),
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

const buildReq = (url: string, init?: RequestInit) => new Request(url, init);
const buildReviewReq = (body: Record<string, unknown>) =>
  new Request('http://localhost/api/reviews', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
const buildClaimReq = (body: Record<string, unknown>) =>
  new Request('http://localhost/api/warranty/claim', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });

describe('Scenario 4: Penyelesaian & Garansi (Completion & Warranty Logic)', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeAll(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  beforeEach(() => {
    state.orders = [
      { id: 'ord-1', user_id: 'user-1', professional_id: 'pro-1', status: 'PENDING', total: 150000 },
    ];
    state.warranties = [];
    state.warrantyLookup = {
      id: 'war-1',
      order_id: 'ord-1',
      status: 'ACTIVE',
      coverage_type: 'standard',
      created_at: new Date().toISOString(),
      valid_until: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15).toISOString(),
      terms: 'Covers leakage and parts.',
      professionals: {
        users: { name: 'Chandra Tukang', phone: '0812000333' },
      },
    };
    state.claimWarranties = [{ id: '33333333-3333-4333-8333-333333333333', user_id: 'user-1', status: 'ACTIVE' }];
    state.user = { id: 'user-1' };
    state.failReviewInsert = false;
    jest.clearAllMocks();
  });

  it('4.A - Konfirmasi Pelanggan: denies when unauthenticated', async () => {
    state.user = null;
    const res = await getOrder(buildReq('http://localhost/api/order/ord-1'), { params: Promise.resolve({ id: 'ord-1' }) });
    expect(res.status).toBe(401);
  });

  it('4.A - Konfirmasi Pelanggan: returns 404 when order not found', async () => {
    const res = await getOrder(buildReq('http://localhost/api/order/ord-missing'), { params: Promise.resolve({ id: 'ord-missing' }) });
    expect(res.status).toBe(404);
  });

  it('4.A - Konfirmasi Pelanggan: returns order details for owner', async () => {
    const res = await getOrder(buildReq('http://localhost/api/order/ord-1'), { params: Promise.resolve({ id: 'ord-1' }) });
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.id).toBe('ord-1');
    expect(json.status).toBe('PENDING');
  });

  it('4.A - Edge case: rejects invalid status transition', async () => {
    const res = await completeOrder(
      buildReq('http://localhost/api/order/ord-1', {
        method: 'PATCH',
        body: JSON.stringify({ status: 'PROCESSING' }),
        headers: { 'Content-Type': 'application/json' },
      }),
      { params: Promise.resolve({ id: 'ord-1' }) },
    );
    expect(res.status).toBe(400);
  });

  it('4.A + 4.B - Konfirmasi Pelanggan + Generate Garansi Otomatis: completes order, updates status, and creates warranty', async () => {
    const res = await completeOrder(
      buildReq('http://localhost/api/order/ord-1', {
        method: 'PATCH',
        body: JSON.stringify({ status: 'COMPLETED' }),
        headers: { 'Content-Type': 'application/json' },
      }),
      { params: Promise.resolve({ id: 'ord-1' }) },
    );
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.status).toBe('COMPLETED');
    expect(state.orders.find((o) => o.id === 'ord-1')?.status).toBe('COMPLETED');
    expect(state.warranties.length).toBe(1);
    expect(state.warranties[0].order_id).toBe('ord-1');
  });

  it('4.C - Input Ulasan: rejects when unauthenticated', async () => {
    state.user = null;
    const res = await submitReview(
      buildReviewReq({
        orderId: '00000000-0000-0000-0000-000000000001',
        professionalId: '00000000-0000-0000-0000-000000000002',
        rating: 5,
        comment: 'Great job',
      }),
    );
    expect(res.status).toBe(401);
  });

  it('4.C - Input Ulasan: submits review successfully', async () => {
    const res = await submitReview(
      buildReviewReq({
        orderId: '11111111-1111-4111-8111-111111111111',
        professionalId: '22222222-2222-4222-8222-222222222222',
        rating: 4,
        comment: 'Nice work',
        tags: ['ramah', 'tepat waktu'],
      }),
    );
    const json = await res.json();
    expect(res.status).toBe(201);
    expect(json.success).toBe(true);
    expect(json.reviewId).toBe('rev-1');
  });

  it('4.C - Edge case: returns 500 when insert fails', async () => {
    state.failReviewInsert = true;
    const res = await submitReview(
      buildReviewReq({
        orderId: '11111111-1111-4111-8111-111111111111',
        professionalId: '22222222-2222-4222-8222-222222222222',
        rating: 4,
        comment: 'Nice work',
      }),
    );
    expect(res.status).toBe(500);
  });

  it('4.D - Cek Garansi Digital: rejects when unauthenticated', async () => {
    state.user = null;
    const res = await getWarranty(buildReq('http://localhost/api/warranty?orderId=ord-1'));
    expect(res.status).toBe(401);
  });

  it('4.D - Cek Garansi Digital: rejects when orderId missing', async () => {
    const res = await getWarranty(buildReq('http://localhost/api/warranty'));
    expect(res.status).toBe(400);
  });

  it('4.D - Cek Garansi Digital: returns 404 when warranty not found', async () => {
    const res = await getWarranty(buildReq('http://localhost/api/warranty?orderId=ord-missing'));
    expect(res.status).toBe(404);
  });

  it('4.D - Cek Garansi Digital: returns warranty details with professional info', async () => {
    const res = await getWarranty(buildReq('http://localhost/api/warranty?orderId=ord-1'));
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.orderId).toBe('ord-1');
    expect(json.professional.name).toBe('Chandra Tukang');
    expect(json.remainingDays).toBeGreaterThan(0);
  });

  it('4.E - [Edge Case] Klaim Garansi: submits warranty claim and updates status', async () => {
    const res = await claimWarranty(
      buildClaimReq({
        warrantyId: '33333333-3333-4333-8333-333333333333',
        issueDescription: 'AC tetap bocor setelah servis',
        evidencePhotos: ['https://example.com/img1.jpg'],
      }),
    );
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.status).toBe('SUBMITTED');
    expect(state.claimWarranties[0].status).toBe('CLAIMED');
  });

  it('4.E - Edge case: rejects claim when unauthenticated', async () => {
    state.user = null;
    const res = await claimWarranty(
      buildClaimReq({
        warrantyId: '33333333-3333-4333-8333-333333333333',
        issueDescription: 'AC tetap bocor setelah servis',
        evidencePhotos: ['https://example.com/img1.jpg'],
      }),
    );
    expect(res.status).toBe(401);
  });
});
