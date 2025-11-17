'use client';

import { TopBar } from '../../components/TopBar';
import Button from '../../components/Button';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BaseCanvas } from '../../components/BaseCanvas';

const TanyaTextPage = () => {
  const [problemText, setProblemText] = useState('');
  const router = useRouter();

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setProblemText(e.target.value);
  };

  const handleSubmit = () => {
    // Double-check disabled state to prevent any edge cases
    if (problemText.trim().length === 0) {
      return; // Don't proceed if no text
    }

    // Store the problem text for the final page to use
    localStorage.setItem('problemText', problemText.trim());
    // Navigate to the final page
    router.push('/tanya/final');
  };

  const isButtonDisabled = problemText.trim().length === 0;

  return (
    <BaseCanvas centerContent={false} padding="px-0">
      <div className='w-full min-h-screen flex flex-col'>
        {/* Main content area that grows */}
        <div className='flex-1'>
          {/* Header with TopBar component */}
          <TopBar backHref='/tanya' text='Jelaskan via Teks' />

          {/* Main content area */}
          <div className='px-6 py-6 bg-white'>
            {/* Title */}
            <h1 className='text-sh1b text-[#141414] mb-2'>Ceritakan Masalahmu</h1>

            {/* Description */}
            <p className='text-b2 text-[#141414] mb-4 leading-relaxed'>
              Deskripsikan masalah secara spesifik. Usahakan untuk menyebutkan
              benda, masalah, dan lokasi.
            </p>

            {/* Text input form */}
            <form className='space-y-6'>
              {/* Text area */}
              <div>
                <textarea
                  name='problem'
                  value={problemText}
                  onChange={handleTextChange}
                  placeholder='Contoh: Keran wastafel di kamar mandi bocor dari kemarin...'
                  className='w-full max-w-full mx-auto h-32 px-4 py-3 border border-[#D4D4D4] rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-[#0082C9] focus:border-transparent text-b2 placeholder:text-b2 text-[#141414] placeholder:text-[#9CA3AF]'
                  required
                />
              </div>
            </form>
          </div>
        </div>

        {/* Submit button - sticks to bottom */}
        <div className='sticky bottom-0 bg-white border-t border-white'>
          <div className='px-6 py-6'>
            <Button
              variant='primary'
              size='lg'
              className={`w-full text-b1m ${
                isButtonDisabled
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
              }`}
              disabled={isButtonDisabled}
              onClick={handleSubmit}
            >
              Kirim Permasalahan
            </Button>
          </div>
        </div>
      </div>
    </BaseCanvas>
  );
};

export default TanyaTextPage;
