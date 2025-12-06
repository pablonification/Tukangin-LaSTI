"use client";

import Image from 'next/image';
import Link from 'next/link';
import { use, useEffect, useState } from 'react';
import { TopBar } from '@/app/components/TopBar';
import Button from '@/app/components/Button';
import { BaseCanvas } from '@/app/components/BaseCanvas';
import { services, ServiceItem } from '@/lib/data';
import { PaymentModal } from '@/app/components/PaymentModal';
import { ReviewModal } from '@/app/components/ReviewModal';

interface PageProps {
  params: Promise<{ id: string }>;
}

type OrderSummary = {
  id: string;
  service: string;
  status: string;
  created_at: string;
  subtotal?: number | null;
  discount?: number | null;
  total?: number | null;
  attachments?: string[] | null;
};

type ProfessionalSummary = {
  id: string;
  name: string;
  rating?: number;
  total_jobs?: number;
};

const formatIDR = (v: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(v);

const formatDate = (iso: string) => {
  const date = new Date(iso);
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const PriceRow = ({
  label,
  value,
  valueClassName = '',
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) => (
  <div className='flex items-center justify-between py-1'>
    <span className='text-b3 text-[#7D7D7D]'>{label}</span>
    <span className={`text-b3 ${valueClassName}`}>{value}</span>
  </div>
);

const iconBySlug: Record<string, string> = {
  'pipa-mampet': '/pipa-mampet.svg',
  'ganti-keran': '/penggantian-kran.svg',
  'perbaikan-kloset': '/perbaikan-kloset.svg',
  'ganti-stop-kontak': '/penggantian-stopkontak.svg',
  'pasang-lampu': '/pemasangan-lampu.svg',
  'pasang-rak-dinding': '/pemasangan-rak.svg',
  'perbaikan-engsel': '/perbaikan-engsel.svg',
  'perbaikan-minor-interior': '/perbaikan-minor.svg',
};

const toTitleFromSlug = (value: string) =>
  value
    .split('-')
    .map((s) => (s ? s[0].toUpperCase() + s.slice(1) : s))
    .join(' ');

const getServiceMeta = (key: string) => {
  const svc = services.find((s: ServiceItem) => s.slug === key || s.name === key);
  const slug = svc?.slug ?? key;
  const name = svc?.name ?? toTitleFromSlug(key);
  const icon = iconBySlug[slug] ?? '/layanan-umum.svg';
  return { name, icon };
};

const Page = ({ params }: PageProps) => {
  const { id } = use(params);
  const [order, setOrder] = useState<OrderSummary | null>(null);
  const [professional, setProfessional] = useState<ProfessionalSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPaymentOpen, setPaymentOpen] = useState(false);
  const [isReviewOpen, setReviewOpen] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
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
        console.error('Failed to fetch professional', err);
      }
    };

    fetchOrder();
    fetchProfessional();
  }, [id]);

  const handleComplete = async () => {
    if (!order) return;
    try {
      const res = await fetch(`/api/order/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'COMPLETED' }),
      });
      if (!res.ok) return;
      // Refresh order data to reflect completion and warranty creation
      const refreshed = await fetch(`/api/order/${id}`);
      if (refreshed.ok) {
        const data = await refreshed.json();
        setOrder(data);
      }
    } catch (err) {
      console.error('Failed to complete order', err);
    }
  };

  if (loading) {
    return (
      <BaseCanvas centerContent={true} padding='px-6'>
        <p className='text-center'>Memuat pesanan...</p>
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

  const dpAmount = Math.round((order.total || 0) / 2);

  return (
    <BaseCanvas centerContent={false} padding='px-0'>
      <TopBar backHref='/pesanan' text='Ringkasan Pesanan' />

      <div className='px-6 py-6 space-y-8'>
        {/* Jenis Layanan */}
        <section>
          <h2 className='text-sh3b text-[#141414]'>Jenis Layanan</h2>
          <div className='mt-3 flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              {(() => {
                const { name, icon } = getServiceMeta(order.service);
                return (
                  <>
                    <Image
                      src={icon}
                      alt={name}
                      width={56}
                      height={56}
                      className='h-14 w-14 rounded-xl bg-[#E0F1FE] flex-shrink-0'
                    />
                    <div>
                      <div className='text-b2m text-[#141414]'>{name}</div>
                      <div className='text-b3 text-[#7D7D7D]'>
                        {order.status}
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
            <div className='text-b3 text-[#7D7D7D]'>
              {formatDate(order.created_at)}
            </div>
          </div>

          {/* Lihat detail pesananmu */}
          <Link
            href={`/pesanan/${id}/detail-pesanan`}
            className='mt-4 w-full flex items-center justify-between rounded-2xl bg-white px-1'
          >
            <span className='flex items-center gap-3 text-b2m text-[#141414]'>
              <span className='grid place-items-center h-9 w-9 rounded-full bg-[#E0F1FE]'>
                <Image
                  src='/pesanan-ringkasan.svg'
                  alt=''
                  width={16}
                  height={16}
                />
              </span>
              Lihat detail pesananmu
            </span>
            <Image src='/arrow-right.svg' alt='' width={16} height={16} />
          </Link>
        </section>

        {/* Tukang bertugas → nanti bisa ambil dari relasi user/tukang */}
        <section>
          <h2 className='text-sh3b text-[#141414]'>Tukang Bertugas</h2>
          <div className='mt-3 flex items-start gap-6'>
            <div className='h-14 w-14 rounded-xl bg-[#D9D9D9]' />
            <div className='flex-1 flex flex-col justify-between h-12'>
              <div className='text-sh3 text-[#141414]'>
                {professional?.name || 'Belum ditugaskan'}
              </div>
              <div className='flex items-center gap-2 text-b2 text-[#7D7D7D]'>
                <span>
                  {professional?.total_jobs ? `${professional.total_jobs}+ panggilan` : 'Menunggu penugasan'}
                </span>
                <Image src='/star.svg' alt='' width={16} height={16} />
                <span>{professional?.rating ?? '-'}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Timeline pengerjaan → dummy dulu */}
        <section>
          <h2 className='text-sh3b text-[#141414]'>Detail Pengerjaan</h2>
          <ol className='mt-3 relative pl-7 space-y-6'>
            <div className='absolute left-2.5 top-0 bottom-0 w-0.5 border-l-2 border-dotted border-[#D4D4D4]'></div>
            {[
              'Pengerjaan selesai',
              'Tukang memulai pengerjaan',
              'Tukang sampai di lokasi',
              'Konfirmasi pembayaran',
              'Pengguna membuat panggilan',
            ].map((text, idx) => (
              <li key={idx} className='flex gap-3 items-start'>
                <Image
                  src={idx === 0 ? '/circle-inline.svg' : '/circle.svg'}
                  alt=''
                  width={24}
                  height={24}
                  className='-ml-[29px] mt-2 h-[24px] w-[24px] inline-block z-10'
                />
                <div>
                  <div className='text-b3 text-[#7D7D7D]'>
                    {formatDate(order.created_at)}
                  </div>
                  <div className='text-b2m text-[#141414]'>{text}</div>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Ringkasan Pembayaran */}
        <section>
          <h2 className='text-sh3b text-[#141414]'>Ringkasan Pembayaran</h2>
          <div className='mt-3 rounded-2xl bg-white py-3'>
            <PriceRow
              label='Harga'
              value={formatIDR(order.subtotal ? order.subtotal : order.total || 0)}
              valueClassName='text-[#7D7D7D]'
            />
            <PriceRow
              label='Diskon Voucher'
              value={formatIDR(order.discount ? order.discount : 0)}
              valueClassName='text-[#13BA19]'
            />
            <PriceRow
              label='Total'
              value={formatIDR(order.total ? order.total : 0)}
              valueClassName='text-[#7D7D7D]'
            />
          </div>
        </section>

        {/* DP Action */}
        {order.status === 'PENDING' && (
          <section className='pt-4'>
            <div className='bg-orange-50 p-3 rounded-lg border border-orange-200 mb-3'>
              <p className='text-b3 text-orange-700'>
                Menunggu pembayaran DP untuk mencari tukang.
              </p>
            </div>
            <Button
              variant='primary'
              className='w-full'
              onClick={() => setPaymentOpen(true)}
            >
              Bayar DP ({formatIDR(dpAmount)})
            </Button>
          </section>
        )}

        {/* Completion + Review */}
        {order.status === 'PROCESSING' && (
          <section className='pt-4 flex flex-col gap-2'>
            <Button
              variant='custom'
              className='bg-[#0CA2EB] text-white hover:bg-[#0CA2EB]/90 w-full'
              onClick={handleComplete}
            >
              Tandai Selesai
            </Button>
          </section>
        )}

        {order.status === 'COMPLETED' && (
          <section className='pt-4 flex flex-col gap-2'>
            <Button
              variant='custom'
              className='bg-[#0082C9] text-white hover:bg-[#0082C9]/90 w-full'
              onClick={() => setReviewOpen(true)}
            >
              Beri Ulasan
            </Button>
            <Link href={`/garansi`}>
              <Button
                variant='secondary'
                className='w-full'
              >
                Lihat Garansi
              </Button>
            </Link>
          </section>
        )}

        {/* Order Again Button - regular button in content flow */}
        <section className='pt-4'>
          <Link href={`/pesanan/${id}/pemesanan`}>
            <Button
              variant='custom'
              className='bg-[#0082C9] text-white hover:bg-[#0082C9]/90 w-full'
            >
              Pesan Lagi
            </Button>
          </Link>
        </section>
      </div>

      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setPaymentOpen(false)}
        orderId={id}
        amount={(order.total || 0) / 2}
      />

      <ReviewModal
        isOpen={isReviewOpen}
        onClose={() => setReviewOpen(false)}
        orderId={id}
        professionalId={professional?.id}
        onSubmitted={() => setReviewOpen(false)}
      />
    </BaseCanvas>
  );
};

export default Page;
