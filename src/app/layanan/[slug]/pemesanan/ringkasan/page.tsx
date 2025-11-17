'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { TopBar } from '../../../../components/TopBar';
import { ApplyVoucherRow } from './ApplyVoucherRow';
import { CallFooter } from './CallFooter';
import { useFormStore } from '@/app/store/formStore';
import { use } from 'react';
import { BaseCanvas } from '../../../../components/BaseCanvas';
import { services } from '@/lib/data';

interface InfoRowProps {
  label: string;
  value: string;
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

const InfoRow = ({ label, value }: InfoRowProps) => (
  <div className='mt-4'>
    <div className='text-b3 text-[#3D3D3D]'>{label}</div>
    <div className='text-b2m text-black mt-1'>{value}</div>
  </div>
);

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

export default function Page({ params }: PageProps) {
  const { slug } = use(params);
  const router = useRouter();

  const { form } = useFormStore();
  
  useEffect(() => {
    const svc = services.find((s) => s.slug === slug);
    if (!svc) {
      router.replace('/layanan/not-found');
    }
  }, [slug, router]);

  return (
    <BaseCanvas centerContent={false} padding='px-0'>
      <TopBar
        backHref={`/layanan/${slug}/pemesanan/detail`}
        text='Ringkasan Pesanan'
      />

      <div className='px-6 py-6 space-y-8'>
        {/* Jenis Layanan */}
        <section>
          <h2 className='text-sh3b text-[#141414]'>Jenis Layanan</h2>
          <div className='mt-3 flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='h-12 w-12 rounded-xl bg-[#9E9E9E]' />
              <div className='text-b2m text-[#141414]'>
                {form.serviceName || '—'}
              </div>
            </div>
            <div className='text-b3m text-black'>± Rp 200.000</div>
          </div>
        </section>

        {/* Detil Penerima */}
        <section>
          <h2 className='text-sh3b text-[#141414]'>Detil Penerima</h2>
          <InfoRow label='Nama Penerima' value={form.nama || '—'} />
          <div className='mt-4'>
            <div className='text-b3 text-[#7D7D7D]'>Lokasi</div>
            <div className='flex items-center gap-3 rounded-2xl bg-white py-1'>
              <span className='grid place-items-center h-8 w-8 rounded-full bg-[#EFEFEF]'>
                <Image
                  src='/location-grey.svg'
                  alt='Lokasi'
                  width={16}
                  height={16}
                />
              </span>
              <div className='flex-1 min-w-0'>
                <div className='text-b2m text-[#141414] truncate'>
                  {form.locationName || '—'}
                </div>
                <div className='text-b3 text-[#7D7D7D] mt-1 truncate'>
                  {form.locationAddress || '—'}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Deskripsi Permasalahan */}
        <section>
          <h2 className='text-sh3b text-black'>Deskripsi Permasalahan</h2>
          <div className='mt-3 rounded-2xl bg-[#E8F6FF] px-4 py-3 text-b3 text-[#141414]'>
            {form.catatan || '—'}
          </div>
        </section>

        {/* Attachment */}
        <section>
          <h2 className='text-sh3b text-[#141414]'>Attachment</h2>

          <div className='mt-3 grid grid-cols-3 gap-4'>
            {(form.attachments || []).map((src, i) => (
              <div
                key={i}
                className='relative h-[100px] w-[100px] rounded-2xl overflow-hidden'
              >
                <Image
                  src={src}
                  alt={`Attachment ${i}`}
                  fill
                  className='object-cover'
                />
              </div>
            ))}
          </div>
        </section>

        {/* Ringkasan Pembayaran */}
        <section>
          <h2 className='text-sh3b text-[#141414]'>Ringkasan Pembayaran</h2>
          <div className='mt-3 rounded-2xl bg-white py-3'>
            {/* Calculate price and discount from store */}
            {(() => {
              const basePrice = 200000; // Replace with actual price logic if needed
              const discount = form.voucherDiscount || 0;
              return (
                <>
                  <PriceRow
                    label='Harga'
                    value={`± ${basePrice.toLocaleString('id-ID')}`}
                  />
                  {discount > 0 && (
                    <PriceRow
                      label={`Diskon Voucher${form.voucherName ? ` (${form.voucherName})` : ''}`}
                      value={`- ${(discount * basePrice) / 100}`}
                      valueClassName='text-[#13BA19]'
                    />
                  )}
                </>
              );
            })()}
          </div>

          <ApplyVoucherRow />
        </section>
      </div>

      {/* Show total price with voucher discount */}
      {(() => {
        const basePrice = 200000;
        const discount = form.voucherDiscount || 0;
        const total = basePrice - (discount * basePrice) / 100;
        return <CallFooter totalText={`Rp ${total.toLocaleString('id-ID')}`} />;
      })()}
    </BaseCanvas>
  );
}
