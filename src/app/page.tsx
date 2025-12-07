import { redirect } from 'next/navigation';
import { getSupabaseServer } from '@/lib/supabaseServer';

export default async function Home() {
  const supabase = await getSupabaseServer();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/welcome');
  }

  // Temporarily disabled user new check
  // const getUserIsNew = unstable_cache(
  //   async () => {
  //     const { data } = await supabase
  //       .from('Users')
  //       .select('is_new')
  //       .eq('id', user.id)
  //       .single();
  //     return data;
  //   },
  //   [`user-isnew-${user.id}`],
  //   { revalidate: 30, tags: [`user:${user.id}`] },
  // );
  // const userData = await getUserIsNew();
  // if (userData?.is_new) {
  //   redirect('/profile/name');
  // }
  redirect('/home');
}
