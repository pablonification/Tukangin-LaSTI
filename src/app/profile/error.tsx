'use client'

export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="px-6 py-10">
      <p className="text-b2 text-[#141414] mb-3">Terjadi kesalahan saat memuat profil.</p>
      <button onClick={reset} className="text-[#0082C9]">Coba lagi</button>
    </div>
  );
}


