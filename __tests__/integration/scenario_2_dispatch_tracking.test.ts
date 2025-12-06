import { GET as getProfessional } from '@/app/api/order/[id]/professional/route';
import { GET as getTracking } from '@/app/api/tracking/[id]/route';

jest.mock('next/cache', () => ({
  unstable_cache: (fn: unknown) => fn,
}));

type OrderRow = { id: string; user_id: string; professional_id?: string | null; status: string };
type ProfessionalRow = { user_id: string; speciality: string; rating?: number; users: { name: string; image?: string } };

const state: {
  user: { id: string } | null;
  orders: OrderRow[];
  professionals: ProfessionalRow[];
} = {
  user: { id: 'user-1' },
  orders: [
    { id: 'ord-1', user_id: 'user-1', professional_id: 'pro-1', status: 'PROCESSING' },
  ],
  professionals: [
    { user_id: 'pro-1', speciality: 'AC', rating: 4.8, users: { name: 'Asep Saepuloh', image: '' } },
  ],
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
          eq: (_col: string, orderId: string) => ({
            eq: (_col2: string, userId: string) => ({
              single: async () => {
                const row = state.orders.find((o) => o.id === orderId && o.user_id === userId);
                if (!row) return { data: null, error: null };
                const pro = state.professionals.find((p) => p.user_id === row.professional_id) || null;
                return {
                  data: {
                    ...row,
                    professionals: pro,
                  },
                  error: null,
                };
              },
            }),
          }),
        }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any;
    }

    if (table === 'professionals') {
      return {
        select: () => ({
          eq: (_col: string, userId: string) => ({
            single: async () => {
              const row = state.professionals.find((p) => p.user_id === userId);
              return { data: row ?? null, error: null };
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

const buildReq = (url: string) => new Request(url);

describe('Scenario 2: Penugasan & Pelacakan (Dispatch & Tracking Logic)', () => {
  beforeEach(() => {
    state.user = { id: 'user-1' };
    state.orders = [
      { id: 'ord-1', user_id: 'user-1', professional_id: 'pro-1', status: 'PROCESSING' },
    ];
    state.professionals = [
      { user_id: 'pro-1', speciality: 'AC & Kelistrikan', rating: 4.8, users: { name: 'Asep Saepuloh', image: '' } },
    ];
    jest.clearAllMocks();
  });

  it('2.A - Penugasan Mitra: returns assigned professional data', async () => {
    const res = await getProfessional(buildReq('http://localhost/api/order/ord-1/professional'), {
      params: Promise.resolve({ id: 'ord-1' }),
    });
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.mitra.name).toBe('Asep Saepuloh');
    expect(json.data.mitra.speciality).toContain('AC');
  });

  it('2.B - Tampilan Profil Mitra: professional assignment verified (same as 2.A - verifies card data)', async () => {
    // This test validates that professional data is returned correctly for UI display
    const res = await getProfessional(buildReq('http://localhost/api/order/ord-1/professional'), {
      params: Promise.resolve({ id: 'ord-1' }),
    });
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.mitra.name).toBe('Asep Saepuloh');
    expect(json.data.mitra.rating).toBe(4.8);
    expect(json.data.mitra.speciality).toContain('AC');
  });

  it('2.D - [Edge Case] Akses Ilegal: rejects unauthorized professional lookup', async () => {
    state.user = null;
    const res = await getProfessional(buildReq('http://localhost/api/order/ord-1/professional'), {
      params: Promise.resolve({ id: 'ord-1' }),
    });
    expect(res.status).toBe(401);
  });

  it('2.C - Pelacakan Live (Tracking): happy path when status PROCESSING', async () => {
    const res = await getTracking(buildReq('http://localhost/api/tracking/ord-1'), {
      params: Promise.resolve({ id: 'ord-1' }),
    });
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.order_id).toBe('ord-1');
    expect(json.data.location.lat).toBeDefined();
  });

  it('2.D - [Edge Case] Tracking unauthorized: returns 401 for unauthenticated', async () => {
    state.user = null;
    const res = await getTracking(buildReq('http://localhost/api/tracking/ord-1'), {
      params: Promise.resolve({ id: 'ord-1' }),
    });
    expect(res.status).toBe(401);
  });

  it('2.E - Edge case: tracking disabled when status not PROCESSING', async () => {
    state.orders[0].status = 'COMPLETED';
    const res = await getTracking(buildReq('http://localhost/api/tracking/ord-1'), {
      params: Promise.resolve({ id: 'ord-1' }),
    });
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.success).toBe(false);
  });
});
