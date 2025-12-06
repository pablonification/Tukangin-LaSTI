"use client";

import { use, useEffect, useState } from 'react';
import Image from 'next/image';
import { TopBar } from '@/app/components/TopBar';
import { BaseCanvas } from '@/app/components/BaseCanvas';

interface PageProps {
  params: Promise<{ id: string }>;
}

type TrackingData = {
  status: string;
  location: { lat: number; lng: number; heading: number };
  last_update: string;
};

type ProfessionalData = {
  id: string;
  name: string;
  rating: number;
  photo_url: string;
  speciality: string;
};

const Page = ({ params }: PageProps) => {
  const { id } = use(params);
  const [order, setOrder] = useState<any | null>(null);
  const [tracking, setTracking] = useState<TrackingData | null>(null);
  const [professional, setProfessional] = useState<ProfessionalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/order/${id}`);
        const data = await res.json();
        if (!res.ok) {
          setError(data?.error || 'Gagal memuat pesanan');
          return;
        }
        setOrder(data);
      } catch (err) {
        console.error(err);
        setError('Gagal memuat pesanan');
      } finally {
        setLoading(false);
      }
    };

    const fetchProfessional = async () => {
      try {
        const res = await fetch(`/api/order/${id}/professional`);
        const data = await res.json();
        if (data?.success) setProfessional(data.data.mitra);
      } catch (err) {
        console.error(err);
      }
    };

    const fetchTracking = async () => {
      try {
        const res = await fetch(`/api/tracking/${id}`);
        const data = await res.json();
        if (data?.success) setTracking(data.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchOrder();
    fetchProfessional();
    fetchTracking();
    const interval = setInterval(fetchTracking, 5000);
    return () => clearInterval(interval);
  }, [id]);

  if (loading) {
    return (
      <BaseCanvas centerContent={true} padding='px-6'>
        <p className='text-center'>Memuat detail pesanan...</p>
      </BaseCanvas>
    );
  }

  if (error || !order) {
    return (
      <BaseCanvas centerContent={true} padding='px-6'>
        <p className='text-center'>{error || 'Pesanan tidak ditemukan.'}</p>
      </BaseCanvas>
    );
  }

  const attachments: string[] = Array.isArray(order.attachments)
    ? order.attachments
    : [];

  return (
    <BaseCanvas centerContent={false} padding='px-0'>
      <TopBar backHref={`/pesanan/${id}`} text='Detail Pesanan' />

      {/* Tracking / Map */}
      <div className='relative h-[260px] bg-gray-200 w-full'>
        <div className='absolute inset-0 flex items-center justify-center text-gray-600'>
          {tracking ? (
            <div className='text-center'>
              <p>Peta Tracking</p>
              <p>Lat: {tracking.location.lat.toFixed(4)}</p>
              <p>Lng: {tracking.location.lng.toFixed(4)}</p>
              <p className='mt-2 font-bold text-blue-600 animate-pulse'>
                Status: {tracking.status}
              </p>
            </div>
          ) : (
            'Menunggu tracking...'
          )}
        </div>
      </div>

      <div className='px-6 py-6 space-y-8'>
        {/* Mitra info */}
        <section>
          <h2 className='text-sh3b text-[#141414]'>Mitra Ditugaskan</h2>
          <div className='mt-3 flex items-center gap-4'>
            <div className='relative h-14 w-14 rounded-full overflow-hidden bg-[#E5E5E5]'>
              <Image
                src={professional?.photo_url || '/profile.svg'}
                alt={professional?.name || 'Mitra'}
                fill
                className='object-cover'
              />
            </div>
            <div>
              <div className='text-sh3 text-[#141414]'>
                {professional?.name || 'Belum ditugaskan'}
              </div>
              <div className='flex items-center gap-2 text-b3 text-[#7D7D7D]'>
                <Image src='/star.svg' width={14} height={14} alt='rating' />
                <span>
                  {professional?.rating ?? '-'} • {professional?.speciality || '-'}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Detail Penerima */}
        <section>
          <h2 className='text-sh3b text-[#141414]'>Detail Penerima</h2>
          <div className='mt-4'>
            <label className='block text-b3 text-[#3D3D3D] mb-2'>Nama</label>
            <div className='border-b border-[#E5E5E5]'>
              <div className='h-8 text-sh3 text-[#141414] flex items-center'>
                {order.receiver_name}
              </div>
            </div>
          </div>
          <div className='mt-4'>
            <label className='block text-b3 text-[#3D3D3D] mb-2'>
              Nomor Telepon
            </label>
            <div className='border-b border-[#E5E5E5]'>
              <div className='h-8 text-sh3 text-[#141414] flex items-center'>
                {order.receiver_phone || '—'}
              </div>
            </div>
          </div>
          <div className='mt-4'>
            <label className='block text-b3 text-[#3D3D3D] mb-2'>Lokasi</label>
            <div className='flex items-center gap-3'>
              <span className='grid place-items-center h-8 w-8 rounded-full bg-[#EFEFEF]'>
                <Image
                  src='/location-grey.svg'
                  alt='Lokasi'
                  width={16}
                  height={16}
                />
              </span>
              <div>
                <div className='text-b2m text-[#141414]'>
                  {order.address || '—'}
                </div>
                <div className='text-b3 text-[#7D7D7D] mt-1'>
                  {order.address}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Deskripsi Permasalahan */}
        <section>
          <h2 className='text-sh3b text-[#141414]'>Deskripsi Permasalahan</h2>
          <div className='rounded-2xl text-b2 text-[#7D7D7D]'>
            {order.description}
          </div>
        </section>

        {/* Attachment */}
        <section className='pb-6'>
          <h2 className='text-sh3b text-[#141414]'>Attachment</h2>
          <div className='mt-3 grid grid-cols-3 gap-4'>
            {attachments.length === 0
              ? [0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className='h-[100px] rounded-2xl bg-[#D9D9D9] grid place-items-center'
                  >
                    <Image
                      src='/image-grey.svg'
                      alt='Lampiran'
                      width={28}
                      height={28}
                    />
                  </div>
                ))
              : attachments.map((src: string, i: number) => (
                  <div
                    key={i}
                    className='h-[100px] rounded-2xl bg-[#D9D9D9] overflow-hidden relative'
                  >
                    <Image src={src} alt={`Lampiran ${i}`} fill className='object-cover' />
                  </div>
                ))}
          </div>
        </section>
      </div>
    </BaseCanvas>
  );
};

export default Page;
