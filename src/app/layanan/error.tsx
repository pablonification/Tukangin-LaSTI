'use client'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="p-5">
      <h2 className="text-sh1b">Terjadi kesalahan</h2>
      <p className="text-b1 text-gray-600 mt-2">{error.message}</p>
      <button onClick={() => reset()} className="mt-4 rounded-xl border px-4 py-2">Coba lagi</button>
    </div>
  );
}


