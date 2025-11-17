import Image from "next/image";
import Link from "next/link";
import { BottomNav } from "../components/BottomNav";
import { BaseCanvas } from "../components/BaseCanvas";

const Page = async () => {
  return (
    <BaseCanvas withBottomNav={true} centerContent={false} padding="px-0">
      <div className="w-full bg-white overflow-x-hidden">
        {/* Top block (gradient) */}
        <section
          className="relative px-6 pt-8 pb-24 bg-[#0082C9]"
        >
          {/* Header */}
          <div className="flex items-center justify-end">
            <button
              aria-label="Notifikasi"
              className="h-10 w-10 rounded-2xl text-white grid place-items-center"
            >
              <Image src="/inbox.svg" alt="Notifikasi" width={40} height={40} />
            </button>
          </div>

          {/* Promotional Banner text */}
          <div className="mt-10 grid place-items-center">
            <div className="text-h1 text-white text-center">#DiTukanginAja</div>
          </div>

          {/* Search bar overlapping */}
          <div className="absolute left-6 right-6 -bottom-8">
            <div className="mx-auto w-full max-w-full">
              <div className="rounded-3xl border border-gray-300 bg-white px-4 py-4 flex items-center gap-2 shadow-sm">
                <Image src="/search.svg" alt="Search" width={24} height={24} />
                <input className="flex-1 outline-none text-b1 text-gray-700 placeholder-gray-400" placeholder="Servis keran..." />
              </div>
            </div>
          </div>
        </section>

        {/* Spacer to account for absolute search bar */}
        <div className="h-10" />

        {/* Quick categories */}
        <div className="mt-2 px-6 grid grid-cols-4 gap-6 text-center">
          {[
            { label: "Perpipaan" },
            { label: "Kelistrikan" },
            { label: "Layanan\nUmum" },
            { label: "Lihat Semua" },
          ].map((item, idx) => (
            <Link href="/layanan" key={idx} className="flex flex-col items-center">
              <Image
                src={
                  item.label === "Perpipaan"
                    ? "/perpipaan.svg"
                    : item.label === "Kelistrikan"
                    ? "/kelistrikan.svg"
                    : item.label.replace(/\n/g, "") === "LayananUmum"
                    ? "/layanan-umum.svg"
                    : item.label.replace(/\n/g, "") === "LihatSemua"
                    ? "/lihat-semua.svg"
                    : "/lihat-semua.svg"
                }
                alt={item.label.replace(/\n/g, " ")}
                width={44}
                height={44}
                className="mx-auto"
                priority={item.label === "Perpipaan"}
              />
              <div className="mt-2 text-b3 whitespace-pre-line">{item.label}</div>
            </Link>
          ))}
        </div>

        {/* Help card */}
        <div className="mt-6 px-6">
          <div className="rounded-2xl bg-[#0082C9] text-[#E9F4F5] p-5">
            <div className="text-b2b">Bingung pilih layanan yang mana?</div>
            <p className="text-b3m mt-1 opacity-90">
              Ceritakan kendalamu, kami akan bantu mencari layanan yang pas!
            </p>
            <Link
              href="/tanya/suara"
              className="mt-4 inline-flex rounded-full bg-[#F5F9FC] text-[#141414] text-b3m px-4 py-2"
            >
              Tanya Kami
            </Link>
          </div>
        </div>

        {/* Recent calls */}
        <div className="mt-6 pb-6">
          <div className="text-sh3 text-[#141414] mb-3 px-6">Panggilan Terakhirmu</div>
          <div className="overflow-x-auto no-scrollbar">
            <div className="px-6">
              <div className="flex gap-4" style={{ minWidth: "100%" }}>
                {Array.from({ length: 5 }).map((_, idx) => (
                  <div key={idx} className="w-48 shrink-0 rounded-2xl border border-[#D4D4D4] bg-white">
                    <div className="h-28 w-full rounded-t-2xl bg-[#9E9E9E]" />
                    <div className="p-4">
                      <div className="text-b2m text-[#141414]">Penggantian Stop Kontak & Saklar</div>
                      <div className="text-b3 text-[#7D7D7D] mt-1">17 Agu, 23:59 PM</div>
                      <button className="mt-3 w-full rounded-full bg-[#0082C9] text-[#FAFAFA] text-b3m py-2">
                        Pesan Lagi
                      </button>
                    </div>
                  </div>
                ))}
                {/* trailing spacer so when scrolled to the end there's padding */}
                <div className="w-3 flex-shrink-0" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <BottomNav active="home" />
    </BaseCanvas>
  );
};

export default Page;


