import MusicPlayer from './music-player';
import ProductShop from './product-shop';
import Link from 'next/link';
import {supabaseServer} from '@/lib/supabase/server';
import {notFound} from 'next/navigation';

export const dynamic='force-dynamic';

export default async function Public({params}:{params:Promise<{username:string}>}){
  const {username}=await params;
  const s=await supabaseServer();
  const {data:p}=await s.from('profiles').select('*').eq('username',username).single();
  if(!p) notFound();

  const [{data:links},{data:products}]=await Promise.all([
    s.from('links').select('*').eq('profile_username',username).eq('visible',true).order('sort'),
    s.from('products').select('*').eq('user_id',p.id).eq('visible',true).order('created_at')
  ]);

  const initials=(p.display_name||p.username).slice(0,2).toUpperCase();

  return <main className="m4xSys">
    <div className="sysTop">
      <span>M4X_SYS // PROFILE</span>
      <span className="sysLive"><i/> SYSTEM_ONLINE</span>
    </div>

    <section className="sysHero">
      <div className="sysGlow"/>
      <div className="sysAvatar">
        {p.avatar_url?<img src={p.avatar_url} alt="avatar"/>:<b>{initials}</b>}
        <span/>
      </div>
      <div className="sysIdentity">
        <p className="sysEyebrow">IDENTITY / @{p.username}</p>
        <h1>{p.display_name}</h1>
        <p>{p.bio||'Chưa có giới thiệu.'}</p>
        <div className="sysTags"><span>DEVELOPER</span><span>SYSADMIN</span><span>ONLINE</span></div>
      </div>
    </section>

    <section className="sysBlock">
      <div className="sysTitle"><span>01</span><b>NETWORK_LINKS</b><small>{String(links?.length||0).padStart(2,'0')}</small></div>
      <div className="sysLinks">
        {links?.map((x,i)=><a href={x.url} target="_blank" rel="noreferrer" key={x.id}>
          <span className="sysIndex">{String(i+1).padStart(2,'0')}</span>
          <div><b>{x.label}</b><small>{x.url}</small></div><i>↗</i>
        </a>)}
      </div>
    </section>

    {p.music_url&&<section className="sysBlock">
      <div className="sysTitle"><span>02</span><b>AUDIO_STREAM</b><small>LIVE</small></div>
      <MusicPlayer title={p.music_title||'Music'} artist={p.music_artist||p.display_name} url={p.music_url} cover={p.music_cover_url}/>
    </section>}

    {p.shop_enabled&&<section className="sysBlock sysShop">
      <div className="sysTitle"><span>03</span><b>DIGITAL_STORE</b><small>{String(products?.length||0).padStart(2,'0')}</small></div>
      <ProductShop products={products||[]} profile={p}/>
    </section>}

    {p.qr_url&&<section className="sysBlock sysDonate">
      <div className="sysTitle"><span>04</span><b>SUPPORT_NODE</b><small>VQR</small></div>
      <div className="sysQr"><img src={p.qr_url} alt="VietQR"/><div><b>{p.bank_name}</b><span>{p.bank_account}</span><small>{p.bank_holder}</small></div></div>
    </section>}

    <section className="sysCreate">
      <div><span>CREATE_NODE</span><b>Tạo Bio của riêng bạn</b></div>
      <Link href="/register">KHỞI TẠO →</Link>
    </section>

    <footer className="sysFooter"><span>© 2026 {p.display_name}</span><span>M4X BIO // BUILD_04</span></footer>
  </main>
}
