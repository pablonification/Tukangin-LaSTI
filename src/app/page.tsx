import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { unstable_cache } from 'next/cache';

export default async function Home() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/welcome');
  }
  const userId = session?.user.id;

  const getUserIsNew = unstable_cache(
    async () =>
      prisma.users.findUnique({
        select: { isNew: true },
        where: { id: userId },
      }),
    [`user-isnew-${userId}`],
    { revalidate: 30, tags: [`user:${userId}`] },
  );

  const user = await getUserIsNew();
  if (user?.isNew) {
    redirect('/profile/name');
  }
  redirect('/home');
}
