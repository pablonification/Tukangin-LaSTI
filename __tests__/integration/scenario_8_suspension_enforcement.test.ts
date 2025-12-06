import { createMocks } from 'node-mocks-http';
import { POST as createOrder } from '@/app/api/order/route';
import { POST as processPayment } from '@/app/api/order/[id]/payment/route';
import { POST as submitReview } from '@/app/api/reviews/route';
import { GET as trackOrder } from '@/app/api/tracking/[id]/route';

// Mock Supabase with SUSPENDED User
jest.mock('@/lib/supabaseServer', () => ({
  getSupabaseServer: jest.fn().mockReturnValue({
    auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'suspended-user' } }, error: null }) },
    from: jest.fn().mockImplementation((table) => {
      // Mock Users table returning is_active: false
      if (table === 'users') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ 
            data: { id: 'suspended-user', is_active: false }, // <--- THE TRAP
            error: null 
          })
        };
      }
      return {
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: null })
      };
    })
  })
}));

describe('Scenario 8: Suspension Enforcement', () => {
  
  it('8.A Should BLOCK suspended user from creating orders', async () => {
    const { req } = createMocks({
      method: 'POST',
      body: { 
        service: 'Cuci AC', 
        receiverName: 'Budi', 
        receiverPhone: '08123456789', 
        address: 'Jl. Test', 
        description: 'Test' 
      }
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await createOrder(req as any);
    const json = await res.json();

    expect(res.status).toBe(403);
    expect(json.error).toMatch(/suspended/i);
  });

  it('8.B Should BLOCK suspended user from making payments', async () => {
    const { req } = createMocks({
      method: 'POST',
      body: { amount: 50000, payment_method: 'GOPAY' }
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await processPayment(req as any, { params: Promise.resolve({ id: 'ord-123' }) });
    const json = await res.json();

    expect(res.status).toBe(403);
    expect(json.error).toMatch(/suspended/i);
  });

  it('8.C Should BLOCK suspended user from submitting reviews', async () => {
    const { req } = createMocks({
      method: 'POST',
      body: { 
        orderId: 'ord-123', 
        professionalId: 'mitra-1', 
        rating: 5, 
        comment: 'Good' 
      }
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await submitReview(req as any);
    const json = await res.json();

    expect(res.status).toBe(403);
    expect(json.error).toMatch(/suspended/i);
  });

  it('8.D Should BLOCK suspended user from tracking orders', async () => {
    const { req } = createMocks({ method: 'GET' });
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await trackOrder(req as any, { params: Promise.resolve({ id: 'ord-123' }) });
    const json = await res.json();

    expect(res.status).toBe(403);
    expect(json.error).toMatch(/suspended/i);
  });

});
