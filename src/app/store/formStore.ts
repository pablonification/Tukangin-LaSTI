'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface FormData {
  nama?: string;
  alamat?: string;
  catatan?: string;
  locationName?: string;
  locationAddress?: string;
  latitude?: string;
  longitude?: string;
  slug?: string;
  serviceId?: string;
  priceMin?: number;
  priceMax?: number;
  isFixed?: boolean;
  category?: string;
  serviceName?: string;
  voucherCode?: string;
  voucherName?: string;
  voucherDiscount?: number;
  voucherType?: string;
  voucherMaxDiscount?: number;
  receiverPhone?: string;
  attachments?: string[];
  // Add more fields as needed for your multi-step form
}

interface FormStore {
  form: FormData;
  setForm: (data: Partial<FormData>) => void;
  resetForm: () => void;
}

export const useFormStore = create<FormStore>()(
  persist(
    (set) => ({
      form: {},
      setForm: (data) =>
        set((state) => ({
          form: { ...state.form, ...data },
        })),
      resetForm: () => set({ form: {} }),
    }),
    {
      name: 'form-storage', // Key for localStorage/sessionStorage
      // Optionally, you can customize storage or versioning here
    },
  ),
);
