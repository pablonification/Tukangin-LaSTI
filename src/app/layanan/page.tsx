'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useMemo } from 'react';
import { BottomNav } from '../components/BottomNav';
import { categories, services } from '../../lib/data';
import { TopBar } from '../components/TopBar';
import { BaseCanvas } from '../components/BaseCanvas';

const Page = () => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter services based on search query with priority matching
  const filteredServices = useMemo(() => {
    if (!searchQuery.trim()) {
      return services;
    }

    const query = searchQuery.toLowerCase().trim();

    // First, get exact name matches
    const exactNameMatches = services.filter((service) =>
      service.name.toLowerCase().includes(query),
    );

    // If we have exact name matches, return those
    if (exactNameMatches.length > 0) {
      return exactNameMatches;
    }

    // Otherwise, search in descriptions and categories
    return services.filter(
      (service) =>
        service.description.toLowerCase().includes(query) ||
        service.category.toLowerCase().includes(query),
    );
  }, [searchQuery]);

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) {
      return categories;
    }

    return categories.filter((category) =>
      filteredServices.some((service) => service.category === category),
    );
  }, [filteredServices, searchQuery]);
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
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              aria-label='Bersihkan'
              className={`h-6 w-6 grid place-items-center flex-shrink-0 ${
                searchQuery ? 'opacity-100' : 'opacity-0'
              }`}
              onClick={() => setSearchQuery('')}
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
