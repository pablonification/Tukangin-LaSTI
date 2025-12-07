'use client';

import Button from '@/app/components/Button';
import { getSupabaseBrowser } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

const LogoutButton = () => {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = getSupabaseBrowser();
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <Button
      variant="custom"
      size="lg"
      className="bg-[#EEEEEE] text-[#EF4547] hover:bg-[#EEEEEE]"
      onClick={handleSignOut}
    >
      Keluar
    </Button>
  );
};

export default LogoutButton;


