import MusicPlayer from './music-player';
import ProductShop from './product-shop';
import Link from 'next/link';
import {supabaseServer} from '@/lib/supabase/server';
import {notFound} from 'next/navigation';
export const dynamic='force-dynamic';
export default async function Public({params}:{params:Promise<{username:string}>}){
 const {username}=await params; const s=await supabaseServer();
 const {data:p}=await s.from('profiles').select('*').eq('username',username).single(); if(!p)notFound();
 const [{data:links},{data:products}]=await Promise.all([
  s.from('links').select('*').eq('profile_username',username).eq('visible',true).order('sort'),
  s.from('products').select('*').eq('user_id',p.id).eq('visible',true).order('created_at')
 ]);
 const initials=(p.display_name||p.username).slice(0,2).toUpperCase();
 return <main className="bioShell">
  <div className="terminal"><b>bash</b> — {p.username}@m4x:~ <span>▋</span></div>
  <section className="hero"><div className="avatarWrap">{p.avatar_url?<img className="avatar avatarImg" src={p.avatar_url} alt="avatar"/>:<div className="avatar">{initials}</div>}<div className="frame"/><i className="dot"/></div><h1 className="name">{p.display_name} <em>✦</em></h1><div className="handle">@{p.username} · Việt Nam</div><div className="tech"><span>C++</span><span>JS</span><span>HTML</span><span>CSS</span><span>Git</span></div><p className="intro">{p.bio||'Chưa có giới thiệu.'}</p></section>
  <section className="section"><p className="label">STATUS</p><div className="status"><div className="mini">{initials}</div><div><b>{p.display_name}</b><small>{p.status_text||'Đang online · Có thể nhắn mình'}</small></div><span className="online">● ONLINE</span></div></section>
  {p.music_url&&<section className="section"><p className="label">MUSIC · PLAYER</p><MusicPlayer title={p.music_title||'Music'} artist={p.music_artist||p.display_name} url={p.music_url} cover={p.music_cover_url}/></section>}
  <section className="section"><p className="label">MẠNG XÃ HỘI · {links?.length||0}</p><div className="links">{links?.map(x=><a href={x.url} target="_blank" rel="noreferrer" key={x.id}><span className="socialIcon">{x.label.slice(0,1)}</span><span><b>{x.label}</b><small>{x.url}</small></span><i>↗</i></a>)}</div>{p.qr_url&&<div className="card donatePublic"><b>☕ Ủng hộ / VietQR</b><img className="qrPreview" src={p.qr_url} alt="VietQR"/><small>{p.bank_name} · {p.bank_account} · {p.bank_holder}</small></div>}</section>
  {p.shop_enabled&&<section className="section"><p className="label">SẢN PHẨM · {products?.length||0}</p><ProductShop products={products || []} profile={p}/></section>}
  <section className="create"><div className="spark">✦</div><h2>Tạo Bio của riêng bạn</h2><p>Tạo trang cá nhân M4X BIO của bạn.</p><Link href="/register">Tạo Bio miễn phí →</Link><small>ĐÃ CÓ TÀI KHOẢN? <Link href="/login">ĐĂNG NHẬP</Link></small></section><footer>© 2026 {p.display_name} · Built with M4X BIO</footer>
 </main>
}
