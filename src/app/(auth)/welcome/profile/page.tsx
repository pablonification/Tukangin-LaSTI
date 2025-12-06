'use client';
import { useState, useEffect, useRef } from 'react';
import { TopBar } from '../../../components/TopBar';
import Button from '../../../components/Button';
import { StickyActions } from '../../../components/StickyActions';
import { getSupabaseBrowser } from '@/lib/supabase';
import { useNotification } from '@/app/components/NotificationProvider';
import { BaseCanvas } from '../../../components/BaseCanvas';

const NamePage = () => {
  const supabase = getSupabaseBrowser();
  const { showError } = useNotification();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
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

      setLoading(true);
      fetch(`/api/users`)
        .then((res) => res.json())
        .then((data) => {
          if (data?.name) setFullName(data.name);
          if (data?.phone) setPhone(data.phone);
          if (data?.address) setAddress(data.address);
        })
        .finally(() => setLoading(false));
    };
    loadUser();
  }, [supabase]);

  // autocomplete
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

  const handleNext = async () => {
    if (!fullName.trim() || !phone.trim() || !address.trim()) return;
    setLoading(true);

    try {
      const [changeUserResponse, changeIsNewResponse] = await Promise.all([
        fetch('/api/users', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: fullName.trim(),
            phone: phone.trim(),
            address: address.trim(),
          }),
          credentials: 'include',
        }),
        fetch('/api/users/new', { method: 'PATCH', credentials: 'include' }),
      ]);

      const parseJsonSafe = async (res: Response) => {
        try {
          return await res.json();
        } catch {
          return { error: 'Unknown error' };
        }
      };

      if (changeUserResponse.ok && changeIsNewResponse.ok) {
        window.location.href = '/home';
      } else {
        const err1 = await parseJsonSafe(changeUserResponse);
        const err2 = await parseJsonSafe(changeIsNewResponse);
        const errors = [];
        if (!changeUserResponse.ok) errors.push(err1.error);
        if (!changeIsNewResponse.ok) errors.push(err2.error);
        showError(errors.join('\n'), 'Update Failed');
      }
    } catch (e) {
      console.error(e);
      showError('Something went wrong. Please try again.', 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseCanvas centerContent={false} padding='px-0'>
      <TopBar backHref='/welcome' text='Lengkapi Profil Anda' />
      <div className='w-full'>
        <div className='px-6 pt-10'>
          <h1 className='text-sh1b text-left text-black mb-1'>
            Lengkapi Profil Anda
          </h1>
          <p className='text-b2 text-left text-black mb-4'>
            Nama lengkap, nomor telepon, dan alamat diperlukan untuk melanjutkan
          </p>
          <div className='mb-6'>
            <input
              type='text'
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder='Masukkan nama lengkap Anda'
              className='w-full h-[55px] rounded-2xl border border-[#D4D4D4] px-4 text-b1'
              disabled={loading}
            />
          </div>
          <div className='mb-6'>
            <input
              type='tel'
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder='Masukkan nomor telepon Anda'
              className='w-full h-[55px] rounded-2xl border border-[#D4D4D4] px-4 text-b1'
              disabled={loading}
            />
          </div>
          <div className='mb-28 relative'>
            <input
              ref={inputRef}
              type='text'
              value={address}
              onChange={handleAddressChange}
              placeholder='Masukkan alamat Anda'
              className='w-full h-[55px] rounded-2xl border border-[#D4D4D4] px-4 text-b1'
              disabled={loading}
            />
            {predictions.length > 0 && (
              <ul className='absolute bg-white border rounded-xl shadow-md mt-2 w-full z-10'>
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
      </div>
      <StickyActions className='border-t border-white'>
        <Button
          variant='primary'
          size='lg'
          onClick={handleNext}
          disabled={
            !fullName.trim() || !phone.trim() || !address.trim() || loading
          }
          className={
            !fullName.trim() || !phone.trim() || !address.trim() || loading
              ? 'opacity-50 cursor-not-allowed mb-10'
              : 'mb-10'
          }
        >
          Selanjutnya
        </Button>
      </StickyActions>
    </BaseCanvas>
  );
};

export default NamePage;
