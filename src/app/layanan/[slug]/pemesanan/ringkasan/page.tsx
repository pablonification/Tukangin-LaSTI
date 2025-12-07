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

  const { form, setForm } = useFormStore();

  useEffect(() => {
    const ensureService = async () => {
      if (form.slug === slug && form.serviceName) return;

      const res = await fetch(`/api/services?slug=${slug}`);
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
    };

    ensureService();
  }, [form.serviceName, form.slug, router, setForm, slug]);

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
            <div className='text-b3m text-black'>
              {form.priceMin
                ? form.isFixed || form.priceMin === form.priceMax
                  ? `Rp ${form.priceMin.toLocaleString('id-ID')}`
                  : `Rp ${form.priceMin.toLocaleString('id-ID')} – Rp ${
                      form.priceMax?.toLocaleString('id-ID') ?? ''
                    }`
                : '± Rp -'}
            </div>
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
            {(() => {
              const basePrice = Math.abs(Number(form.priceMin)) || 0;
              const maxPrice = Math.abs(Number(form.priceMax)) || basePrice;
              const discountValue = Math.abs(Number(form.voucherDiscount)) || 0;
              const rawType = (form.voucherType || '').toUpperCase();
              const isFlat = rawType === 'FLAT' || (rawType !== 'PERCENT' && discountValue > 100);
              const percentValue = Math.min(discountValue, 100);
              const maxDiscountCap =
                form.voucherMaxDiscount != null ? Math.abs(Number(form.voucherMaxDiscount)) : null;
              const calcDiscount = (price: number) => {
                if (!discountValue) return 0;
                const raw = isFlat ? discountValue : (percentValue * price) / 100;
                const capped = maxDiscountCap != null ? Math.min(raw, maxDiscountCap) : raw;
                return Math.min(capped, price);
              };
              const discountMin = calcDiscount(basePrice);
              const discountMax = calcDiscount(maxPrice);
              const discountedMin = basePrice - discountMin;
              const discountedMax = maxPrice - discountMax;

              console.log('💰 Ringkasan Debug:', {
                basePrice,
                maxPrice,
                discountValue,
                rawType,
                isFlat,
                maxDiscountCap,
                discountMin,
                discountMax
              });

              return (
                <>
                  <PriceRow
                    label='Harga'
                    value={
                      basePrice === maxPrice
                        ? `Rp ${basePrice.toLocaleString('id-ID')}`
                        : `Rp ${basePrice.toLocaleString('id-ID')} – Rp ${maxPrice.toLocaleString('id-ID')}`
                    }
                  />
                  {discountValue > 0 && (
                    <PriceRow
                      label={`Diskon Voucher${form.voucherName ? ` (${form.voucherName})` : ''}`}
                      value={`- ${isFlat ? `Rp ${discountMin.toLocaleString('id-ID')}` : `${discountValue}% (Rp ${discountMin.toLocaleString('id-ID')})`}${
                        discountedMax !== discountedMin && isFlat
                          ? ` – Rp ${discountMax.toLocaleString('id-ID')}`
                          : discountedMax !== discountedMin && !isFlat
                          ? ` – Rp ${discountMax.toLocaleString('id-ID')}`
                          : ''
                      }`}
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
        const basePrice = Math.abs(Number(form.priceMin)) || 0;
        const maxPrice = Math.abs(Number(form.priceMax)) || basePrice;
        const discountValue = Math.abs(Number(form.voucherDiscount)) || 0;
        const rawType = (form.voucherType || '').toUpperCase();
        const isFlat = rawType === 'FLAT' || (rawType !== 'PERCENT' && discountValue > 100);
        const percentValue = Math.min(discountValue, 100);
        const maxDiscountCap =
          form.voucherMaxDiscount != null ? Math.abs(Number(form.voucherMaxDiscount)) : null;
        const calcDiscount = (price: number) => {
          if (!discountValue) return 0;
          const raw = isFlat ? discountValue : (percentValue * price) / 100;
          const capped = maxDiscountCap != null ? Math.min(raw, maxDiscountCap) : raw;
          return Math.min(capped, price);
        };
        const totalMin = basePrice - calcDiscount(basePrice);
        const totalMax = maxPrice - calcDiscount(maxPrice);
        
        console.log('💵 Total Debug:', {
          basePrice,
          discountValue,
          isFlat,
          totalMin,
          totalMax
        });
        const totalText =
          totalMin === totalMax
            ? `Rp ${totalMin.toLocaleString('id-ID')}`
            : `Rp ${totalMin.toLocaleString('id-ID')} – Rp ${totalMax.toLocaleString('id-ID')}`;
        return <CallFooter totalText={totalText} />;
      })()}
    </BaseCanvas>
  );
}
