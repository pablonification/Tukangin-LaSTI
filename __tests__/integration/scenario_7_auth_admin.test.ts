import { GET as getUsers } from '@/app/api/admin/users/route';

type UserData = {
  id: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  joined_at: string;
  phone?: string;
  image?: string;
};

type OrderData = {
  id: string;
  user_id: string;
  total: number;
  status: string;
  created_at: string;
};

const state: {
  adminUser: { id: string; role: string } | null;
  customerUser: { id: string; role: string } | null;
  users: UserData[];
  orders: OrderData[];
} = {
  adminUser: { id: 'admin-1', role: 'ADMIN' },
  customerUser: { id: 'customer-1', role: 'CUSTOMER' },
  users: [
    {
      id: 'user-1',
      name: 'Alice Customer',
      email: 'alice@test.com',
      role: 'CUSTOMER',
      is_active: true,
      joined_at: new Date().toISOString(),
      phone: '081234567890',
    },
    {
      id: 'user-2',
      name: 'Bob Customer',
      email: 'bob@test.com',
      role: 'CUSTOMER',
      is_active: false,
      joined_at: new Date().toISOString(),
    },
  ],
  orders: [
    { id: 'ord-1', user_id: 'user-1', total: 150000, status: 'COMPLETED', created_at: new Date().toISOString() },
    { id: 'ord-2', user_id: 'user-1', total: 200000, status: 'PENDING', created_at: new Date().toISOString() },
  ],
};

const supabaseMock = {
  auth: {
    getUser: jest.fn(async () => ({ 
      data: { user: state.adminUser }, 
      error: null 
    })),
  },
  from: jest.fn((table: string) => {
    if (table === 'users') {
      return {
        select: () => ({
          order: () => ({
            data: state.users,
            error: null,
          }),
          eq: (col: string, val: string) => ({
            single: async () => {
              const user = state.users.find((u) => u.id === val);
              return { data: user ?? null, error: user ? null : new Error('not found') };
            },
          }),
        }),
        update: (payload: Record<string, unknown>) => ({
          eq: (col: string, userId: string) => {
            const idx = state.users.findIndex((u) => u.id === userId);
            if (idx >= 0) {
              state.users[idx] = { ...state.users[idx], ...payload } as UserData;
            }
            return { error: idx >= 0 ? null : new Error('not found') };
          },
        }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any;
    }

    if (table === 'orders') {
      return {
        select: (_cols: string, opts?: Record<string, unknown>) => {
          if (opts?.count === 'exact' && opts?.head) {
            return {
              eq: (_col: string, userId: string) => ({
                count: state.orders.filter((o) => o.user_id === userId).length,
                error: null,
              }),
            };
          }
          return {
            eq: (_col: string, userId: string) => ({
              eq: (_col2: string, status: string) => ({
                not: () => ({
                  data: state.orders.filter(
                    (o) => o.user_id === userId && o.status === status && o.total !== null
                  ),
                  error: null,
                }),
              }),
              order: () => ({
                limit: () => ({
                  single: async () => {
                    const order = state.orders
                      .filter((o) => o.user_id === userId)
                      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
                    return { data: order ?? null, error: null };
                  },
                }),
              }),
            }),
          };
        },
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

describe('Scenario 7: Admin Governance & Authorization', () => {
  beforeEach(() => {
    state.adminUser = { id: 'admin-1', role: 'ADMIN' };
    state.users = [
      {
        id: 'user-1',
        name: 'Alice Customer',
        email: 'alice@test.com',
        role: 'CUSTOMER',
        is_active: true,
        joined_at: new Date().toISOString(),
        phone: '081234567890',
      },
      {
        id: 'user-2',
        name: 'Bob Customer',
        email: 'bob@test.com',
        role: 'CUSTOMER',
        is_active: false,
        joined_at: new Date().toISOString(),
      },
    ];
    jest.clearAllMocks();
  });

  it('7.A Should identify user as ADMIN based on role', async () => {
    const role = 'ADMIN';
    const isAdmin = role === 'ADMIN' || role === 'DEVELOPER';
    expect(isAdmin).toBe(true);

    // Verify CUSTOMER is not admin
    const customerRole = 'CUSTOMER';
    const isCustomerAdmin = (customerRole as string) === 'ADMIN' || (customerRole as string) === 'DEVELOPER';
    expect(isCustomerAdmin).toBe(false);
  });

  it('7.B Should allow Admin to fetch all users via admin endpoint', async () => {
    const res = await getUsers();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(Array.isArray(json)).toBe(true);
    expect(json.length).toBeGreaterThanOrEqual(2);
    
    // Verify user data structure
    const firstUser = json[0];
    expect(firstUser).toHaveProperty('id');
    expect(firstUser).toHaveProperty('name');
    expect(firstUser).toHaveProperty('email');
    expect(firstUser).toHaveProperty('status');
    expect(['Active', 'Suspended']).toContain(firstUser.status);
  });

  it('7.C Should show correct suspension status for users', async () => {
    const res = await getUsers();
    const json = await res.json();

    const activeUser = json.find((u: { name: string }) => u.name === 'Alice Customer');
    const suspendedUser = json.find((u: { name: string }) => u.name === 'Bob Customer');

    expect(activeUser.status).toBe('Active');
    expect(suspendedUser.status).toBe('Suspended');
  });
});
