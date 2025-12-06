import { POST as uploadFile } from '@/app/api/upload/route';

jest.mock('fs', () => ({
  existsSync: jest.fn(() => true),
}));

jest.mock('fs/promises', () => ({
  mkdir: jest.fn(async () => {}),
  writeFile: jest.fn(async () => {}),
}));

const state: { user: { id: string; role: string } | null } = {
  user: { id: 'user-1', role: 'CUSTOMER' },
};

const supabaseMock = {
  auth: {
    getUser: jest.fn(async () => ({ data: { user: state.user }, error: null })),
  },
};

jest.mock('@/lib/supabaseServer', () => ({
  getSupabaseServer: async () => supabaseMock,
}));

const buildUploadReq = (file: File | null) => {
  const formData = new FormData();
  if (file) formData.append('file', file);
  return new Request('http://localhost/api/upload', { method: 'POST', body: formData });
};

describe('Scenario 3: Eksekusi Pekerjaan (Execution Logic)', () => {
  beforeEach(() => {
    state.user = { id: 'user-1', role: 'CUSTOMER' };
    jest.clearAllMocks();
  });

  it('3.A - Upload Bukti Awal: uploads file and returns URL', async () => {
    const file = new File([Buffer.from('hello')], 'test.jpg', { type: 'image/jpeg' });
    const res = await uploadFile(buildUploadReq(file));
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.url).toMatch(/uploads/);
  });

  it('3.B - Edge case: missing file returns 400', async () => {
    const res = await uploadFile(buildUploadReq(null));
    expect(res.status).toBe(400);
  });
});
