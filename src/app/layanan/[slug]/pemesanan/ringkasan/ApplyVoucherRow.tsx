'use client';

import Image from 'next/image';
import { useState } from 'react';
import Button from '../../../../components/Button';
import { useFormStore } from '@/app/store/formStore';

export const ApplyVoucherRow = () => {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const { form, setForm } = useFormStore();

  const applyVoucher = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/voucher/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || 'Terjadi kesalahan');
      } else if (data.valid) {
        setForm({
          voucherCode: code,
          voucherName: data.code || code,
          voucherDiscount: Number(data.discount_value) || 0,
          voucherType: (data.discount_type || 'FLAT').toUpperCase(),
          voucherMaxDiscount: data.max_discount != null ? Number(data.max_discount) : null,
        });
        setOpen(false);
      } else {
        setMessage(`❌ ${data.message}`);
      }
    } catch (err) {
      console.error(err);
      setMessage('Gagal terhubung ke server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='mt-3'>
      <button
        onClick={() => setOpen(true)}
        className='w-full flex items-center justify-between rounded-2xl border border-[#E5E5E5] bg-white px-4 py-3'
      >
        <span className='flex items-center gap-3 text-b2 text-[#7D7D7D]'>
          <Image src='/discount.svg' alt='Voucher' width={16} height={16} />
          {form.voucherName ? form.voucherName : 'Aplikasikan kode vouchermu!'}
        </span>
        <span className='text-b2 text-[#7D7D7D]'>›</span>
      </button>

      {open ? (
        <div className='fixed inset-0 z-50'>
          <div
            className='absolute inset-0 bg-black/40'
            onClick={() => setOpen(false)}
          />
          <div className='absolute left-0 right-0 bottom-0 rounded-t-3xl bg-white p-5 shadow-2xl'>
            <p className='text-sh2b text-black'>
              Terapkan kode voucher Anda di sini!
            </p>
            <div className='mt-4'>
              <label className='block text-b3 text-[#7D7D7D] mb-2'>
                Kode Voucher
              </label>
              <div className='border-b border-[#E5E5E5]'>
                <input
                  type='text'
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder='Masukkan kode Anda'
                  className='w-full h-10 text-sh3 outline-none placeholder-[#9E9E9E]'
                />
              </div>
            </div>
            {message && (
              <div className='mt-3 text-sm text-center text-[#555]'>
                {message}
              </div>
            )}
            <div className='mt-5'>
              <Button
                onClick={applyVoucher}
                disabled={loading || !code}
                variant='custom'
                className='bg-[#0082C9] text-b1m text-white hover:bg-[#0082C9]/90 w-full disabled:opacity-50'
              >
                {loading ? 'Memeriksa...' : 'Terapkan kode'}
              </Button>
            </div>
            <div className='h-2' />
          </div>
        </div>
      ) : null}
    </div>
  );
};
