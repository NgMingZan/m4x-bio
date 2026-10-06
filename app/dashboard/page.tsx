import { supabaseServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Editor from './editor';
import ShopPayment from './shop-payment';

export const dynamic = 'force-dynamic';

export default async function Dashboard({
  searchParams
}: {
  searchParams: Promise<{ payment?: string }>
}) {
  const s = await supabaseServer();

  const {
    data: { user }
  } = await s.auth.getUser();

  if (!user) redirect('/login');

  const [
    { data: p },
    { data: links },
    { data: products }
  ] = await Promise.all([
    s.from('profiles').select('*').eq('id', user.id).single(),
    s.from('links').select('*').eq('user_id', user.id).order('sort'),
    s.from('products').select('*').eq('user_id', user.id).order('created_at')
  ]);

  if (!p) redirect('/register');

  const { payment } = await searchParams;

  return (
    <main className="dashboardShell">
      <header className="dashHead">
        <div>
          <p className="label">M4X BIO / EDITOR</p>
          <h1>Tùy chỉnh Bio</h1>
          <p className="muted">
            @{p.username} · thay đổi sẽ hiển thị trên trang công khai.
          </p>
        </div>
      </header>

      {payment && !p.shop_enabled && (
        <ShopPayment code={payment.toUpperCase()} />
      )}

      <Editor
        profile={p}
        initialLinks={links || []}
        initialProducts={products || []}
      />
    </main>
  );
}
