'use client';

import Button from '@/app/components/Button';
import { signOut } from 'next-auth/react';

const LogoutButton = () => {
  return (
    <Button
      variant="custom"
      size="lg"
      className="bg-[#EEEEEE] text-[#EF4547] hover:bg-[#EEEEEE]"
      onClick={() => signOut({ callbackUrl: '/' })}
    >
      Keluar
    </Button>
  );
};

export default LogoutButton;


