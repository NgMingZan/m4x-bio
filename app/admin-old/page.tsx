import Link from 'next/link';
import { admin } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/admin';
import Editor from '@/app/dashboard/editor';
import { markOrder, setShop, setUserLock } from './actions';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const me = await requireAdmin();
  const db = admin();

  let { data: myProfile } = await db.from('profiles').select('*').eq('id', me.id).maybeSingle();
  if (!myProfile) {
  let username = 'm4x';

  const { data: existing } = await db
    .from('profiles')
    .select('*')
    .eq('id', me.id)
    .maybeSingle();

  if (existing) {
    myProfile = existing;
  } else {
    const { data: taken } = await db
      .from('profiles')
      .select('id')
      .eq('username', username)
      .maybeSingle();

    if (taken) username = `m4x-${me.id.slice(0, 6)}`;

    const { data: created, error } = await db
      .from('profiles')
      .upsert({
        id: me.id,
        username,
        display_name: 'LO',
        bio: 'Xin chào, mình là LO. Đây là góc nhỏ của mình trên Internet — nơi mình xây dựng M4X.',
        shop_enabled: true,
      }, { onConflict: 'id' })
      .select()
      .single();

    if (error) throw new Error(error.message);
    myProfile = created;
  }
}

  const [{ data: myLinks }, { data: myProducts }, { data: profiles }, { data: orders }, usersRes] = await Promise.all([
    db.from('links').select('*').eq('user_id', me.id).order('sort'),
    db.from('products').select('*').eq('user_id', me.id).order('created_at'),
    db.from('profiles').select('id,username,display_name,shop_enabled,created_at').order('created_at', { ascending: false }),
    db.from('orders').select('*').order('created_at', { ascending: false }).limit(100),
    db.auth.admin.listUsers({ page: 1, perPage: 100 }),
  ]);

  const users = usersRes.data?.users || [];
  const emailById = new Map(users.map(u => [u.id, u.email || '']));
  const bannedById = new Map(users.map(u => [u.id, !!u.banned_until && new Date(u.banned_until).getTime() > Date.now()]));

  return <main className="dashboardShell adminPage">
    <div className="adminHead"><div><p className="label">M4X SYSTEM / OWNER</p><h1>Admin + Bio Editor</h1><p className="muted">{me.email} · chỉnh Bio của bạn ngay bên dưới.</p></div><Link className="btn" href={`/${myProfile.username}`}>Mở Bio</Link></div>

    <section className="ownerEditor"><div className="sectionTitle"><div><span>OWNER</span><h2>Bio của tôi</h2></div></div><Editor profile={myProfile} initialLinks={myLinks || []} initialProducts={myProducts || []}/></section>

    <div className="adminManageTitle"><p className="label">M4X SYSTEM</p><h2>Quản trị hệ thống</h2></div>
    <section className="card"><h2>Tài khoản · {profiles?.length || 0}</h2><div className="adminList">{profiles?.map(p => {
      const banned = bannedById.get(p.id) || false;
      return <div className="adminRow" key={p.id}><div><b>@{p.username}</b><small>{emailById.get(p.id) || '—'} · {p.shop_enabled ? 'Shop ✓' : 'Shop khóa'}</small></div><div className="adminActions">
        <Link href={`/${p.username}`}>Bio</Link>
        <form action={setShop}><input type="hidden" name="id" value={p.id}/><input type="hidden" name="enabled" value={String(!p.shop_enabled)}/><button>{p.shop_enabled ? 'Thu Shop' : 'Cấp Shop'}</button></form>
        {p.id !== me.id && <form action={setUserLock}><input type="hidden" name="id" value={p.id}/><input type="hidden" name="lock" value={String(!banned)}/><button>{banned ? 'Mở khóa' : 'Khóa'}</button></form>}
      </div></div>})}</div></section>
    <section className="card"><h2>Đơn hàng</h2><div className="adminList">{orders?.length ? orders.map(o => <div className="adminRow" key={o.id}><div><b>{o.code}</b><small>{Number(o.amount).toLocaleString('vi-VN')}đ · {o.feature} · {o.status}</small></div><div className="adminActions">{o.status === 'pending' && <><form action={markOrder}><input type="hidden" name="id" value={o.id}/><input type="hidden" name="status" value="paid"/><button>Xác nhận</button></form><form action={markOrder}><input type="hidden" name="id" value={o.id}/><input type="hidden" name="status" value="cancelled"/><button>Hủy</button></form></>}</div></div>) : <p className="muted">Chưa có đơn.</p>}</div></section>
  </main>
}
