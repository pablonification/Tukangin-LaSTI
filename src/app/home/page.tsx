"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { BottomNav } from "../components/BottomNav";
import { BaseCanvas } from "../components/BaseCanvas";
import { services, ServiceItem } from "@/lib/data";

const quickCategories = [
  { label: "Perpipaan", category: "Perpipaan" },
  { label: "Kelistrikan", category: "Kelistrikan" },
  { label: "Layanan\nUmum", category: "Layanan Umum & Pemasangan" },
  { label: "Lihat Semua", category: undefined },
];

type RecentOrder = {
  id: string;
  service: string;
  created_at?: string | null;
  status?: string | null;
  total?: number | null;
};

interface OrderApiResponse {
  id: string;
  service: string;
  created_at: string;
  status: string;
  total?: number;
}

const Page = () => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const getServiceMeta = useCallback((key: string) => {
    const svc = services.find((s: ServiceItem) => s.slug === key || s.name === key);
    const slug = svc?.slug || key
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const name = svc?.name || key;
    return { name, slug };
  }, []);

  useEffect(() => {
    const url = new URL(window.location.href);
    const q = url.searchParams.get("search");
    if (q) setSearch(q);
  }, []);

  useEffect(() => {
    const loadOrders = async () => {
      setLoadingOrders(true);
      try {
        const res = await fetch("/api/order", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const normalized: RecentOrder[] = Array.isArray(data)
          ? data.slice(0, 5).map((o: OrderApiResponse) => ({
              id: o.id,
              service: o.service,
              created_at: o.created_at,
              status: o.status,
              total: o.total,
            }))
          : [];
        setRecentOrders(normalized);
      } catch (err) {
        console.error("Failed to load recent orders", err);
        setRecentOrders([]);
      } finally {
        setLoadingOrders(false);
      }
    };

    loadOrders();
  }, []);

  const formatDate = useCallback((iso?: string | null) => {
    if (!iso) return "-";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "-";
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    router.push(`/layanan${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const handleCategoryClick = (category?: string) => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    router.push(`/layanan${params.toString() ? `?${params.toString()}` : ""}`);
  };

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
              <form
                onSubmit={handleSubmit}
                className="rounded-3xl border border-gray-300 bg-white px-4 py-4 flex items-center gap-2 shadow-sm"
              >
                <Image src="/search.svg" alt="Search" width={24} height={24} />
                <input
                  className="flex-1 outline-none text-b1 text-gray-700 placeholder-gray-400"
                  placeholder="Cari layanan atau masalah..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <button
                  type="submit"
                  className="text-b3 text-[#0082C9] font-semibold"
                  aria-label="Cari layanan"
                >
                  Cari
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* Spacer to account for absolute search bar */}
        <div className="h-10" />

        {/* Quick categories */}
        <div className="mt-2 px-6 grid grid-cols-4 gap-6 text-center">
          {quickCategories.map((item, idx) => (
            <button
              type="button"
              key={idx}
              onClick={() => handleCategoryClick(item.category)}
              className="flex flex-col items-center"
            >
              <Image
                src={
                  item.label.startsWith("Perpipaan")
                    ? "/perpipaan.svg"
                    : item.label.startsWith("Kelistrikan")
                    ? "/kelistrikan.svg"
                    : item.label.startsWith("Layanan")
                    ? "/layanan-umum.svg"
                    : "/lihat-semua.svg"
                }
                alt={item.label.replace(/\n/g, " ")}
                width={44}
                height={44}
                className="mx-auto"
                priority={item.label === "Perpipaan"}
              />
              <div className="mt-2 text-b3 whitespace-pre-line">{item.label}</div>
            </button>
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
              {loadingOrders ? (
                <div className="text-b3 text-[#7D7D7D] py-4">Memuat riwayat...</div>
              ) : recentOrders.length === 0 ? (
                <div className="text-b3 text-[#7D7D7D] py-4">Belum ada panggilan yang bisa ditampilkan.</div>
              ) : (
                <div className="flex gap-4" style={{ minWidth: "100%" }}>
                  {recentOrders.map((order) => {
                    const { name, slug } = getServiceMeta(order.service);
                    const href = slug ? `/layanan/${slug}/pemesanan` : "/layanan";
                    return (
                      <div key={order.id} className="w-48 shrink-0 rounded-2xl border border-[#D4D4D4] bg-white">
                        <div className="h-28 w-full rounded-t-2xl bg-[#9E9E9E]" />
                        <div className="p-4 space-y-1">
                          <div className="text-b2m text-[#141414] line-clamp-2 min-h-[44px]">{name}</div>
                          <div className="text-b3 text-[#7D7D7D]">{formatDate(order.created_at)}</div>
                          <div className="text-b3 text-[#7D7D7D]">{order.status || "-"}</div>
                          <button
                            className="w-full mt-2 rounded-full bg-[#0082C9] text-[#FAFAFA] text-b3m py-2"
                            onClick={() => router.push(href)}
                          >
                            Pesan Lagi
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  <div className="w-3 flex-shrink-0" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <BottomNav active="home" />
    </BaseCanvas>
  );
};

export default Page;


