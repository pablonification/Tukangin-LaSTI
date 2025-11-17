import type { Metadata } from 'next';
import Button from '../../components/Button';
import RedirectToFinal from './RedirectToFinal';
import { BaseCanvas } from '../../components/BaseCanvas';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Tanya / Loading',
  description: 'Memproses jawaban pengguna',
};

const Page = () => {
  return (
    <BaseCanvas
      centerContent={false}
      padding='px-0'
      className="bg-[url('/bg-loading.png')] bg-cover bg-center"
    >
      <div className='w-full min-h-screen flex flex-col'>
        <div className='flex-1 flex items-center justify-center px-6'>
          <h1 className='text-sh1b text-[#FAFAFA]'>Memproses jawabanmu...</h1>
        </div>

        <div className='sticky bottom-0 w-full'>
          <div className='px-6 pb-8'>
            <div className='mx-auto w-full max-w-xl'>
              <Link href='/tanya'>
                <Button variant='secondary' size='lg' className=''>
                  Kembali
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <RedirectToFinal />
      </div>
    </BaseCanvas>
  );
};

export default Page;
