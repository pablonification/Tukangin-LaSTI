'use client';
import Image from 'next/image';
import { BaseCanvas } from '../../components/BaseCanvas';
import Button from '../../components/Button';
import { signIn } from 'next-auth/react';

const WelcomePage = () => {
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
        onClick={() => signIn('google', { redirect: true, callbackUrl: '/' })}
      >
        <Image src='/google.svg' alt='Google icon' width={24} height={24} />
        <span>Log In with Google Account</span>
      </Button>
    </BaseCanvas>
  );
};

export default WelcomePage;
