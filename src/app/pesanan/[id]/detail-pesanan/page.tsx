import Image from 'next/image';
import { TopBar } from '@/app/components/TopBar';
import { getSupabaseServer } from '@/lib/supabaseServer';
import { BaseCanvas } from '@/app/components/BaseCanvas';

interface PageProps {
  params: Promise<{ id: string }>;
}

const Page = async ({ params }: PageProps) => {
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

  const { id } = await params;
  const { data: order } = await supabase
    .from('orders')
    .select('receiver_name, address, description')
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
  return (
    <BaseCanvas centerContent={false} padding='px-0'>
      <TopBar backHref={`/pesanan/${id}`} text='Detail Pesanan' />

      <div className='px-6 py-6 space-y-8'>
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
                (+62) 8123456789
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
                  Rumah Kost Harum Manis
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
            {[0, 1, 2].map((i) => (
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
            ))}
          </div>
        </section>
      </div>
    </BaseCanvas>
  );
};

export default Page;
