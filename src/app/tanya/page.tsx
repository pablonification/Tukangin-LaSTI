import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { BaseCanvas } from '../components/BaseCanvas';

export const metadata: Metadata = {
  title: 'Tanya Kami • Tukangin',
  description: 'Ceritakan masalahmu dan kami akan bantu memilih layanan yang cocok',
};

const TanyaKamiPage = () => {
  return (
    <BaseCanvas centerContent={false} padding="px-0">
      <div className='w-full min-h-screen bg-white'>
        {/* Header area with light gray background */}
        <div className='px-6 pt-6 pb-24 bg-[#E8F6FF]'>
          <Link
            href='/home'
            aria-label='Kembali'
            className='inline-grid place-items-center h-10 w-10 rounded-2xl bg-white/80'
          >
            <Image
              src='/back.svg'
              alt='Back'
              width={20}
              height={20}
              className='h-5 w-5'
              aria-hidden='true'
            />
          </Link>
        </div>

        {/* Main content area with white background */}
        <div className='px-6 py-6 bg-white'>
          {/* Title */}
          <h1 className='text-sh1 text-[#141414] font-bold mb-4'>
            Gak Perlu Ribet Mikir Lagi..
          </h1>

          {/* Description text */}
          <p className='text-b1 text-[#5D5D5D] mb-12'>
            Kami tahu, kadang sulit menentukan layanan apa yang cocok dengan masalah yang kamu hadapi. Ceritakan masalahmu di sini, ditulis atau diucapkan. Kami akan membantumu memilih layanan yang cocok.
          </p>
        </div>

        {/* Action buttons at bottom */}
        <div className='px-6 pb-8 bg-white'>
          <div className='space-y-4'>
            {/* Text input button */}
            <Link
              href='/tanya/teks'
              className='flex items-center justify-center gap-3 w-full max-w-full mx-auto px-6 py-4 bg-[#0082C9] text-white rounded-2xl hover:bg-[#0082C9]/90 transition-colors'
            >
              <Image
                src='/text.svg'
                alt='Text icon'
                width={25}
                height={24}
                className='h-6 w-6'
                aria-hidden='true'
              />
              <span className='text-b1m'>Jelaskan via Teks</span>
            </Link>

            {/* Voice input button */}
            <Link
              href='/tanya/suara'
              className='flex items-center justify-center gap-3 w-full max-w-full mx-auto px-6 py-4 bg-[#0082C9] text-white rounded-2xl hover:bg-[#0082C9]/90 transition-colors'
            >
              <Image
                src='/mic-white2.svg'
                alt='Voice icon'
                width={24}
                height={24}
                className='h-6 w-6'
                aria-hidden='true'
              />
              <span className='text-b1m'>Jelaskan via Suara</span>
            </Link>
          </div>
        </div>
      </div>
    </BaseCanvas>
  );
};

export default TanyaKamiPage;
