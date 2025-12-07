import { GET as getAvailableTukang } from '@/app/api/admin/tukang/available/route';
import { GET as getTukang } from '@/app/api/admin/tukang/route';
import { GET as getStats } from '@/app/api/admin/stats/route';
import { PATCH as patchOrder } from '@/app/api/admin/order/route';
import { GET as getUsers } from '@/app/api/admin/users/route';

jest.mock('next/cache', () => ({ unstable_cache: (fn: unknown) => fn }));

const state = {
  role: 'ADMIN',
  users: [
    {
      id: 'user-1',
      name: 'Alice Customer',
      email: 'alice@test.com',
      role: 'CUSTOMER',
      is_active: true,
      joined_at: new Date('2024-01-01').toISOString(),
      phone: '081234567890',
      image: null,
    },
    {
      id: 'user-2',
      name: 'Bob Customer',
      email: 'bob@test.com',
      role: 'CUSTOMER',
      is_active: false,
      joined_at: new Date('2024-01-02').toISOString(),
      phone: '081111111111',
      image: null,
    },
  ],
  orders: [
    {
      id: '11111111-1111-4111-8111-111111111111',
      user_id: 'user-1',
      receiver_name: 'Alice Customer',
      receiver_phone: '0812',
      service: 'AC Service',
      category: 'AC',
      address: 'Jl. Sudirman',
      description: 'Service AC',
      status: 'PENDING',
      created_at: new Date('2024-01-03').toISOString(),
      subtotal: 200000,
      discount: 0,
      total: 200000,
      professional_id: null as string | null,
      attachments: [],
    },
    {
      id: '22222222-2222-4222-8222-222222222222',
      user_id: 'user-1',
      receiver_name: 'Alice Customer',
      receiver_phone: '0812',
      service: 'AC Service',
      category: 'AC',
      address: 'Jl. Sudirman',
      description: 'Service AC',
      status: 'COMPLETED',
      created_at: new Date('2024-01-04').toISOString(),
      subtotal: 200000,
      discount: 0,
      total: 200000,
      professional_id: '33333333-3333-4333-8333-333333333333',
      attachments: [],
    },
  ],
  professionals: [
    {
      user_id: '33333333-3333-4333-8333-333333333333',
      speciality: 'AC, Kelistrikan',
      alamat: 'Jakarta',
      joined_at: new Date('2023-12-01').toISOString(),
      user: {
        id: '33333333-3333-4333-8333-333333333333',
        name: 'Chandra Tech',
        email: 'chandra@test.com',
        phone: '080000000000',
        role: 'DEVELOPER',
        is_active: true,
        image: null,
      },
    },
  ],
  reviews: [
    { professional_id: '33333333-3333-4333-8333-333333333333', rating: 5 },
    { professional_id: '33333333-3333-4333-8333-333333333333', rating: 4 },
  ],
};

const supabaseMock = {
  auth: {
    getUser: jest.fn(async () => ({ data: { user: { id: 'admin-1', role: state.role } }, error: null })),
  },
  from: jest.fn((table: string) => {
    if (table === 'users') {
      return {
        select: (cols: string, opts?: Record<string, unknown>) => {
          if (opts?.count === 'exact' && opts?.head && cols === 'id') {
            return {
              eq: (_col: string, role: string) => ({
                count: state.users.filter((u) => u.role === role).length,
                error: null,
              }),
            };
          }

          if (cols === 'role') {
            return {
              eq: () => ({
                single: async () => ({ data: { role: state.role }, error: null }),
              }),
            };
          }

          return {
            order: () => ({ data: state.users, error: null }),
          };
        },
      } as unknown;
    }

    if (table === 'orders') {
      return {
        select: (cols?: string, opts?: Record<string, unknown>) => {
          if (opts?.count === 'exact' && opts?.head && cols === 'id') {
            return {
              count: state.orders.length,
              error: null,
              eq: (_col: string, userId: string) => ({ count: state.orders.filter((o) => o.user_id === userId).length, error: null }),
            };
          }

          if (cols === 'professional_id, status, total') {
            return { data: state.orders.map((o) => ({ professional_id: o.professional_id, status: o.status, total: o.total })), error: null };
          }

          if (cols === 'total, status') {
            return {
              eq: (_col: string, status: string) => ({
                not: () => ({
                  data: state.orders.filter((o) => o.status === status && o.total !== null).map((o) => ({ total: o.total, status: o.status })),
                  error: null,
                }),
              }),
            };
          }

          if (cols === 'total') {
            return {
              eq: (_col: string, userId: string) => ({
                eq: (_c2: string, status: string) => ({
                  not: () => ({
                    data: state.orders
                      .filter((o) => o.user_id === userId && o.status === status && o.total !== null)
                      .map((o) => ({ total: o.total })),
                    error: null,
                  }),
                }),
              }),
            };
          }

          if (cols === 'created_at') {
            return {
              eq: (_c: string, userId: string) => ({
                order: () => ({
                  limit: () => ({
                    single: async () => {
                      const last = [...state.orders].filter((o) => o.user_id === userId).sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
                      return { data: last ?? null, error: null };
                    },
                  }),
                }),
              }),
            };
          }

          return {
            eq: (_col: string, userId: string) => ({
              eq: (_col2: string, status: string) => ({
                not: () => ({
                  data: state.orders.filter((o) => o.user_id === userId && o.status === status && o.total !== null),
                  error: null,
                }),
              }),
              order: () => ({
                limit: () => ({
                  single: async () => {
                    const last = state.orders.find((o) => o.user_id === userId) ?? null;
                    return { data: last, error: null };
                  },
                }),
              }),
            }),
          };
        },
        update: (payload: Record<string, unknown>) => ({
          eq: (_col: string, orderId: string) => ({
            select: () => ({
              single: async () => {
                const idx = state.orders.findIndex((o) => o.id === orderId);
                if (idx >= 0) {
                  state.orders[idx] = { ...state.orders[idx], ...payload } as typeof state.orders[0];
                }
                const row = state.orders[idx];
                return {
                  data: {
                    ...row,
                    user: state.users.find((u) => u.id === row.user_id) ?? null,
                  },
                  error: idx >= 0 ? null : new Error('not found'),
                };
              },
            }),
          }),
        }),
      } as unknown;
    }

    if (table === 'professionals') {
      return {
        select: (_cols?: string, opts?: Record<string, unknown>) => {
          if (opts?.count === 'exact' && opts?.head) {
            return { count: state.professionals.length, error: null } as unknown;
          }
          return { data: state.professionals, error: null } as unknown;
        },
      } as unknown;
    }

    if (table === 'reviews') {
      return {
        select: () => ({ data: state.reviews, error: null }),
      } as unknown;
    }

    return {} as unknown;
  }),
};

jest.mock('@/lib/supabaseServer', () => ({
  getSupabaseServer: async () => supabaseMock,
}));

describe('Scenario 9: Admin new endpoints and flows', () => {
  beforeEach(() => {
    state.role = 'ADMIN';
  });

  it('9.A allows admin to list available tukang with rating and availability', async () => {
    const res = await getAvailableTukang();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(Array.isArray(json)).toBe(true);
    expect(json[0].id).toBe('33333333-3333-4333-8333-333333333333');
    expect(json[0].rating).toBeCloseTo(4.5);
    expect(json[0].isAvailable).toBe(true);
    expect(json[0].specialization).toContain('AC');
  });

  it('9.B blocks non-admin from available tukang endpoint', async () => {
    state.role = 'CUSTOMER';
    const res = await getAvailableTukang();
    expect(res.status).toBe(403);
  });

  it('9.C returns aggregated admin stats', async () => {
    const res = await getStats();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.totalOrders).toBe(state.orders.length);
    expect(json.activeUsers).toBe(2);
    expect(json.revenue).toBe(200000);
    expect(json.activeTukang).toBe(state.professionals.length);
  });

  it('9.D auto-assigns tukang and advances status to PROCESSING', async () => {
    const res = await patchOrder(new Request('http://localhost', {
      method: 'PATCH',
      body: JSON.stringify({
        id: '11111111-1111-4111-8111-111111111111',
        tukangId: '33333333-3333-4333-8333-333333333333',
      }),
    }));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.tukangId).toBe('33333333-3333-4333-8333-333333333333');
    expect(json.status).toBe('PROCESSING');
  });

  it('9.E returns admin users list with suspension status labels', async () => {
    const res = await getUsers();
    const json = await res.json();

    expect(res.status).toBe(200);
    const activeUser = json.find((u: { name: string }) => u.name === 'Alice Customer');
    const suspendedUser = json.find((u: { name: string }) => u.name === 'Bob Customer');
    expect(activeUser.status).toBe('Active');
    expect(suspendedUser.status).toBe('Suspended');
  });

  it('9.F returns tukang list with earnings and ratings', async () => {
    const res = await getTukang();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json[0].id).toBe('33333333-3333-4333-8333-333333333333');
    expect(json[0].rating).toBeCloseTo(4.5);
    expect(typeof json[0].earnings).toBe('string');
  });
});
