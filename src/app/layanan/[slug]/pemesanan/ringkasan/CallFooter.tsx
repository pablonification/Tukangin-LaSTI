'use client';

import { useState } from 'react';
import Image from 'next/image';
import Button from '../../../../components/Button';
import { StickyActions } from '../../../../components/StickyActions';
import { useFormStore } from '@/app/store/formStore';
import { useRouter } from 'next/navigation';

interface CallFooterProps {
  totalText: string;
  whatsAppHref?: string;
}

export const CallFooter = ({ totalText }: CallFooterProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { form, resetForm } = useFormStore();

  const router = useRouter();

  const handleContinue = async () => {
    setLoading(true);
    try {
      // Prepare order payload
      const payload = {
        receiverName: form.nama || '',
        service: form.slug || '',
        address: form.locationAddress || '',
        description: form.catatan || '',
        voucherCode: form.voucherCode || undefined,
        receiverPhone: form.receiverPhone,
        attachments: form.attachments,
      };

      const res = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        setLoading(false);
        alert('Gagal membuat order, coba lagi.');
        return;
      }

      const order = await res.json();

      // Reset form cache
      resetForm();

      // Redirect ke /home sebelum buka WhatsApp
      router.replace('/home');

      // Compose WhatsApp message (add order ID if needed)
      const pesan = `Halo, saya mau pesan *${form.serviceName}*%0A%0ANama: ${form.nama}%0AAlamat: ${form.locationAddress}%0ACatatan: ${form.catatan}%0A(Order ID: ${order.id})`;
      window.open(`https://wa.me/6285155347701?text=${pesan}`, '_blank');
    } catch (err) {
      setLoading(false);
      console.error(err);
      alert('Terjadi kesalahan, coba lagi.');
    } finally {
      setOpen(false);
      setLoading(false);
    }
  };

  return (
    <>
      <StickyActions className='border-t border-white'>
        <div className='flex items-center justify-between mb-3'>
          <span className='text-sh3 text-black'>Total</span>
          <span className='text-sh3 text-black'>{totalText}</span>
        </div>
        <Button
          variant='custom'
          className='bg-[#0082C9] text-b1m text-white hover:bg-[#0082C9]/90 mb-8'
          onClick={() => setOpen(true)}
          disabled={loading}
        >
          Buat Panggilan
        </Button>
      </StickyActions>

      {open ? (
        <div className='fixed inset-0 z-50'>
          <div
            className='absolute inset-0 bg-black/40'
            onClick={() => setOpen(false)}
          />

          <div className='absolute left-0 right-0 bottom-0 mx-auto w-full max-w-sm rounded-t-3xl bg-white p-5 shadow-2xl'>
            {/* Close */}
            <div className='flex justify-end'>
              <button
                aria-label='Tutup'
                onClick={() => setOpen(false)}
                className='inline-grid place-items-center h-10 w-10 -mr-2'
              >
                <Image
                  src='/close.svg'
                  alt='Tutup'
                  width={24}
                  height={24}
                  className='h-6 w-6'
                />
              </button>
            </div>

            {/* Content */}
            <div className='flex flex-col items-center justify-center text-left px-2'>
              <div className='h-28 w-28 rounded-md bg-[#D9D9D9]' />
              <h3 className='mt-6 text-sh2 text-black text-left w-full'>
                Konfirmasi Pesanan via WhatsApp
              </h3>
              <p className='mt-2 text-b2 text-[#7D7D7D]'>
                Anda akan terhubung dengan Estimator kami di WhatsApp. Cukup
                kirim detail pesanan Anda untuk mendapatkan estimasi harga dan
                kami akan segera membantu panggilan Anda.
              </p>
            </div>

            {/* Actions */}
            <div className='mt-6 space-y-3'>
              <Button
                variant='custom'
                className='w-full text-b1m bg-[#D4D4D4] text-[#141414] hover:bg-[#D4D4D4]'
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Kembali
              </Button>
              <Button
                variant='custom'
                className='w-full bg-[#0082C9] text-b1m text-white hover:bg-[#0082C9]/90'
                onClick={handleContinue}
                disabled={loading}
              >
                {loading ? (
                  'Mengirim...'
                ) : (
                  <span className='inline-flex items-center justify-center gap-2'>
                    <Image src='/wa.svg' alt='WhatsApp' width={24} height={24} />
                    <span>Lanjut ke WhatsApp</span>
                  </span>
                )}
              </Button>
            </div>

            <div className='h-2' />
          </div>
        </div>
      ) : null}
    </>
  );
};
