import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { formatIDR, services } from '../../../lib/data';
import Button from '../../components/Button';
import { BaseCanvas } from '../../components/BaseCanvas';

interface GenerateProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return services.map((service) => ({
    slug: service.slug,
  }));
}

export async function generateMetadata({
  params,
}: GenerateProps): Promise<Metadata> {
  const { slug } = await params;
  const svc = services.find((s) => s.slug === slug);
  return {
    title: svc ? `${svc.name} • Tukangin` : 'Layanan • Tukangin',
    description: svc
      ? svc.description
      : 'Layanan perbaikan dan pemasangan tukang profesional',
  };
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

const Page = async ({ params }: PageProps) => {
  const { slug } = await params;
  const svc = services.find((s) => s.slug === slug);
  if (!svc) {
    notFound();
  }
  return (
    <BaseCanvas centerContent={false} padding='px-0'>
      <div className='w-full min-h-screen flex flex-col'>
        {/* Main content area that grows */}
        <div className='flex-1'>
          {/* Header area */}
          <div className='relative pt-6 -mt-6 pb-6 px-0'>
            <Image
              src={`/${svc.slug}-banner.svg`}
              alt={svc.name}
              width={393}
              height={240}
              className='w-full h-full object-cover rounded-b-4xl'
            />
            {/* Back button overlay */}
            <Link
              href='/layanan'
              aria-label='Kembali'
              className='absolute top-12 left-6 inline-grid place-items-center h-10 w-10 rounded-2xl bg-white/80 z-10'
            >
              <Image
                src='/back-blue.svg'
                alt='Back'
                width={20}
                height={20}
                className='h-5 w-5'
                aria-hidden='true'
              />
            </Link>
          </div>

          {/* Title and price */}
          <section className='px-6'>
            {/* category */}
            <div className='text-b2m text-[#9E9E9E]'>{svc.category}</div>
            <h1 className='text-sh1 text-[#141414]'>{svc.name}</h1>
            <div className='text-sh2 text-[#141414]'>
              {formatIDR(svc.price)}
            </div>
          </section>

          {/* border */}
          {/* <div className='h-[3px] bg-[#EEEEEE] my-4' /> */}

          <section className='px-6 mt-4'>
            <h3 className='text-sh3b text-[#141414]'>Deskripsi</h3>
            <p className='text-b2 text-[#7D7D7D] mt-1'>{svc.description}</p>
          </section>

          {/* border */}
          {/* <div className='h-[3px] bg-[#EEEEEE] my-4' /> */}

          {svc.addOns && (
            <section className='px-6 mt-2'>
              <h3 className='text-sh3b text-[#141414]'>Add-On Opsional</h3>
              <ul className='mt-2 space-y-4'>
                {svc.addOns.map((a) => (
                  <li key={a.name} className='flex items-center gap-3'>
                    <span
                      aria-hidden
                      className='h-10 w-10 grid place-items-center rounded-full bg-[#E8F6FF] text-[#0CA2EB] text-sh2'
                    >
                      +
                    </span>
                    <div className='flex-1'>
                      <div className='text-b2m text-[#141414]'>{a.name}</div>
                      <div className='text-b3 text-[#7D7D7D]'>
                        {formatIDR(a.price)}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <p className='text-b3 text-[#7D7D7D] mt-3'>
                *Termasuk jasa dan transport tukang. Estimasi waktu 30-60 menit
              </p>
            </section>
          )}
        </div>

        {/* CTA Button - sticks to bottom */}
        <div className='sticky bottom-0 bg-white border-t border-white'>
          <div className='px-6 py-6'>
            <Link href={`/layanan/${slug}/pemesanan`}>
              <Button
                variant='custom'
                className='bg-[#E0F1FE] text-[#0082C9] hover:bg-[#E0F1FE]/90 w-full'
              >
                Panggil Tukang
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </BaseCanvas>
  );
};

export default Page;
