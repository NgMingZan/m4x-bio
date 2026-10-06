import { redirect } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase/server';

export async function requireAdmin() {
  const s = await supabaseServer();
  const { data: { user } } = await s.auth.getUser();
  if (!user) redirect('/login?next=/admin');
  const allowed = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  if (!allowed || (user.email || '').toLowerCase() !== allowed) redirect('/dashboard');
  return user;
}
