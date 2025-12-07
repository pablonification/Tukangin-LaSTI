'use client';

import { use, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getSupabaseBrowser } from '@/lib/supabase';
import Image from 'next/image';
import Button from '../../../../components/Button';
import { StickyActions } from '../../../../components/StickyActions';
import { TopBar } from '../../../../components/TopBar';
import { useFormStore } from '@/app/store/formStore';
import { BaseCanvas } from '../../../../components/BaseCanvas';
import { useNotification } from '@/app/components/NotificationProvider';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function Page({ params }: PageProps) {
  const param = use(params);
  const router = useRouter();
  // searchParams is used by Next.js for this dynamic route
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const searchParams = useSearchParams();
  const { form, setForm } = useFormStore();
  const supabase = getSupabaseBrowser();
  const { showError } = useNotification();

  const [nama, setNama] = useState(form.nama || '');
  const [nomor, setNomor] = useState(form.receiverPhone || ''); // Tambahan nomor hp
  const [deskripsi, setDeskripsi] = useState(form.catatan || '');
  const [attachments, setAttachments] = useState<string[]>(
    form.attachments || [],
  );

  const [isReceiver, setIsReceiver] = useState(false);
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');

  // Ambil data user untuk autofill
  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      fetch('/api/users')
        .then((res) => res.json())
        .then((data) => {
          if (data.name) setUserName(data.name);
          if (data.phone) setUserPhone(data.phone.replace(/^\+62/, '')); // simpan format tanpa +62
        });
    };
    loadUser();
  }, [supabase]);

  // Autofill jika checkbox dicentang
  useEffect(() => {
    if (isReceiver && userName) {
      setNama(userName || '');
      setNomor(userPhone || '');
    } else if (!isReceiver) {
      setNama('');
      setNomor('');
    }
  }, [isReceiver, userName, userPhone, form.nama, form.receiverPhone]);

  // Ensure service info exists in store; fallback fetch by slug
  useEffect(() => {
    const ensureService = async () => {
      if (form.slug === param.slug && form.serviceName) return;

      try {
        const res = await fetch(`/api/services?slug=${param.slug}`);
        const json = await res.json();

        if (!res.ok || !json?.success || !json.data?.length) {
          router.replace('/layanan/not-found');
          return;
        }

        const svc = json.data[0];
        setForm({
          serviceId: svc.id,
          serviceName: svc.name,
          slug: svc.slug,
          priceMin: svc.price_min,
          priceMax: svc.price_max,
          isFixed: svc.is_fixed,
          category: svc.category,
        });
      } catch (err) {
        console.error('Failed to load service detail', err);
        router.replace('/layanan/not-found');
      }
    };

    ensureService();
  }, [form.slug, form.serviceName, param.slug, router, setForm]);

  // (No longer needed: location info is set in formStore directly from previous page)

  // Upload file ke /api/upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) setAttachments((prev) => [...prev, data.url]);
      else console.error('Upload error:', data.error);
    } catch (err) {
      console.error('Upload failed', err);
    }
  };

  const handleNext = () => {
    const namaTrimmed = nama.trim();
    const nomorTrimmed = nomor.trim();
    const deskripsiTrimmed = deskripsi.trim();

    if (!namaTrimmed) {
      showError('Nama penerima wajib diisi');
      return;
    }

    if (!nomorTrimmed || nomorTrimmed.length < 10) {
      showError('Nomor telepon tidak valid (min. 10 digit)');
      return;
    }

    if (!deskripsiTrimmed) {
      showError('Deskripsi permasalahan wajib diisi');
      return;
    }

    setForm({
      nama: namaTrimmed,
      receiverPhone: nomorTrimmed,
      catatan: deskripsiTrimmed,
      attachments,
    });
    router.push('./ringkasan');
  };

  return (
    <BaseCanvas centerContent={false} padding='px-0'>
      <TopBar
        backHref={`/layanan/${param.slug}/pemesanan`}
        text='Detail Pesanan'
      />

      <div className='px-6 py-6 space-y-8'>
        {/* Detil Penerima */}
        <section>
          <h2 className='text-b1m text-[#141414]'>Detil Penerima</h2>
          {/* Nama */}
          <div className='mt-4'>
            <label className='block text-b3 text-[#3D3D3D] mb-2'>
              Nama Penerima*
            </label>
            <input
              type='text'
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder='Masukkan nama penerima'
              className='w-full h-10 text-sh3 outline-none placeholder-[#7D7D7D] border-b border-[#E5E5E5]'
            />
          </div>
          {/* Nomor HP */}
          <div className='mt-4'>
            <label className='block text-b3 text-[#3D3D3D] mb-2'>
              Nomor Telepon*
            </label>
            <input
              type='tel'
              value={nomor}
              onChange={(e) => setNomor(e.target.value)}
              placeholder='Masukkan nomor telepon penerima'
              className='w-full h-10 text-sh3 outline-none placeholder-[#7D7D7D] border-b border-[#E5E5E5]'
            />
          </div>
        </section>

        {/* Checkbox Saya adalah penerima */}
        <div className='mt-4'>
          <label className='inline-flex items-center gap-3 cursor-pointer'>
            <input
              id='isReceiver'
              type='checkbox'
              checked={isReceiver}
              onChange={(e) => setIsReceiver(e.target.checked)}
              className='sr-only'
              aria-label='Saya adalah penerima'
            />
            <span
              className={`h-5 w-5 flex-shrink-0 min-w-[20px] min-h-[20px] box-border grid place-items-center transition-colors border border-[#D1D5DB] ${
                isReceiver
                  ? 'bg-[#0082C9] border-transparent rounded-lg'
                  : 'bg-white rounded-lg'
              }`}
            >
              <svg
                className={`transition-transform duration-150 ${isReceiver ? 'scale-100' : 'scale-75 opacity-0'}`}
                width='14'
                height='10'
                viewBox='0 0 14 10'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
                aria-hidden
              >
                <path
                  d='M1 5L5 9L13 1'
                  stroke='white'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            </span>
            <span className='text-b2 text-[#7D7D7D] leading-none'>
              Saya adalah penerima
            </span>
          </label>
        </div>

        {/* Deskripsi Permasalahan */}
        <section>
          <h2 className='text-sh3 text-[#141414]'>Deskripsi Permasalahan*</h2>
          <p className='text-b2 text-[#7D7D7D] mt-2'>
            Ceritakan singkat masalah Anda di sini agar tukang bisa lebih cepat
            mendiagnosis permasalahanmu
          </p>
          <div className='mt-3 rounded-2xl border border-[#D4D4D4] bg-white'>
            <textarea
              rows={4}
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              placeholder='Contoh: Wastafel mampet dan meluber...'
              className='w-full resize-none rounded-2xl px-4 py-3 text-b2 placeholder-[#7D7D7D] outline-none'
            />
          </div>
        </section>

        {/* Attachment */}
        <section>
          <h2 className='text-sh3 text-[#141414]'>Attachment*</h2>
          <p className='text-b2 text-[#7D7D7D] mt-2'>
            Tambahkan gambar penjelas dari permasalahan yang Anda alami
          </p>
          <div className='mt-3 grid grid-cols-3 gap-4'>
            {attachments.map((url, i) => (
              <div
                key={i}
                className='relative h-[100px] rounded-2xl overflow-hidden'
              >
                <Image
                  src={url}
                  alt={`Attachment ${i}`}
                  fill
                  className='object-cover'
                />
              </div>
            ))}

            {/* Tombol upload */}
            <label
              htmlFor='fileInput'
              className='h-[100px] rounded-2xl bg-[#E0E0E0] grid place-items-center cursor-pointer'
            >
              <Image
                src='/image-grey.svg'
                alt='Tambah foto'
                width={28}
                height={28}
              />
            </label>
            <input
              type='file'
              id='fileInput'
              accept='image/*,video/*'
              className='hidden'
              onChange={handleFileUpload}
            />
          </div>
        </section>
      </div>

      <StickyActions className='border-t border-white'>
        <Button
          onClick={handleNext}
          variant='custom'
          className='bg-[#0082C9] text-[#FAFAFA] hover:bg-[#0082C9]/90 mb-8'
        >
          Selanjutnya
        </Button>
      </StickyActions>
    </BaseCanvas>
  );
}
