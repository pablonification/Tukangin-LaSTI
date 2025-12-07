'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BottomNav } from '../components/BottomNav';
import { categories, services } from '../../lib/data';
import { TopBar } from '../components/TopBar';
import { BaseCanvas } from '../components/BaseCanvas';

const Page = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // hydrate from url once
  useEffect(() => {
    const q = searchParams.get('search');
    const cat = searchParams.get('category');
    if (q) setSearchQuery(q);
    if (cat) setActiveCategory(cat);
  }, [searchParams]);

  const updateUrl = (nextSearch: string, nextCategory: string) => {
    const params = new URLSearchParams();
    if (nextSearch.trim()) params.set('search', nextSearch.trim());
    if (nextCategory !== 'all') params.set('category', nextCategory);
    router.replace(`/layanan${params.toString() ? `?${params.toString()}` : ''}`);
  };

  // Filter services based on search query with priority matching
  const filteredServices = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    return services.filter((service) => {
      const matchesCategory =
        activeCategory === 'all' || service.category === activeCategory;

      if (!query) return matchesCategory;

      const matchesName = service.name.toLowerCase().includes(query);
      const matchesDesc = service.description.toLowerCase().includes(query);
      const matchesCategoryText = service.category.toLowerCase().includes(query);
      return matchesCategory && (matchesName || matchesDesc || matchesCategoryText);
    });
  }, [activeCategory, searchQuery]);

  const filteredCategories = useMemo(() => {
    const visible = categories.filter((category) =>
      filteredServices.some((service) => service.category === category),
    );
    return visible.length ? visible : categories;
  }, [filteredServices]);
  return (
    <BaseCanvas withBottomNav={true} centerContent={false} padding='px-0'>
      {/* Top Bar */}
      <TopBar
        backHref='/home'
        text='Layanan Kami'
        textClassName='text-b2 text-black'
      />

      {/* Main Content Container */}
      <div className='w-full px-6 pt-4'>
        {/* Search Section */}
        <div className='mb-4'>
          <div className='mx-auto w-full max-w-full rounded-3xl border border-gray-300 px-4 py-2 flex items-center gap-3'>
            <Image
              src='/search.svg'
              alt='Search'
              width={20}
              height={20}
              className='h-5 w-5 flex-shrink-0'
              aria-hidden='true'
            />
            <input
              className='flex-1 outline-none text-b2 placeholder:text-gray-400'
              placeholder='Cari layanan...'
              value={searchQuery}
              onChange={(e) => {
                const next = e.target.value;
                setSearchQuery(next);
                updateUrl(next, activeCategory);
              }}
            />
            <button
              aria-label='Bersihkan'
              className={`h-6 w-6 grid place-items-center flex-shrink-0 ${
                searchQuery ? 'opacity-100' : 'opacity-0'
              }`}
              onClick={() => {
                setSearchQuery('');
                updateUrl('', activeCategory);
              }}
            >
              <Image
                src='/close-circle.svg'
                alt='Close'
                width={18}
                height={18}
                className='h-5 w-5'
                aria-hidden='true'
              />
            </button>
          </div>
        </div>

        {/* Category filter pills */}
        <div className='flex gap-2 overflow-x-auto no-scrollbar pb-3'>
          {[{ label: 'Semua', value: 'all' }, ...categories.map((c) => ({ label: c, value: c }))].map((cat) => (
            <button
              key={cat.value}
              type='button'
              onClick={() => {
                setActiveCategory(cat.value);
                updateUrl(searchQuery, cat.value);
              }}
              className={`px-3 py-1 rounded-full border text-b3 whitespace-nowrap transition-colors ${
                activeCategory === cat.value
                  ? 'border-[#0082C9] bg-[#E8F6FF] text-[#0082C9]'
                  : 'border-[#D4D4D4] text-[#141414]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Service Categories */}
        {filteredCategories.length > 0 ? (
          filteredCategories.map((cat) => (
            <section key={cat} className='mb-8'>
              <h2 className='text-sh3 mb-4 text-black'>{cat}</h2>
              <ul role='list'>
                {filteredServices
                  .filter((s) => s.category === cat)
                  .map((s) => (
                    <li key={s.slug}>
                      <Link
                        href={`/layanan/${s.slug}`}
                        className='flex items-center gap-4 rounded-2xl bg-white hover:bg-gray-50 active:bg-gray-100 transition-colors p-1'
                      >
                        <Image
                          src={
                            s.name === 'Pipa Mampet'
                              ? '/pipa-mampet.svg'
                              : s.name === 'Penggantian Keran/Shower'
                              ? '/penggantian-kran.svg'
                              : s.name === 'Perbaikan Kloset/Toilet'
                              ? '/perbaikan-kloset.svg'
                              : s.name === 'Penggantian Stop Kontak & Saklar'
                              ? '/penggantian-stopkontak.svg'
                              : s.name === 'Pemasangan Lampu & Fitting'
                              ? '/pemasangan-lampu.svg'
                              : s.name === 'Pemasangan Rak Dinding/Ambalan'
                              ? '/pemasangan-rak.svg'
                              : s.name === 'Perbaikan Engsel Pintu/Lemari'
                              ? '/perbaikan-engsel.svg'
                              : s.name === 'Perbaikan Minor Interior'
                              ? '/perbaikan-minor.svg'
                              : '/layanan-umum.svg'
                          }
                          alt={s.name}
                          width={48}
                          height={48}
                          className='h-12 w-12 rounded-xl bg-[#E0F1FE] flex-shrink-0'
                        />
                        <div className='flex-1 min-w-0'>
                          <div className='text-b2m text-black leading-[20px]'>
                            {s.name}
                          </div>
                          <div className='text-b3 text-[#7D7D7D] mt-1'>
                            {s.description}
                          </div>
                        </div>
                        <span
                          aria-hidden
                          className='text-gray-400 ml-2 flex-shrink-0'
                        >
                          ›
                        </span>
                      </Link>
                    </li>
                  ))}
              </ul>
            </section>
          ))
        ) : searchQuery ? (
          <div className='text-center py-12'>
            <div className='text-gray-400 mb-2'>
              <Image
                src='/search.svg'
                alt='No results'
                width={48}
                height={48}
                className='mx-auto opacity-50'
              />
            </div>
            <h3 className='text-sh3 text-gray-600 mb-2'>Tidak ada hasil</h3>
            <p className='text-b2 text-gray-500'>
              Coba kata kunci lain seperti &ldquo;keran&rdquo;,
              &ldquo;lampu&rdquo;, atau &ldquo;pipa&rdquo;
            </p>
          </div>
        ) : null}
      </div>

      <BottomNav active='home' />
    </BaseCanvas>
  );
};

export default Page;
