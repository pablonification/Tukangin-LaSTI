import Link from 'next/link';
import { BaseCanvas } from '../../components/BaseCanvas';
import Button from '../../components/Button';

export default function NotFound() {
  return (
    <BaseCanvas centerContent={true} padding="px-6">
      <div className="text-center space-y-6">
        {/* Not Found Icon */}
        <div className="mx-auto w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-orange-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-.832-5.857-2.209"
            />
          </svg>
        </div>

        {/* Not Found Title */}
        <div className="space-y-2">
          <h1 className="text-sh1 text-gray-900">Layanan Tidak Ditemukan</h1>
          <p className="text-b2 text-gray-600">
            Layanan yang Anda cari tidak tersedia atau sudah dihapus.
          </p>
        </div>

        {/* Suggestions */}
        <div className="bg-gray-50 rounded-lg p-4 text-left">
          <h3 className="text-b2m text-gray-900 mb-2">Mungkin Anda mencari:</h3>
          <ul className="space-y-1 text-b3 text-gray-700">
            <li>• Perbaikan pipa yang mampet</li>
            <li>• Penggantian keran atau shower</li>
            <li>• Perbaikan kloset atau toilet</li>
            <li>• Pemasangan lampu dan fitting</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link href="/layanan">
            <Button
              variant="custom"
              className="bg-[#0082C9] text-white hover:bg-[#0082C9]/90 w-full"
            >
              Lihat Semua Layanan
            </Button>
          </Link>

          <Link href="/home">
            <Button
              variant="custom"
              className="bg-white text-[#0082C9] border border-[#0082C9] hover:bg-[#0082C9]/10 w-full"
            >
              Kembali ke Beranda
            </Button>
          </Link>
        </div>
      </div>
    </BaseCanvas>
  );
}
