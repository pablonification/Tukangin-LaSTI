"use client";

import Link from "next/link";
import { BaseCanvas } from "@/app/components/BaseCanvas";
import Button from "@/app/components/Button";

const ForbiddenPage = () => {
  return (
    <BaseCanvas centerContent padding="px-6">
      <div className="text-center space-y-4">
        <p className="text-[56px] leading-none font-bold text-[#FF4D4F]">403</p>
        <h1 className="text-sh2b text-[#141414]">Akses admin ditolak</h1>
        <p className="text-b2 text-[#7D7D7D]">
          Kamu tidak memiliki izin untuk membuka halaman admin. Jika ini terasa salah,
          hubungi administrator untuk memperbarui peran akunmu.
        </p>
        <div className="flex flex-col gap-3 w-full max-w-xs mx-auto">
          <Link href="/home">
            <Button variant="primary" className="w-full">
              Kembali ke beranda
            </Button>
          </Link>
          <Link href="/pesanan">
            <Button variant="secondary" className="w-full">
              Lihat pesanan saya
            </Button>
          </Link>
        </div>
      </div>
    </BaseCanvas>
  );
};

export default ForbiddenPage;
