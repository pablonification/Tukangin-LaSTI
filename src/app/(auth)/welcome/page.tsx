'use client';
import Image from 'next/image';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BaseCanvas } from '../../components/BaseCanvas';
import Button from '../../components/Button';
import { getSupabaseBrowser } from '@/lib/supabase';

const WelcomePage = () => {
  const supabase = getSupabaseBrowser();
  const router = useRouter();

  // If already logged in (including after OAuth redirect), go to home
  useEffect(() => {
    let cancelled = false;

    supabase.auth.getUser().then(({ data }: { data: { user: unknown } }) => {
      if (!cancelled && data.user) {
        router.replace('/');
      }
    });

    return () => {
      cancelled = true;
    };
  }, [router, supabase]);

  const handleGoogleLogin = async () => {
    const origin = window.location.origin;
    const next = '/';

    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
  };

  return (
    <BaseCanvas>
      {/* Logo/Icon */}
      <div>
        <Image src="/tukangin.svg" alt="Logo" width={80} height={80} />
      </div>

      <h1 className='text-sh1b text-center text-black mb-10 leading-tight'>
        Tukang Terpercaya, Harga
        <br />
        Pasti, Masalah Teratasi.
      </h1>

      <Button
        variant='primary'
        size='lg'
        onClick={handleGoogleLogin}
      >
        <Image src='/google.svg' alt='Google icon' width={24} height={24} />
        <span>Log In with Google Account</span>
      </Button>
    </BaseCanvas>
  );
};

export default WelcomePage;
