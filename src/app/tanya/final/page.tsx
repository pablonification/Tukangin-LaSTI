import Button from '../../components/Button';
import Image from 'next/image';
import Link from 'next/link';
import { TopBar } from '../../components/TopBar';
import { BaseCanvas } from '../../components/BaseCanvas';

const TanyaFinalPage = () => {
  return (
    <BaseCanvas centerContent={false} padding="px-0">
      <div className='w-full min-h-screen flex flex-col'>
        <div className='flex-1'>
          <TopBar backHref='/tanya' text='Rekomendasi Kami' iconSrc='/close.svg' />

          <div className='px-6 py-6 bg-white'>
            <p className='text-b2 text-[#141414] mb-6 leading-relaxed'>
              Berdasarkan cerita Anda, ini adalah layanan yang paling tepat untuk menyelesaikan masalah tersebut.
            </p>

            <div className='relative rounded-2xl border border-[#E9ECEF] bg-white p-4 mb-4'>
              <div className='flex items-start gap-4'>
                <Image src='/pemasangan-lampu.svg' alt='Pemasangan Lampu & Fitting' width={52} height={52} />
                <div className="flex-1">
                  <p className='text-sh3 text-[#141414] font-bold mb-1'>Pemasangan Lampu & Fitting</p>
                  <p className='text-b3 text-[#7D7D7D] mb-4'>Untuk saluran air yang tidak lancar, misal wastafel, toilet, dll</p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                    <div>
                      <span className='text-b3 text-[#7D7D7D]'>Estimasi Harga</span>
                      <p className='text-b2b text-[#141414]'>Rp150.000 - 200.000</p>
                    </div>
                    <Link href='/layanan' className='flex items-center gap-2 bg-[#0CA2EB] px-3 py-2 rounded-full translate-y-2'>
                      <span className='text-b3m text-[#FAFAFA]'>Lihat semua</span>
                      <Image src='/arrow-right2.svg' alt='Arrow' width={16} height={16} />
                    </Link>
                  </div>
            </div>

            <Link href='/tanya/suara' className='inline-flex items-center gap-2 px-4 py-2 bg-[#E3F2FD] text-[#0CA2EB] text-b3 font-medium rounded-full mb-6'>
              <Image src='/reload-blue.svg' alt='Jelaskan ulang' width={16} height={16} className='h-4 w-4' />
              <span>Jelaskan ulang masalah</span>
            </Link>
          </div>
        </div>

        <div className='sticky bottom-0 bg-white border-t border-white'>
          <div className='px-6 py-6'>
            <div className='flex flex-col gap-2'>
              <Link href='/layanan'>
                <Button variant='secondary' size='lg' className='w-full'>
                  Lihat Layanan Lain
                </Button>
              </Link>

              <Link href='/layanan'>
                <Button variant='primary' size='lg' className='w-full'>
                  Pesan Layanan Ini
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </BaseCanvas>
  );
};

export default TanyaFinalPage;