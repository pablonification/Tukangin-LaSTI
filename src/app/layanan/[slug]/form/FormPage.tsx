'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useNotification } from '@/app/components/NotificationProvider';
import { BaseCanvas } from '../../../components/BaseCanvas';

interface FormPageProps {
  svc: { name: string; slug: string };
}

export default function FormPage({ svc }: FormPageProps) {
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession(); // ambil session
  const { showError } = useNotification();

  return (
    <BaseCanvas centerContent={false} padding="px-6">
      <h1 className='text-sh1 mb-4'>Form Pemesanan {svc.name}</h1>

      <form
        className='space-y-4'
        onSubmit={async (e) => {
          e.preventDefault();
          setLoading(true);

          const formData = new FormData(e.currentTarget);
          const nama = formData.get('nama') as string;
          const alamat = formData.get('alamat') as string;
          const catatan = formData.get('catatan') as string;

          try {
            const res = await fetch('/api/order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                service: svc.slug,
                address: alamat,
                description: catatan,
                userId: session?.user?.id,
              }),
            });

            if (!res.ok) throw new Error('Gagal menyimpan order');
            const order = await res.json();

            const pesan = `Halo, saya mau pesan *${svc.name}*%0A%0ANama: ${nama}%0AAlamat: ${alamat}%0ACatatan: ${catatan}%0A(Order ID: ${order.id})`;
            window.open(`https://wa.me/6285155347701?text=${pesan}`, '_blank');
          } catch (err) {
            console.error(err);
            showError('Pesanan gagal dibuat, coba lagi ya.', 'Order Failed');
          } finally {
            setLoading(false);
          }
        }}
      >
        <input type='hidden' name='service' value={svc.slug} />

        <div>
          <label className='block text-b2 mb-1'>Nama</label>
          <input
            type='text'
            name='nama'
            required
            className='w-full border rounded-xl p-2'
          />
        </div>

        <div>
          <label className='block text-b2 mb-1'>Alamat</label>
          <textarea
            name='alamat'
            required
            className='w-full border rounded-xl p-2'
          ></textarea>
        </div>

        <div>
          <label className='block text-b2 mb-1'>Catatan Tambahan</label>
          <textarea
            name='catatan'
            className='w-full border rounded-xl p-2'
          ></textarea>
        </div>

        <button
          type='submit'
          disabled={loading}
          className='w-full max-w-full mx-auto rounded-2xl bg-black text-white py-3 text-b1m'
        >
          {loading ? 'Mengirim...' : 'Kirim Pesanan'}
        </button>
      </form>
    </BaseCanvas>
  );
}
