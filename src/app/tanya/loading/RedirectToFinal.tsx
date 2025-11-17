"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const RedirectToFinal = () => {
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => {
      router.push('/tanya/final');
    }, 2000);

    return () => clearTimeout(t);
  }, [router]);

  return null;
};

export default RedirectToFinal;



