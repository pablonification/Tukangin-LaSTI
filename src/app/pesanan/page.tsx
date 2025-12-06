'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { BottomNav } from '@/app/components/BottomNav';
import { BaseCanvas } from '@/app/components/BaseCanvas';
import Image from 'next/image';
import { services, ServiceItem } from '@/lib/data';

interface OrderItem {
  id: string;
  service: string;
  status: string;
  total: number | null;
  created_at: string;
}

const formatIDR = (v: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(v);

const formatDate = (iso: string | null | undefined) => {
  if (!iso) return '-';
  const date = new Date(iso);
  if (isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

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

const PesananPage = () => {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [tab, setTab] = useState<'active' | 'history'>('active');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const res = await fetch('/api/order');
        if (!res.ok) {
          throw new Error(`HTTP error ${res.status}`);
        }
        const data = await res.json();

        // misal API langsung return orders dari prisma
        setOrders(data);
      } catch (err) {
        console.error('Failed to load orders:', err);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  // pisah aktif dan history (anggap `status === 'Selesai'` = history)
  const activeItems: typeof orders = [];
  const historyItems: typeof orders = [];
  for (const o of orders) {
    if (o.status === 'COMPLETED' || o.status === 'CANCELLED') {
      historyItems.push(o);
    } else {
      activeItems.push(o);
    }
  }
  const items = tab === 'active' ? activeItems : historyItems;

  return (
    <BaseCanvas withBottomNav={true} centerContent={false} padding="px-0">
      <div className='w-full'>
        <header className='pt-6 pb-4 px-6 border-b border-[#D4D4D4]'>
          <h1 className='text-sh2 text-[#141414]'>Pesanan Anda</h1>
        </header>

        <div className='text-b2m mt-4 flex items-center gap-3 px-6 py-2'>
          <button
            className={`px-1 flex flex-col items-center ${tab === 'active' ? 'text-[#0082C9]' : 'text-[#7D7D7D]'}`}
            onClick={() => setTab('active')}
          >
            <span className='leading-none'>Aktif</span>
            {tab === 'active' ? (
              <span
                aria-hidden
                className='mt-2 h-[2px] w-12 rounded-full bg-[#0082C9]'
              />
            ) : (
              <span
                aria-hidden
                className='mt-2 h-[2px] w-12 rounded-full bg-transparent'
              />
            )}
          </button>
          <button
            className={`px-1 flex flex-col items-center ${tab === 'history' ? 'text-[#0082C9]' : 'text-[#7D7D7D]'}`}
            onClick={() => setTab('history')}
          >
            <span className='leading-none'>Riwayat</span>
            {tab === 'history' ? (
              <span
                aria-hidden
                className='mt-2 h-[2px] w-12 rounded-full bg-[#0082C9]'
              />
            ) : (
              <span
                aria-hidden
                className='mt-2 h-[2px] w-12 rounded-full bg-transparent'
              />
            )}
          </button>
        </div>

        {loading ? (
          <div className='px-6 py-6 text-center text-[#7D7D7D]'>Loading...</div>
        ) : items.length === 0 ? (
          <div className='px-6 py-6 text-center text-[#7D7D7D]'>
            Tidak ada pesanan {tab === 'active' ? 'aktif' : 'riwayat'}.
          </div>
        ) : (
          <ul className='px-6 pb-6' role='list'>
            {items.map((item) => (
              <li key={item.id} className='py-3'>
                <div className='text-b3 text-[#7D7D7D] mb-2'>
                  {formatDate(item.created_at)}
                </div>
                <Link
                  href={`/pesanan/${item.id}`}
                  className='flex items-center justify-between'
                >
                  <div className='flex items-center gap-4'>
                    {(() => {
                      const { name, icon } = getServiceMeta(item.service);
                      return (
                        <>
                          <Image
                            src={icon}
                            alt={name}
                            width={48}
                            height={48}
                            className='h-12 w-12 rounded-xl bg-[#E0F1FE] flex-shrink-0'
                          />
                          <div>
                            <div className='text-b2m text-black'>{name}</div>
                            <div className='text-b3 text-[#7D7D7D]'>
                              {item.status}
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                  <div className='text-b2m text-[#7D7D7D]'>
                    {item.total ? formatIDR(item.total) : '-'}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <BottomNav active='pesanan' />
    </BaseCanvas>
  );
};

export default PesananPage;
