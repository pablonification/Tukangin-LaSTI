"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Modal from "./Modal";
import Button from "./Button";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  amount: number;
}

export const PaymentModal = ({ isOpen, onClose, orderId, amount }: PaymentModalProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/order/${orderId}/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          payment_method: "GOPAY",
        }),
      });

      if (!res.ok) {
        const msg = (await res.json().catch(() => ({} as never)))?.error;
        setError(msg || "Pembayaran gagal. Coba lagi.");
        return;
      }

      onClose();
      router.refresh();
    } catch (e) {
      console.error(e);
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Pembayaran DP 50%">
      <div className="space-y-4">
        <div className="bg-[#E8F6FF] p-4 rounded-xl flex gap-3 items-start">
          <Image src="/add-info.svg" width={20} height={20} alt="Info" />
          <p className="text-b3 text-[#141414]">
            Sesuai SOP Tukangin, pembayaran DP 50% diperlukan untuk mengonfirmasi pesanan dan mencari mitra.
          </p>
        </div>

        <div className="flex justify-between items-center border-b pb-2">
          <span className="text-b2 text-[#7D7D7D]">Total Tagihan</span>
          <span className="text-b2m text-[#141414]">Rp {(amount * 2).toLocaleString("id-ID")}</span>
        </div>
        <div className="flex justify-between items-center py-2">
          <span className="text-sh3 text-[#141414]">Nominal DP (50%)</span>
          <span className="text-sh3b text-[#0082C9]">Rp {amount.toLocaleString("id-ID")}</span>
        </div>

        {error ? <div className="text-sm text-red-600">{error}</div> : null}

        <Button
          variant="primary"
          onClick={handlePayment}
          disabled={loading}
          className="w-full"
        >
          {loading ? "Memproses..." : "Bayar Sekarang"}
        </Button>
      </div>
    </Modal>
  );
};
