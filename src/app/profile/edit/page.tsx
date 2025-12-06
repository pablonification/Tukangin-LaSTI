'use client';

import React, {
  useState,
  useEffect,
  Dispatch,
  SetStateAction,
  useRef,
} from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowser } from '@/lib/supabase';
import { useNotification } from '@/app/components/NotificationProvider';
import { TopBar } from '@/app/components/TopBar';
import { BaseCanvas } from '@/app/components/BaseCanvas';
import Button from '@/app/components/Button';

const EditProfilePage = () => {
  const router = useRouter();
  const supabase = getSupabaseBrowser();
  const { showError, showSuccess } = useNotification();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [image, setImage] = useState('');
  const [predictions, setPredictions] = useState<
    google.maps.places.AutocompletePrediction[]
  >([]);
  const [loading, setLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      fetch('/api/users')
        .then((res) => res.json())
        .then((data) => {
          setName(data.name || '');
          setPhone((data.phone || '').replace(/^\+62/, ''));
          setAddress(data.address || '');
          setImage(data.image || '');
        })
        .catch(() => showError('Gagal memuat data profil'));
    };
    loadUser();
  }, [supabase, showError]);

  const handleClear = (setter: Dispatch<SetStateAction<string>>) => () =>
    setter('');

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (!val.startsWith('+62')) {
      const digits = val.replace(/\D/g, '');
      val = '+62' + digits;
    }
    const withoutPrefix = val.replace(/^\+62/, '');
    setPhone(withoutPrefix);
  };

  // --- Google Autocomplete ---
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setAddress(val);

    if (window.google && window.google.maps && val.length > 2) {
      const service = new google.maps.places.AutocompleteService();
      service.getPlacePredictions({ input: val }, (preds: google.maps.places.AutocompletePrediction[] | null) => {
        setPredictions(preds || []);
      });
    } else {
      setPredictions([]);
    }
  };

  const handlePredictionClick = (
    p: google.maps.places.AutocompletePrediction,
  ) => {
    const service = new google.maps.places.PlacesService(
      document.createElement('div'),
    );
    service.getDetails({ placeId: p.place_id }, (place: google.maps.places.PlaceResult | null, status: google.maps.places.PlacesServiceStatus) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && place) {
        const formatted = place.formatted_address ?? p.description;
        setAddress(formatted);
        if (inputRef.current) inputRef.current.value = formatted;
        setPredictions([]);
      }
    });
  };

  const handleSave = async () => {
    if (!name.trim() || !phone.trim() || !address.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, address }),
      });
      if (!res.ok) throw new Error();
      showSuccess('Profil berhasil diperbarui');
      router.back();
    } catch {
      showError('Gagal menyimpan perubahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseCanvas centerContent={false} padding='px-0'>
      <TopBar
        backHref='/profile'
        text='Edit Profil'
        textClassName='text-sh2b text-[#141414]'
      />
      <div className='w-full px-6 py-6 flex flex-col gap-4'>
        <div className='flex justify-center'>
          <div className='h-24 w-24 rounded-full bg-[#EEEEEE] overflow-hidden grid place-items-center'>
            {image ? (
              <Image
                src={image}
                alt='Foto profil'
                width={96}
                height={96}
                className='object-cover'
              />
            ) : (
              <Image
                src='/image-grey.svg'
                alt='Avatar'
                width={48}
                height={48}
              />
            )}
          </div>
        </div>

        {/* Name */}
        <div className='flex flex-col gap-1'>
          <label htmlFor='name' className='text-b3 text-[#141414]'>
            Nama Lengkap
          </label>
          <div className='relative'>
            <input
              id='name'
              value={name}
              onChange={(e) => setName(e.target.value)}
              className='w-full border-b border-[#7D7D7D] pb-1 pr-8 text-sh3'
            />
            {name && (
              <button
                onClick={handleClear(setName)}
                className='absolute right-0 top-1/2 transform -translate-y-1/2'
              >
                <Image
                  src='/close-circle.svg'
                  alt='Clear'
                  width={20}
                  height={20}
                />
              </button>
            )}
          </div>
        </div>

        {/* Phone */}
        <div className='flex flex-col gap-1'>
          <label htmlFor='phone' className='text-b3 text-[#141414]'>
            Nomor Telepon
          </label>
          <div className='relative'>
            <input
              id='phone'
              type='tel'
              value={'+62' + phone}
              onChange={handlePhoneChange}
              className='w-full border-b border-[#D4D4D4] pb-1 text-sh3 outline-none'
            />
            {phone && (
              <button
                onClick={handleClear(setPhone)}
                className='absolute right-0 top-1/2 transform -translate-y-1/2'
              >
                <Image
                  src='/close-circle.svg'
                  alt='Clear'
                  width={20}
                  height={20}
                />
              </button>
            )}
          </div>
        </div>

        {/* Address */}
        <div className='flex flex-col gap-1 relative'>
          <label htmlFor='address' className='text-b3 text-[#141414]'>
            Alamat
          </label>
          <input
            ref={inputRef}
            id='address'
            type='text'
            value={address}
            onChange={handleAddressChange}
            className='w-full border-b border-[#D4D4D4] pb-1 text-sh3 outline-none'
          />
          {address && (
            <button
              onClick={handleClear(setAddress)}
              className='absolute right-0 top-1/2 transform -translate-y-1/2'
            >
              <Image
                src='/close-circle.svg'
                alt='Clear'
                width={20}
                height={20}
              />
            </button>
          )}
          {predictions.length > 0 && (
            <ul className='absolute bg-white border rounded-xl shadow-md mt-1 w-full z-10 max-h-60 overflow-auto'>
              {predictions.map((p) => (
                <li
                  key={p.place_id}
                  onClick={() => handlePredictionClick(p)}
                  className='px-4 py-2 hover:bg-gray-100 cursor-pointer'
                >
                  {p.description}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className='mt-auto px-6 pb-6'>
        <Button
          variant='custom'
          size='lg'
          className='bg-[#0082C9] text-[#FAFAFA] hover:bg-[#0082C9]/80'
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
        </Button>
      </div>
    </BaseCanvas>
  );
};

export default EditProfilePage;
