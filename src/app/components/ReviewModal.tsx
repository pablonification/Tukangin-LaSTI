"use client";

import { useState } from "react";
import Image from "next/image";
import Modal from "./Modal";
import Button from "./Button";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  professionalId?: string;
  onSubmitted?: () => void;
}

export const ReviewModal = ({ isOpen, onClose, orderId, professionalId, onSubmitted }: ReviewModalProps) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!professionalId) {
      setError("Professional belum tersedia.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, professionalId, rating, comment }),
      });

      if (!res.ok) {
        const msg = (await res.json().catch(() => ({} as never)))?.error;
        setError(msg || "Gagal mengirim ulasan.");
        return;
      }

      onSubmitted?.();
      onClose();
    } catch (e) {
      console.error(e);
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nilai Layanan">
      <div className="flex flex-col items-center space-y-6 py-2">
        <p className="text-center text-b2 text-[#7D7D7D]">
          Bagaimana hasil pekerjaan mitra kami?
        </p>

        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              className="focus:outline-none transition-transform hover:scale-110"
              aria-label={`Beri nilai ${star}`}
            >
              <Image
                src="/star.svg"
                width={40}
                height={40}
                alt={`${star} star`}
                className={star <= rating ? "" : "opacity-30"}
              />
            </button>
          ))}
        </div>

        <textarea
          className="w-full border rounded-xl p-3 text-b3"
          placeholder="Tulis ulasan Anda..."
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        {error ? <div className="text-sm text-red-600 w-full text-center">{error}</div> : null}

        <Button onClick={handleSubmit} disabled={rating === 0 || submitting} className="w-full">
          {submitting ? "Mengirim..." : "Kirim Ulasan"}
        </Button>
      </div>
    </Modal>
  );
};
