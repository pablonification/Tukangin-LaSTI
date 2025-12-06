import Image from 'next/image';
import { TopBar } from '@/app/components/TopBar';
import Button from '@/app/components/Button';
import Link from 'next/link';
import { getSupabaseServer } from '@/lib/supabaseServer';
import { BaseCanvas } from '@/app/components/BaseCanvas';
import { services, ServiceItem } from '@/lib/data';

interface PageProps {
  params: Promise<{ id: string }>;
}

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

const Page = async ({ params }: PageProps) => {
  const { id } = await params;
  const supabase = await getSupabaseServer();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <BaseCanvas centerContent={true} padding='px-6'>
        <p className='text-center'>Tidak terautentikasi.</p>
      </BaseCanvas>
    );
  }

  const { data: order } = await supabase
    .from('orders')
    .select(`
      *,
      professional:professionals(
        user_id,
        orders:orders(count)
      )
    `)
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!order) {
    return (
      <BaseCanvas centerContent={true} padding='px-6'>
        <p className='text-center'>Pesanan tidak ditemukan.</p>
      </BaseCanvas>
    );
  }

  console.log(order);
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
                {order.professional?.user_id} Anies Baswedan
              </div>
              <div className='flex items-center gap-2 text-b2 text-[#7D7D7D]'>
                <span>{order.professional?.orders?.[0]?.count || 0}200+ panggilan</span>
                <Image src='/star.svg' alt='' width={16} height={16} />
                <span>4.9</span>
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
              value={formatIDR(order.total ? order.total : 0)}
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
    </BaseCanvas>
  );
};

export default Page;
