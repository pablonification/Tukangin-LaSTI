'use client';

import { useState, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useFormStore } from '@/app/store/formStore';

interface LocationAutocompleteProps {
  slug: string;
}

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

export const LocationAutocomplete = ({ slug }: LocationAutocompleteProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { setForm } = useFormStore();

  const handleSearch = async (q: string) => {
    setQuery(q);
    setError('');
    if (q.length < 3) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&addressdetails=1&limit=5`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Network error');
      const data: NominatimResult[] = await res.json();
      setResults(data);
    } catch {
      setError('Gagal mengambil data lokasi');
    }
    setLoading(false);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleSearch(e.target.value);
  };

  const handleSelect = (place: NominatimResult) => {
    setForm({
      locationName: place.display_name,
      locationAddress: place.display_name,
      latitude: place.lat,
      longitude: place.lon,
    });
    setQuery(place.display_name);
    setResults([]);
    router.push(
      `/layanan/${slug}/pemesanan/detail?locationName=${encodeURIComponent(
        place.display_name
      )}&locationAddress=${encodeURIComponent(place.display_name)}`
    );
  };

  return (
    <div className="mt-4">
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        placeholder="Cari alamat atau lokasi..."
        className="w-full border rounded-xl p-2"
        autoComplete="off"
      />
      {loading && <div className="text-b3 mt-2">Memuat...</div>}
      {error && <div className="text-red-500 text-b3 mt-2">{error}</div>}
      {results.length > 0 && (
        <ul className="bg-white border rounded-xl mt-2 shadow">
          {results.map((place) => (
            <li
              key={place.place_id}
              className="p-2 cursor-pointer hover:bg-blue-50"
              onClick={() => handleSelect(place)}
            >
              {place.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
