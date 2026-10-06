import { redirect } from 'next/navigation';
import { admin } from '@/lib/supabase/admin';
export const dynamic = 'force-dynamic';
export default async function Home(){
  const email=(process.env.ADMIN_EMAIL||'').trim().toLowerCase();
  if(email){
    const db=admin();
    const {data}=await db.auth.admin.listUsers({page:1,perPage:100});
    const owner=data?.users.find(u=>(u.email||'').toLowerCase()===email);
    if(owner){
      const {data:p}=await db.from('profiles').select('username').eq('id',owner.id).maybeSingle();
      if(p?.username) redirect(`/${p.username}`);
    }
  }
  redirect('/login');
}
