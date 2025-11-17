'use client';

import { use, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { StickyActions } from '../../../components/StickyActions';
import { TopBar } from '../../../components/TopBar';
import { useFormStore } from '@/app/store/formStore';
import { services } from '@/lib/data';
import { BaseCanvas } from '../../../components/BaseCanvas';

interface PageProps {
  params: Promise<{ slug: string }>;
}

const Page = ({ params }: PageProps) => {
  const { slug } = use(params);
  const { setForm } = useFormStore();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [predictions, setPredictions] = useState<
    google.maps.places.AutocompletePrediction[]
  >([]);
  const [geoStatus, setGeoStatus] = useState<
    'idle' | 'requesting' | 'granted' | 'denied' | 'error'
  >('idle');

  useEffect(() => {
    const svc = services.find((s) => s.slug === slug);
    if (svc) {
      setForm({ serviceName: svc.name, slug: svc.slug });
    } else {
      router.replace('/layanan/not-found');
    }
  }, [slug, setForm, router]);

  // Geolocation request function (call on-demand)
  const requestGeolocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus('error');
      return;
    }

    setGeoStatus('requesting');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setGeoStatus('granted');

        // Try reverse geocoding using Google Maps if available
        if (
          window.google &&
          window.google.maps &&
          window.google.maps.Geocoder
        ) {
          try {
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode(
              { location: { lat, lng } },
              (results: google.maps.GeocoderResult[] | null) => {
                const first = results && results[0];
                const formatted =
                  first?.formatted_address ||
                  `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
                const main =
                  first?.address_components?.[0]?.long_name || formatted;

                // Pre-fill input and show a synthetic prediction at top
                if (inputRef.current) inputRef.current.value = formatted;
                const geoPrediction = {
                  place_id: 'geo',
                  structured_formatting: {
                    main_text: main,
                    secondary_text: formatted,
                  },
                } as unknown as google.maps.places.AutocompletePrediction;

                setPredictions((prev) => [geoPrediction, ...prev]);
              },
            );
          } catch {
            const formatted = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
            if (inputRef.current) inputRef.current.value = formatted;
            const geoPrediction = {
              place_id: 'geo',
              structured_formatting: {
                main_text: 'Your location',
                secondary_text: formatted,
              },
            } as unknown as google.maps.places.AutocompletePrediction;
            setPredictions((prev) => [geoPrediction, ...prev]);
          }
        } else {
          const formatted = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
          if (inputRef.current) inputRef.current.value = formatted;
          const geoPrediction = {
            place_id: 'geo',
            structured_formatting: {
              main_text: 'Your location',
              secondary_text: formatted,
            },
          } as unknown as google.maps.places.AutocompletePrediction;
          setPredictions((prev) => [geoPrediction, ...prev]);
        }
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setGeoStatus('denied');
        } else {
          setGeoStatus('error');
        }
      },
      { enableHighAccuracy: true, timeout: 5000 },
    );
  };

  const handleInput = () => {
    if (!window.google || !window.google.maps?.places || !inputRef.current)
      return;

    const service = new window.google.maps.places.AutocompleteService();
    service.getPlacePredictions(
      { input: inputRef.current.value, types: ['geocode'] },
      (preds) => {
        if (preds) setPredictions(preds);
      },
    );
  };

  // pilih salah satu hasil
  const handleSelect = (
    prediction: google.maps.places.AutocompletePrediction,
  ) => {
    // If this is our synthetic geo prediction, handle directly
    if (prediction.place_id === 'geo') {
      const formatted =
        prediction.structured_formatting.secondary_text ||
        prediction.structured_formatting.main_text;
      setForm({
        locationName: prediction.structured_formatting.main_text,
        locationAddress: formatted,
      });
      router.push(`/layanan/${slug}/pemesanan/detail`);
      return;
    }

    if (!window.google || !window.google.maps?.places) return;

    const service = new window.google.maps.places.PlacesService(
      document.createElement('div'),
    );
    service.getDetails(
      { placeId: prediction.place_id, fields: ['name', 'formatted_address'] },
      (place) => {
        if (!place) return;

        setForm({
          locationName: place.name || place.formatted_address || '',
          locationAddress: place.formatted_address || '',
        });
        router.push(`/layanan/${slug}/pemesanan/detail`);
      },
    );
  };

  return (
    <BaseCanvas centerContent={false} padding='px-0'>
      <TopBar backHref={`/layanan/${slug}`} text='Pilih Lokasi' />

      {/* Input */}
      <div className='px-6 mt-4'>
        <div className='flex items-center gap-2 h-12 px-4 rounded-full border border-[#D4D4D4] bg-white'>
          <Image src='/search.svg' alt='Cari' width={16} height={16} />
          <input
            ref={inputRef}
            type='text'
            placeholder='Cari alamat atau lokasi...'
            onChange={handleInput}
            className='flex-1 outline-none text-b2 placeholder-[#9E9E9E]'
          />
        </div>
        {/* Use my location button */}
        <div className='mt-3 flex items-center gap-3'>
          <button
            type='button'
            onClick={() => requestGeolocation()}
            className='inline-flex items-center gap-2 px-3 py-2 rounded-full bg-[#E8F6FF] text-b3 text-[#0CA2EB]'
          >
            <Image src='/gps.svg' alt='lokasi' width={16} height={16} />
            Gunakan lokasi saya
          </button>
          {geoStatus === 'requesting' && (
            <div className='text-b3 text-[#9E9E9E]'>Mencari lokasi…</div>
          )}
          {geoStatus === 'denied' && (
            <div className='text-b3 text-red-500'>
              Lokasi diblokir — silakan izinkan di pengaturan browser
            </div>
          )}
        </div>
      </div>

      {/* Hasil dari Google Autocomplete */}
      {predictions.length > 0 && (
        <ul className='px-6 mt-4 space-y-6 pb-6'>
          {predictions.map((p) => (
            <li
              key={p.place_id}
              className='flex items-center gap-3 cursor-pointer rounded-lg hover:bg-gray-100 p-2'
              onClick={() => handleSelect(p)}
            >
              <span className='grid place-items-center h-10 w-10 rounded-full bg-[#E8F6FF] flex-shrink-0'>
                <Image
                  src='/location.svg'
                  alt='Lokasi'
                  width={16}
                  height={16}
                />
              </span>
              <div className='flex-1 flex flex-col justify-center'>
                <div className='text-b2m text-black'>
                  {p.structured_formatting.main_text}
                </div>
                <div className='text-b3 text-[#7D7D7D] mt-1'>
                  {p.structured_formatting.secondary_text}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <StickyActions className='border-t border-white'>
        <> </>
      </StickyActions>
    </BaseCanvas>
  );
};

export default Page;
