import Link from 'next/link';
import Image from 'next/image';

interface BottomNavProps {
  active?: 'home' | 'pesanan' | 'profile';
}

export const BottomNav = ({ active = 'home' }: BottomNavProps) => {
  const base =
    'flex flex-col items-center justify-center text-b3';
  return (
    <nav
      aria-label='Navigasi bawah'
      className='fixed left-0 right-0 bottom-0 bg-white border-t border-gray-200 z-50'
    >
      <div className='mx-auto w-full max-w-full px-4'>
        <div className='grid grid-cols-3 h-16'>
          <Link
            href='/home'
            aria-current={active === 'home' ? 'page' : undefined}
            className={`${base} ${active === 'home' ? 'text-[#0082C9]' : 'text-[#9E9E9E]'}`}
          >
            <Image
              src={active === 'home' ? '/home-active.svg' : '/home.svg'}
              alt=''
              width={24}
              height={24}
              className='h-6 w-6'
              aria-hidden='true'
            />
            <span>Home</span>
          </Link>
          <Link
            href='/pesanan'
            aria-current={active === 'pesanan' ? 'page' : undefined}
            className={`${base} ${active === 'pesanan' ? 'text-[#0082C9]' : 'text-[#9E9E9E]'}`}
          >
            <Image
              src={active === 'pesanan' ? '/pesanan-active.svg' : '/pesanan.svg'}
              alt=''
              width={24}
              height={24}
              className='h-6 w-6'
              aria-hidden='true'
            />
            <span>Pesanan</span>
          </Link>
          <Link
            href='/profile'
            aria-current={active === 'profile' ? 'page' : undefined}
            className={`${base} ${active === 'profile' ? 'text-[#0082C9]' : 'text-[#9E9E9E]'}`}
          >
            <Image
              src={active === 'profile' ? '/profile-active.svg' : '/profile.svg'}
              alt=''
              width={24}
              height={24}
              className='h-6 w-6'
              aria-hidden='true'
            />
            <span>Profil</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};
