export interface ServiceAddOn {
  name: string;
  price: number;
}

export const JOB_CATEGORIES = [
  'Perpipaan',
  'Kelistrikan',
  'AC',
  'Layanan Umum & Pemasangan',
  'Konstruksi',
  'Elektronik',
  'Atap',
  'Cat',
] as const;

export type JobCategory = (typeof JOB_CATEGORIES)[number];

export interface ServiceItem {
  slug: string;
  name: string;
  category: JobCategory;
  price: number;
  description: string;
  addOns?: ServiceAddOn[];
}

export const categories = JOB_CATEGORIES;

export const services: ServiceItem[] = [
  {
    slug: 'pipa-mampet',
    name: 'Pipa Mampet',
    category: 'Perpipaan',
    price: 200000,
    description:
      'Penanganan saluran air yang tersumbat. Estimasi harga untuk pekerjaan ringan-sedang.',
    addOns: [
      { name: 'Lokasi Sulit Dijangkau', price: 50000 },
      { name: 'Alat Vakum Khusus', price: 30000 },
    ],
  },
  {
    slug: 'ganti-keran',
    name: 'Penggantian Keran/Shower',
    category: 'Perpipaan',
    price: 150000,
    description: 'Penggantian keran/shower yang bocor atau rusak.',
  },
  {
    slug: 'perbaikan-kloset',
    name: 'Perbaikan Kloset/Toilet',
    category: 'Perpipaan',
    price: 180000,
    description: 'Perbaikan flush, kebocoran, atau penyetelan kloset.',
  },
  {
    slug: 'ganti-stop-kontak',
    name: 'Penggantian Stop Kontak & Saklar',
    category: 'Kelistrikan',
    price: 120000,
    description: 'Penggantian stop kontak/saklar beserta pengecekan singkat.',
  },
  {
    slug: 'pasang-lampu',
    name: 'Pemasangan Lampu & Fitting',
    category: 'Kelistrikan',
    price: 100000,
    description: 'Pemasangan lampu gantung, downlight, atau fitting baru.',
  },
  {
    slug: 'pasang-rak-dinding',
    name: 'Pemasangan Rak Dinding/Ambalan',
    category: 'Layanan Umum & Pemasangan',
    price: 130000,
    description: 'Pemasangan rak dinding/ambalan dengan fisher dan sekrup.',
  },
  {
    slug: 'perbaikan-engsel',
    name: 'Perbaikan Engsel Pintu/Lemari',
    category: 'Layanan Umum & Pemasangan',
    price: 90000,
    description: 'Penyetelan atau penggantian engsel pintu/lemari.',
  },
  {
    slug: 'perbaikan-minor-interior',
    name: 'Perbaikan Minor Interior',
    category: 'Layanan Umum & Pemasangan',
    price: 100000,
    description: 'Perbaikan minor interior seperti pengecatan dinding, penambalan lubang, dan perbaikan kecil lainnya.',
  },
];

export function formatIDR(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);
}
