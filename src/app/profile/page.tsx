import Image from 'next/image';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import type { Metadata } from 'next';
import { BottomNav } from '@/app/components/BottomNav';
import { BaseCanvas } from '@/app/components/BaseCanvas';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import LogoutButton from '../components/LogoutButton';

export const metadata: Metadata = {
  title: 'Profil Anda',
  description: 'Kelola informasi profil dan pengaturan akun Anda.',
};

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  const user = userId
    ? await prisma.users.findUnique({
        where: { id: userId },
        select: { name: true, email: true, phone: true, image: true },
      })
    : null;

  const displayName = user?.name ?? 'Nama Lengkap';
  const displayPhone = user?.phone ?? '+6281234567890';
  const displayEmail = user?.email ?? 'email@domain.com';

  return (
    <BaseCanvas withBottomNav={true} centerContent={false} padding='px-0'>
      {/* Header */}
      <header className='pt-6 pb-3 px-6 border-b border-[#D4D4D4] bg-white'>
        <h1 className='text-sh2b text-[#141414]'>Profil Anda</h1>
      </header>

      {/* Content */}
      <div className='w-full px-6 py-6 flex flex-col gap-6'>
        {/* Profile block */}
        <div className='flex items-center gap-5'>
          <div className='h-21 w-21 min-w-21 rounded-full bg-[#EEEEEE] overflow-hidden grid place-items-center'>
            {user?.image ? (
              <Image
                src={user.image}
                alt='Foto profil'
                width={84}
                height={84}
                className='h-21 w-21 object-cover'
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
          <div className='flex-1 min-w-0'>
            <div className='text-b1b text-[#141414] truncate'>
              {displayName}
            </div>
            <div className='text-b3 text-[#7D7D7D] truncate'>
              {displayPhone}
            </div>
            <div className='text-b3 text-[#7D7D7D] truncate'>
              {displayEmail}
            </div>
          </div>
          <Link
            href='/profile/edit'
            aria-label='Ubah profil'
            className='h-10 w-10 grid place-items-center rounded-xl'
          >
            {/* pencil icon */}
            <Image src='/edit.svg' alt='Pencil' width={24} height={24} />
          </Link>
        </div>

        {/* Settings */}
        <section className='bg-white rounded-3xl'>
          <h2 className='text-sh3b text-[#141414] mb-2'>Pengaturan Lain</h2>
          <div className='divide-y divide-[#EEEEEE] rounded-2xl border border-[#D4D4D4] bg-white'>
            <Link
              href='#'
              className='flex items-center justify-between px-3 py-3'
            >
              <div className='flex items-center gap-3'>
                <div className='h-9 w-9 rounded-full bg-[#E0F1FE] grid place-items-center'>
                  <Image
                    src='/pusat-bantuan.svg'
                    alt='Pusat Bantuan'
                    width={20}
                    height={20}
                  />
                </div>
                <span className='text-b2m text-[#141414]'>Pusat Bantuan</span>
              </div>
              <Image
                src='/arrow-right.svg'
                alt=''
                width={20}
                height={20}
                aria-hidden
                className='opacity-60'
              />
            </Link>
            <Link
              href='#'
              className='flex items-center justify-between px-3 py-3'
            >
              <div className='flex items-center gap-3'>
                <div className='h-9 w-9 rounded-full bg-[#E0F1FE] grid place-items-center'>
                  <Image
                    src='/feedback.svg'
                    alt='Feedback'
                    width={20}
                    height={20}
                  />
                </div>
                <span className='text-b2m text-[#141414]'>Feedback</span>
              </div>
              <Image
                src='/arrow-right.svg'
                alt=''
                width={20}
                height={20}
                aria-hidden
                className='opacity-60'
              />
            </Link>
          </div>
        </section>

        {/* Social */}
        <section>
          <h2 className='text-sh3b text-[#141414] mb-3'>Temukan Kami di</h2>
          <div className='flex items-center gap-2'>
            {[
              { label: 'Instagram', href: '#', icon: 'instagram.svg' },
              { label: 'Facebook', href: '#', icon: 'facebook.svg' },
              { label: 'YouTube', href: '#', icon: 'youtube.svg' },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                aria-label={item.label}
                className='h-13 w-13 rounded-full bg-[#E0F1FE] grid place-items-center text-[#0082C9] text-b1b'
              >
                <Image
                  src={item.icon}
                  alt={item.label}
                  width={24}
                  height={24}
                />
              </a>
            ))}
          </div>
        </section>

        {/* Logout */}
        <div className='pt-1'>
          <LogoutButton />
        </div>
      </div>

      <BottomNav active='profile' />
    </BaseCanvas>
  );
}
