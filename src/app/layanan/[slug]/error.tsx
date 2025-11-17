'use client';

import Link from 'next/link';
import { BaseCanvas } from '../../components/BaseCanvas';
import Button from '../../components/Button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <BaseCanvas centerContent={true} padding="px-6">
      <div className="text-center space-y-6">
        {/* Error Icon */}
        <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>

        {/* Error Title */}
        <div className="space-y-2">
          <h1 className="text-sh1 text-gray-900">Terjadi Kesalahan</h1>
          <p className="text-b2 text-gray-600">
            Maaf, terjadi kesalahan saat memuat halaman layanan.
          </p>
        </div>

        {/* Error Details (in development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-gray-100 rounded-lg p-4 text-left">
            <p className="text-b3 text-gray-700 font-mono">
              {error.message}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={reset}
            variant="custom"
            className="bg-[#0082C9] text-white hover:bg-[#0082C9]/90 w-full"
          >
            Coba Lagi
          </Button>

          <Link href="/layanan">
            <Button
              variant="custom"
              className="bg-white text-[#0082C9] border border-[#0082C9] hover:bg-[#0082C9]/10 w-full"
            >
              Kembali ke Layanan
            </Button>
          </Link>
        </div>
      </div>
    </BaseCanvas>
  );
}
