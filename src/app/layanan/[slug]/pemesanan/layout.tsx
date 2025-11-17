'use client';
import Script from 'next/script';
import type { ReactNode } from 'react';
import { Suspense, useState, useEffect } from 'react';

// Extend window interface to include Google Maps
declare global {
  interface Window {
    google?: typeof google;
  }
}

function Skeleton() {
  return (
    <div className='animate-pulse'>
      <div className='w-full bg-gray-200 h-48 rounded-b-2xl' />
      <div className='p-6 space-y-4'>
        <div className='h-4 bg-gray-200 rounded w-32' />
        <div className='h-7 bg-gray-200 rounded w-2/3' />
        <div className='h-4 bg-gray-200 rounded w-1/3' />

        <div className='pt-4 space-y-3'>
          <div className='h-6 bg-gray-200 rounded w-36' />
          <div className='h-4 bg-gray-200 rounded w-full' />
          <div className='h-4 bg-gray-200 rounded w-5/6' />
        </div>

        <div className='mt-6'>
          <div className='h-12 bg-gray-200 rounded-full w-full' />
        </div>
      </div>
    </div>
  );
}

export default function Layout({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // If google maps already available, mark ready immediately
    if (typeof window !== 'undefined' && window.google) {
      setReady(true);
      return;
    }

    // Poll for google object in case script loads without firing onLoad
    const interval = setInterval(() => {
      if (window.google) {
        setReady(true);
        clearInterval(interval);
      }
    }, 300);

    // Timeout fallback: proceed after 5s even if maps didn't load
    const timeout = setTimeout(() => {
      if (!window.google) {
        console.warn('Google Maps did not load in 5s — continuing without it.');
      }
      setReady(true);
      clearInterval(interval);
    }, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  return (
    <>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
        strategy='afterInteractive'
        onLoad={() => {
          // Google Maps loaded
          setReady(true);
        }}
      />

      {/* Show skeleton until maps is ready; also use Suspense for children that may suspend */}
      {!ready ? (
        <Skeleton />
      ) : (
        <Suspense fallback={<Skeleton />}>
          {children}
        </Suspense>
      )}
    </>
  );
}
