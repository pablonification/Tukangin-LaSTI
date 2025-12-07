import { BaseCanvas } from '@/app/components/BaseCanvas';
import { TopBar } from '@/app/components/TopBar';
import { getSupabaseServer } from '@/lib/supabaseServer';

export default async function WarrantyPage() {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <BaseCanvas centerContent padding="px-6">
        <p className="text-center">Silakan login untuk melihat garansi.</p>
      </BaseCanvas>
    );
  }

  type WarrantyRow = {
    id: string;
    status: string;
    valid_until: string;
    terms?: string | null;
    order?: { service?: string } | { service?: string }[] | null;
  };

  const { data: warranties } = await supabase
    .from('Warranties')
    .select(`id, status, valid_until, terms, order:orders(service)`, { count: 'exact' })
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <BaseCanvas padding="px-0">
      <TopBar backHref="/home" text="Garansi Saya" />
      <div className="px-6 py-4 space-y-4">
        {!warranties || warranties.length === 0 ? (
          <div className="text-center text-[#7D7D7D]">Belum ada garansi aktif.</div>
        ) : (
          (warranties as WarrantyRow[]).map((w) => (
            <div
              key={w.id}
              className="bg-white p-4 rounded-2xl border border-[#E5E5E5] shadow-sm"
            >
              {(() => {
                const serviceName = Array.isArray(w.order)
                  ? (w.order[0] as { service?: string } | undefined)?.service
                  : (w.order as { service?: string } | null | undefined)?.service;
                return (
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-sh3b text-[#141414]">{serviceName || 'Layanan'}</h3>
                    <span
                      className={`px-2 py-1 rounded-lg text-xs font-bold ${
                        w.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {w.status}
                    </span>
                  </div>
                );
              })()}
              <p className="text-b3 text-[#7D7D7D]">
                Berlaku sampai: {new Date(w.valid_until as string).toLocaleDateString('id-ID')}
              </p>
              <div className="mt-4 pt-3 border-t border-dashed border-gray-200">
                <p className="text-xs text-gray-500">{w.terms}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </BaseCanvas>
  );
}
